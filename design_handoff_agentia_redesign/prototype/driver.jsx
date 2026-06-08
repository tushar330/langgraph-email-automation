/* driver.jsx — workflow execution driver + operator actions */
(function () {
  let token = 0;
  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  async function runSimulation(emailId, force) {
    const myToken = ++token;
    const email = EMAILS.find(e => e.id === emailId);
    if (!email) return;
    const plan = buildRun(email, force);

    store.set({
      page: 'workflow',
      isExecuting: true,
      currentExecution: {
        email, category: null, category_confidence: 0, response_confidence: 0,
        workflow_status: 'processing', nodeStatus: {}, logs: [], draft: plan.draft,
      },
    });
    await wait(450);

    for (const stage of plan.stages) {
      if (myToken !== token) return;
      // mark running
      store.set(s => ({ currentExecution: { ...s.currentExecution, nodeStatus: { ...s.currentExecution.nodeStatus, [stage.node]: 'running' } } }));
      await wait(620 + Math.random() * 360);
      if (myToken !== token) return;
      // settle
      store.set(s => {
        const ex = s.currentExecution;
        const ns = { ...ex.nodeStatus, [stage.node]: stage.end };
        const patch = { ...ex, nodeStatus: ns };
        if (stage.meta) Object.assign(patch, stage.meta);
        if (stage.log) patch.logs = [...ex.logs, { step: NODE_MAP[stage.node]?.sub || stage.node, timestamp: new Date().toISOString(), ...stage.log }];
        return { currentExecution: patch };
      });
      await wait(300);
    }

    if (myToken !== token) return;
    store.set(s => {
      const ex = s.currentExecution;
      const next = { ...ex, workflow_status: plan.finalStatus, response_confidence: plan.respConf || ex.response_confidence };
      const out = { isExecuting: false, currentExecution: next };
      if (plan.finalStatus === 'needs_review') {
        out.pausedExecutions = { ...s.pausedExecutions, [email.id]: {
          email, category: plan.category, category_confidence: plan.catConf,
          response_confidence: plan.respConf, generated_response: plan.draft, id: email.id,
        } };
      }
      return out;
    });
  }

  function resolveReview(id, approved, editedResponse) {
    store.set(s => {
      const paused = { ...s.pausedExecutions };
      delete paused[id];
      let ce = s.currentExecution;
      if (ce && ce.email && ce.email.id === id) {
        ce = { ...ce, workflow_status: approved ? 'sent' : 'skipped',
          nodeStatus: { ...ce.nodeStatus, review: 'completed', send: approved ? 'completed' : (ce.nodeStatus.send || 'pending') },
          draft: approved ? (editedResponse ?? ce.draft) : ce.draft,
          logs: [...ce.logs, { step: approved ? 'send_email' : 'skip_failed_email', timestamp: new Date().toISOString(),
            status: approved ? 'completed' : 'failed',
            message: approved ? 'Operator approved — reply dispatched via Gmail API.' : 'Operator discarded the draft — message archived.',
            details: { operator_decision: approved ? 'approve' : 'reject', edited: approved && editedResponse != null } }] };
      }
      return { pausedExecutions: paused, currentExecution: ce };
    });
  }

  window.actions = {
    runSimulation,
    setSelectedEmail: (id) => store.set({ selectedEmailId: id }),
    setForceReview: (v) => store.set({ forceReview: v }),
    approve: (id, resp) => resolveReview(id, true, resp),
    reject: (id) => resolveReview(id, false),
    go: (p) => store.set({ page: p }),
  };
})();
