/* data.jsx — mock content, graph topology, scripted runs, shared store */

/* ----------------------------- Mock emails ----------------------------- */
const EMAILS = [
  { id: 'mock-1', sender: 'john.doe@example.com', subject: 'Product Inquiry — Agentia Services',
    body: 'Hello! I am interested in Agentia. Can you please tell me about your pricing plans? Thanks!',
    kind: 'Product Inquiry', tone: 'var(--ok)' },
  { id: 'mock-2', sender: 'jane.smith@example.com', subject: 'Refund Request',
    body: 'Hi, I purchased your services yesterday but they did not meet my expectations. I would like to request a full refund of my payment.',
    kind: 'Refund Request', tone: 'var(--accent)' },
  { id: 'mock-3', sender: 'tech_guy@example.com', subject: 'Technical Support — Email Timeout',
    body: 'Hello, I am having trouble connecting my email account. The settings page keeps showing a timeout error after 30 seconds of spinning.',
    kind: 'Tech Support', tone: 'var(--info)' },
  { id: 'mock-4', sender: 'furious_biz@example.com', subject: 'URGENT: System Down Feedback',
    body: "This is unacceptable! Your system has been down for hours and I'm losing business. Fix this immediately!",
    kind: 'Furious Feedback', tone: 'var(--bad)' },
  { id: 'mock-5', sender: 'applicant@university.edu', subject: 'Summer Internship Inquiry — Software Engineering',
    body: "Dear Hiring Team, I am a junior software engineer interested in applying for a summer internship at your agency. I have built several projects using FastAPI and React, and I'd love to learn from your team.",
    kind: 'Internship Inquiry', tone: 'var(--warn)' },
  { id: 'mock-6', sender: 'spammer999@spammail.com', subject: 'CONGRATULATIONS!!! CLAIM $1000 NOW',
    body: 'CONGRATULATIONS! You have won a $1,000 gift card. Click here to claim your reward! Limited time offer!',
    kind: 'Unsolicited / Spam', tone: 'var(--fg-faint)' },
];

/* --------------------------- Graph topology --------------------------- */
/* Canvas coordinate space: 720 × 600. Node card 200 × 62. */
const NW = 200, NH = 62;
const NODES = [
  { id: 'ingest',    label: 'Inbound Ingest',  sub: 'load_inbox_emails',   icon: 'inbox',       x: 260, y: 8 },
  { id: 'classify',  label: 'AI Classifier',   sub: 'categorize_email',    icon: 'tag',         x: 260, y: 104 },
  { id: 'rag_q',     label: 'RAG Queries',     sub: 'construct_rag_queries', icon: 'sparkles',  x: 488, y: 200 },
  { id: 'retrieve',  label: 'Vector Retrieve', sub: 'retrieve_from_rag',   icon: 'database',    x: 488, y: 296 },
  { id: 'writer',    label: 'Reply Drafting',  sub: 'email_writer',        icon: 'penTool',     x: 260, y: 296 },
  { id: 'proof',     label: 'Compliance Audit',sub: 'email_proofreader',   icon: 'shieldCheck', x: 260, y: 392 },
  { id: 'review',    label: 'Human Review',    sub: 'human_review',        icon: 'userCheck',   x: 36,  y: 488 },
  { id: 'send',      label: 'Gmail Dispatch',  sub: 'send_email',          icon: 'send',        x: 300, y: 488 },
];
const NODE_MAP = Object.fromEntries(NODES.map(n => [n.id, n]));

/* anchors */
const aTop    = n => ({ x: n.x + NW/2, y: n.y });
const aBottom = n => ({ x: n.x + NW/2, y: n.y + NH });
const aLeft   = n => ({ x: n.x,        y: n.y + NH/2 });
const aRight  = n => ({ x: n.x + NW,   y: n.y + NH/2 });

const EDGES = [
  { id: 'e1', from: 'ingest',   to: 'classify', a: 'b', b: 't' },
  { id: 'e2', from: 'classify', to: 'rag_q',    a: 'r', b: 't', label: 'product' },
  { id: 'e3', from: 'classify', to: 'writer',   a: 'b', b: 't', label: 'feedback' },
  { id: 'e4', from: 'rag_q',    to: 'retrieve', a: 'b', b: 't' },
  { id: 'e5', from: 'retrieve', to: 'writer',   a: 'l', b: 'r' },
  { id: 'e6', from: 'writer',   to: 'proof',    a: 'b', b: 't' },
  { id: 'e7', from: 'proof',    to: 'send',     a: 'b', b: 't', label: 'pass' },
  { id: 'e8', from: 'proof',    to: 'review',   a: 'l', b: 't', label: 'low conf' },
  { id: 'e9', from: 'review',   to: 'send',     a: 'r', b: 'l', label: 'approve' },
];

/* build an SVG path between two node anchors with smooth control points */
function edgePath(edge) {
  const af = { t: aTop, b: aBottom, l: aLeft, r: aRight };
  const p1 = af[edge.a](NODE_MAP[edge.from]);
  const p2 = af[edge.b](NODE_MAP[edge.to]);
  const dy = Math.abs(p2.y - p1.y);
  const c = Math.max(40, dy * 0.5);
  let c1, c2;
  if (edge.a === 'b' || edge.a === 't') { c1 = { x: p1.x, y: p1.y + (edge.a === 'b' ? c : -c) }; }
  else { c1 = { x: p1.x + (edge.a === 'r' ? c : -c), y: p1.y }; }
  if (edge.b === 't' || edge.b === 'b') { c2 = { x: p2.x, y: p2.y + (edge.b === 't' ? -c : c) }; }
  else { c2 = { x: p2.x + (edge.b === 'l' ? -c : c), y: p2.y }; }
  return `M ${p1.x} ${p1.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
}
function edgeMid(edge) {
  const af = { t: aTop, b: aBottom, l: aLeft, r: aRight };
  const p1 = af[edge.a](NODE_MAP[edge.from]);
  const p2 = af[edge.b](NODE_MAP[edge.to]);
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}

/* ------------------------- Generated draft replies ------------------------- */
const DRAFTS = {
  'mock-1': `Hi John,

Thanks so much for reaching out about Agentia — happy to help!

We offer three plans: Starter ($29/mo) for solo operators, Growth ($99/mo) with RAG-backed automation and the human-review console, and Scale (custom) for high-volume teams needing SSO and dedicated throughput.

Every plan includes a 14-day trial with no card required. Would you like me to set one up for you?

Warm regards,
The Agentia Team`,
  'mock-2': `Hi Jane,

I'm sorry to hear Agentia didn't meet your expectations — thank you for letting us know.

You're well within our 30-day window, so I've gone ahead and queued a full refund to your original payment method. It should appear within 5–7 business days.

If you'd be open to it, I'd love to learn what fell short so we can do better.

Sincerely,
The Agentia Team`,
  'mock-3': `Hi there,

Sorry for the trouble connecting your email account — the 30-second timeout usually points to an OAuth token that needs refreshing.

Could you try: Settings → Integrations → Reconnect, then clear the cached session. If the spinner persists, send us the request ID from the error toast and we'll trace it on our side.

Happy to hop on a quick call if that's easier.

Best,
Agentia Support`,
  'mock-4': `Hello,

I completely understand the urgency, and I'm sorry for the disruption to your business — that's not the experience we want for you.

Our team has been paged and is actively investigating the outage. I'll personally keep you updated every 30 minutes until it's resolved, and we'll follow up with a credit for the downtime.

Thank you for your patience.

Regards,
The Agentia Team`,
};

/* ----------------------------- Scripted runs ----------------------------- */
/* Returns { category, catConf, respConf, finalStatus, draft, stages[] }.
   stage: { node, end:'completed'|'failed', meta?, log:{message, status, details?} } */
function buildRun(email, force) {
  const ts = () => new Date().toISOString();
  const base = [
    { node: 'ingest', end: 'completed', log: { message: '1 message detected and loaded into engine state.', status: 'completed', details: { source: 'simulation', message_id: email.id } } },
  ];
  const stages = [...base];

  // classification per email
  const catMap = {
    'mock-1': { category: 'product_enquiry', catConf: 0.96, product: true,  feedback: false, unrelated: false },
    'mock-2': { category: 'complaint',       catConf: 0.91, product: false, feedback: true,  unrelated: false },
    'mock-3': { category: 'support',         catConf: 0.88, product: true,  feedback: false, unrelated: false },
    'mock-4': { category: 'complaint',       catConf: 0.84, product: false, feedback: true,  unrelated: false },
    'mock-5': { category: 'unrelated',       catConf: 0.93, product: false, feedback: false, unrelated: true  },
    'mock-6': { category: 'unrelated',       catConf: 0.97, product: false, feedback: false, unrelated: true  },
  }[email.id];

  stages.push({
    node: 'classify', end: 'completed',
    meta: { category: catMap.category, category_confidence: catMap.catConf },
    log: { message: `Classified as "${catMap.category.replace(/_/g,' ')}" with ${Math.round(catMap.catConf*100)}% confidence.`, status: 'completed',
           details: { category: catMap.category, confidence: catMap.catConf, model: 'llama-3.3-70b / groq' } },
  });

  // unrelated → skip → end
  if (catMap.unrelated) {
    stages.push({
      node: 'classify', end: 'failed', terminalSkip: true,
      log: { message: email.id === 'mock-6'
        ? 'Flagged as spam — message discarded, no reply generated.'
        : 'Unrelated to support scope — message archived, no reply generated.', status: 'failed',
        details: { route: 'skip_unrelated_email', action: 'archive' } },
    });
    return { category: catMap.category, catConf: catMap.catConf, respConf: 0, finalStatus: 'skipped', draft: '', stages };
  }

  // product → RAG
  if (catMap.product) {
    stages.push({ node: 'rag_q', end: 'completed',
      log: { message: 'Synthesized 3 semantic search queries from customer intent.', status: 'completed',
             details: { queries: ['pricing plans', 'onboarding packages', 'trial availability'] } } });
    stages.push({ node: 'retrieve', end: 'completed',
      log: { message: 'Retrieved 4 matching chunks from ChromaDB knowledge base.', status: 'completed',
             details: { matches: 4, top_score: 0.83, store: 'chroma / gemini-embedding-001' } } });
  }

  // writer
  stages.push({ node: 'writer', end: 'completed',
    log: { message: 'Drafted a context-aware reply from category + retrieved context.', status: 'completed',
           details: { tokens: 218, temperature: 0.4 } } });

  // optional rewrite loop for the furious email
  if (email.id === 'mock-4') {
    stages.push({ node: 'proof', end: 'failed',
      log: { message: 'Tone too terse for an escalated complaint — routing back for rewrite.', status: 'failed',
             details: { issue: 'tone', decision: 'rewrite' } } });
    stages.push({ node: 'writer', end: 'completed',
      log: { message: 'Rewrote draft with empathetic, de-escalating tone.', status: 'completed',
             details: { revision: 2, tokens: 196 } } });
  }

  // proofread → decide
  let respConf = { 'mock-1': 0.89, 'mock-2': 0.62, 'mock-3': 0.81, 'mock-4': 0.68 }[email.id];
  const needsReview = force || respConf < 0.75;

  if (needsReview) {
    stages.push({ node: 'proof', end: 'completed',
      meta: { response_confidence: respConf },
      log: { message: force
        ? `Draft scored ${Math.round(respConf*100)}% — forced review flag is on, pausing for operator.`
        : `Draft confidence ${Math.round(respConf*100)}% is below 75% threshold — pausing for human review.`, status: 'completed',
        details: { response_confidence: respConf, threshold: 0.75, decision: 'review' } } });
    stages.push({ node: 'review', end: 'running', terminalReview: true,
      log: { message: 'Execution paused. State cached and registered in the operator review queue.', status: 'running',
             details: { thread_id: email.id, awaiting: 'operator decision' } } });
    return { category: catMap.category, catConf: catMap.catConf, respConf, finalStatus: 'needs_review', draft: DRAFTS[email.id] || '', stages };
  }

  stages.push({ node: 'proof', end: 'completed',
    meta: { response_confidence: respConf },
    log: { message: `Draft passed quality audit at ${Math.round(respConf*100)}% confidence.`, status: 'completed',
           details: { response_confidence: respConf, threshold: 0.75, decision: 'send' } } });
  stages.push({ node: 'send', end: 'completed', terminalSend: true,
    log: { message: 'Reply dispatched via Gmail API and thread state synced.', status: 'completed',
           details: { provider: 'gmail', thread_id: email.id } } });

  return { category: catMap.category, catConf: catMap.catConf, respConf, finalStatus: 'sent', draft: DRAFTS[email.id] || '', stages };
}

/* ------------------------------- Tech stack ------------------------------- */
const TECH = [
  { name: 'FastAPI',    cat: 'Backend Host',     desc: 'Low-latency Python API surface' },
  { name: 'LangGraph',  cat: 'Orchestration',    desc: 'Cyclic stateful agent graph' },
  { name: 'ChromaDB',   cat: 'Vector Store',     desc: 'Semantic retrieval engine' },
  { name: 'Gemini',     cat: 'Embeddings',       desc: 'gemini-embedding-001 vectors' },
  { name: 'Groq',       cat: 'Inference',        desc: 'Llama-3.3 at high throughput' },
  { name: 'React Flow', cat: 'Visualizer',       desc: 'Live node + edge topology' },
  { name: 'Next.js',    cat: 'Application',      desc: 'App Router front end' },
];

const FEATURES = [
  { icon: 'cpu',         title: 'LangGraph Orchestration', desc: 'Explicit state management with stateful loops, rewrite thresholds, and pause-and-resume gates.' },
  { icon: 'database',    title: 'Context RAG Retrieval',   desc: 'Vector search over ChromaDB injects live company documentation straight into writer prompts.' },
  { icon: 'shieldCheck', title: 'Human Review Loop',       desc: 'Low-confidence drafts pause execution and cache graph state for operators to edit and dispatch.' },
  { icon: 'gauge',       title: 'Confidence Gates',        desc: 'Dual evaluation: the classifier scores intent, a proofreader scores response accuracy and tone.' },
  { icon: 'terminal',    title: 'Full Execution History',  desc: 'Every node emits a structured audit log so you can see exactly why an agent chose a path.' },
  { icon: 'play',        title: 'Interactive Simulation',  desc: 'A sandbox of pre-built customer emails — enquiry, refund, support, anger, spam — to test live.' },
];

const STAGES_SHOWCASE = [
  { title: 'Inbound Ingest',     desc: 'Email arrives via Gmail API and loads into the engine state.', icon: 'inbox' },
  { title: 'AI Classification',  desc: 'Llama 3.3 identifies intent: enquiry, refund, support, feedback, or unrelated.', icon: 'tag' },
  { title: 'Semantic RAG Search',desc: 'ChromaDB matches the enquiry against the local agency knowledge base.', icon: 'database' },
  { title: 'AI Reply Drafting',  desc: 'A context-aware response is synthesized from category and retrieved chunks.', icon: 'penTool' },
  { title: 'Compliance Audit',   desc: 'A second agent evaluates tone, accuracy, and a draft confidence score.', icon: 'shieldCheck' },
  { title: 'Human Review Gate',  desc: 'Low confidence or forced runs pause and wait for an operator decision.', icon: 'userCheck' },
  { title: 'Gmail Delivery',     desc: 'The approved reply is dispatched and thread state synced back to Gmail.', icon: 'send' },
];

/* --------------------------------- Store --------------------------------- */
const initialState = {
  page: 'home',
  emails: EMAILS,
  selectedEmailId: 'mock-1',
  forceReview: false,
  isExecuting: false,
  currentExecution: null, // { email, category, category_confidence, response_confidence, workflow_status, nodeStatus, logs, draft }
  pausedExecutions: {},   // seeded below
};

// seed one pending review so the Review board isn't empty on first visit
(function seed() {
  const r = buildRun(EMAILS[1], false); // refund → needs_review
  initialState.pausedExecutions['mock-2'] = {
    email: EMAILS[1], category: r.category, category_confidence: r.catConf,
    response_confidence: r.respConf, generated_response: r.draft, id: 'mock-2',
  };
})();

const store = {
  state: initialState,
  listeners: new Set(),
  get() { return this.state; },
  set(patch) {
    this.state = { ...this.state, ...(typeof patch === 'function' ? patch(this.state) : patch) };
    this.listeners.forEach(l => l());
  },
  subscribe(l) { this.listeners.add(l); return () => this.listeners.delete(l); },
};

function useStore(selector = s => s) {
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => store.subscribe(force), []);
  return selector(store.state);
}

Object.assign(window, {
  EMAILS, NODES, NODE_MAP, EDGES, edgePath, edgeMid, NW, NH,
  buildRun, TECH, FEATURES, STAGES_SHOWCASE, DRAFTS,
  store, useStore,
});
