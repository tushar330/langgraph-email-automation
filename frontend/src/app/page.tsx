'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Cpu, Shield, Database, Send, CheckCircle2, Play, Activity, 
  Terminal, BarChart3, Settings, ExternalLink, Mail, Zap, HelpCircle
} from 'lucide-react';

export default function LandingPage() {
  const [activeStep, setActiveStep] = useState(0);

  // Workflow showcase steps for progressive animation loop
  const steps = [
    { title: 'Inbound Ingest', desc: 'Email arrives via Gmail API and is loaded into the engine state.', icon: Mail, color: 'text-blue-400' },
    { title: 'AI Classification', desc: 'Llama 3.3 (via Groq) identifies intent: Product Enquiry, Refund, Support, Support, Support, etc.', icon: Cpu, color: 'text-purple-400' },
    { title: 'Semantic RAG Search', desc: 'ChromaDB query matches enquiry against local agency knowledge base.', icon: Database, color: 'text-amber-400' },
    { title: 'AI Reply Drafting', desc: 'Gemini 1.5 Flash drafts a context-aware response based on RAG results.', icon: Zap, color: 'text-pink-400' },
    { title: 'Compliance Audit', desc: 'Secondary AI evaluates tone, spelling, and checks reply confidence score.', icon: CheckCircle2, color: 'text-emerald-400' },
    { title: 'Human Review Gate', desc: 'Low confidence or forced runs trigger a pause, waiting for operator approval.', icon: Shield, color: 'text-orange-400' },
    { title: 'Gmail Delivery', desc: 'Dispatches reply and links thread state back into Gmail thread.', icon: Send, color: 'text-green-400' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden font-sans text-foreground">
      
      {/* Background Orbs & Gradients */}
      <div className="absolute inset-0 z-0">
        {/* Top orange radial glow */}
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        {/* Bottom right radial glow */}
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-28 md:pb-36 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        
        {/* Hero Left Content */}
        <div className="space-y-8 text-left">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 shadow-[0_0_15px_rgba(255,107,0,0.05)]"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-mono text-primary font-bold tracking-widest uppercase">
              INTERVIEW & PORTFOLIO SHOWCASE
            </span>
          </motion.div>

          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]"
            >
              Visualize Autonomous <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-light to-white">
                AI Email Workflows
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base text-gray-400 max-w-xl leading-relaxed font-normal"
            >
              Experience an observable AI workflow orchestration engine. Built with LangGraph, Groq, 
              and Gemini, featuring confidence gatekeeping, vector search (RAG), and real-time operator overrides.
            </motion.p>
          </div>

          {/* Action CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Link 
              href="/simulation"
              className="px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-light text-black font-bold text-xs tracking-wider uppercase transition-all duration-300 flex items-center gap-2 shadow-lg shadow-primary/10 hover:shadow-primary/25 cursor-pointer active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-black stroke-0" />
              <span>Run Simulation</span>
            </Link>
            <Link 
              href="/workflow"
              className="px-6 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white font-bold text-xs tracking-wider uppercase transition-all duration-300 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Activity className="w-3.5 h-3.5 text-primary" />
              <span>Explore Live Graph</span>
            </Link>
          </motion.div>
        </div>

        {/* Hero Right Preview Board (Interactive Mock Dashboard Card) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative w-full h-[380px] sm:h-[420px] rounded-2xl border border-white/5 bg-[#0b0b0b]/60 backdrop-blur-xl shadow-2xl glass-panel flex flex-col overflow-hidden"
        >
          {/* Mock Window Top Header */}
          <div className="px-4 py-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
            </div>
            <div className="text-[10px] font-mono text-gray-500 tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-primary" />
              <span>STATE_ORCHESTRATOR.LOGS</span>
            </div>
            <span className="w-3 h-3 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
            </span>
          </div>

          {/* Active Flow Mock Canvas */}
          <div className="flex-1 p-5 relative overflow-hidden flex flex-col justify-between">
            
            {/* Floating workflow card 1: Ingest */}
            <div className="absolute top-6 left-6 w-[200px] p-2.5 rounded-xl border border-green-500/30 bg-[#0a1810]/90 flex items-center gap-2.5 shadow-lg shadow-green-500/5">
              <div className="p-1.5 rounded bg-green-500/10 text-green-400">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold text-white truncate">Inbox Loaded</div>
                <div className="text-[8px] text-gray-500 truncate">1 message detected</div>
              </div>
            </div>

            {/* Glowing Flowing Connector lines (SVG overlay) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              {/* Path 1 -> Classify */}
              <path d="M 120,60 L 250,110" fill="none" stroke="rgba(255,107,0,0.25)" strokeWidth="1.5" strokeDasharray="4" className="animate-[dash_8s_linear_infinite]" />
              {/* Path 2 -> RAG */}
              <path d="M 250,140 L 150,220" fill="none" stroke="rgba(255,107,0,0.25)" strokeWidth="1.5" strokeDasharray="4" />
              {/* Path 3 -> Writer */}
              <path d="M 150,250 L 250,330" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
            </svg>

            {/* Floating workflow card 2: AI Classification */}
            <div className="absolute top-24 right-6 w-[200px] p-2.5 rounded-xl border border-primary/40 bg-[#1a1005]/90 flex items-center gap-2.5 shadow-lg shadow-primary/5">
              <div className="p-1.5 rounded bg-primary/10 text-primary">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold text-white truncate">AI Classifier</div>
                <div className="text-[8px] text-gray-400 font-mono">confidence: 96%</div>
              </div>
            </div>

            {/* Floating workflow card 3: RAG */}
            <div className="absolute top-48 left-8 w-[200px] p-2.5 rounded-xl border border-white/5 bg-charcoal/80 flex items-center gap-2.5">
              <div className="p-1.5 rounded bg-white/5 text-gray-400">
                <Database className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold text-white truncate">Chroma RAG Search</div>
                <div className="text-[8px] text-gray-500 truncate">Pending retrieval...</div>
              </div>
            </div>

            {/* Floating workflow card 4: Output Review */}
            <div className="absolute bottom-6 right-6 w-[220px] p-3 rounded-xl border border-orange-500/30 bg-[#1a1005]/95 shadow-[0_0_20px_rgba(255,107,0,0.08)] flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded bg-orange-500/10 text-orange-400">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold text-white">Review Required</div>
                  <div className="text-[8px] text-orange-400 font-mono">confidence: 62%</div>
                </div>
              </div>
              <div className="flex gap-1.5 pt-1.5 border-t border-white/5">
                <button className="flex-1 py-1 rounded bg-red-500/10 border border-red-500/10 text-[8px] font-bold uppercase text-red-400">
                  Discard
                </button>
                <button className="flex-1 py-1 rounded bg-primary text-black text-[8px] font-bold uppercase">
                  Approve
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 border-t border-white/5 bg-[#030303]/30">
        <div className="text-center space-y-4 mb-16">
          <span className="text-[10px] font-mono text-primary font-bold tracking-widest uppercase">
            ENGINE CAPABILITIES
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Designed for Observability & Reliability
          </h2>
          <p className="text-xs text-gray-500 max-w-xl mx-auto">
            Traditional AI pipelines run inside a black box. Our architecture opens the hood, providing visual clarity at each transition step.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { 
              title: 'LangGraph Orchestration', 
              desc: 'Explicit state management and flexible routing allows stateful loops, rewrite feedback thresholds, and pause conditions.',
              icon: Cpu,
              border: 'group-hover:border-primary/20'
            },
            { 
              title: 'Context RAG Retrieval', 
              desc: 'Vector searches query ChromaDB, pulling up-to-date company documentation to feed context directly into writer prompts.',
              icon: Database,
              border: 'group-hover:border-amber-500/20'
            },
            { 
              title: 'Human Review Loop', 
              desc: 'Low-confidence answers pause execution, saving graph state statefully so operators can review, edit, and dispatch replies.',
              icon: Shield,
              border: 'group-hover:border-orange-500/20'
            },
            { 
              title: 'Confidence Gates', 
              desc: 'Double-evaluation mechanism. Llama scores intent confidence, and a proofreading prompt evaluates response syntax and accuracy.',
              icon: BarChart3,
              border: 'group-hover:border-green-500/20'
            },
            { 
              title: 'Full Execution History', 
              desc: 'Step-by-step audit logs output by every state node let you view exactly why an agent chose a specific path or rewrote a response.',
              icon: Terminal,
              border: 'group-hover:border-blue-500/20'
            },
            { 
              title: 'Interactive Simulation', 
              desc: 'Interviewer-friendly playground loaded with pre-configured customer emails covering product enquiry, spam, anger, support, etc.',
              icon: Play,
              border: 'group-hover:border-purple-500/20'
            }
          ].map((feat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-charcoal/30 border border-white/5 rounded-2xl p-6 hover:bg-charcoal/50 hover:border-white/10 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary mb-4.5 border border-white/5 group-hover:border-primary/10 transition-all duration-300">
                <feat.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                {feat.title}
              </h3>
              <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Workflow Showcase Section */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 items-center">
          
          {/* Left Text */}
          <div className="space-y-6">
            <span className="text-[10px] font-mono text-primary font-bold tracking-widest uppercase">
              WORKFLOW STAGES
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white leading-tight">
              Anatomy of the AI Automation Chain
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Watch how our system ingests, categorizes, validates, and dispatches messages. The workflow updates statefully and halts whenever human intervention is required.
            </p>
            
            <div className="pt-4 flex gap-4">
              <Link 
                href="/simulation"
                className="px-5 py-3 rounded-xl bg-primary text-black font-bold text-xs tracking-wider uppercase hover:bg-primary-light transition-all shadow-lg shadow-primary/5 flex items-center gap-1.5"
              >
                <span>Run Demo Simulation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Showcase Steps list */}
          <div className="space-y-3 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-[1px] before:bg-white/5">
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              const Icon = step.icon;

              return (
                <div 
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`pl-12 relative flex items-start gap-4 p-4 rounded-2xl cursor-pointer border transition-all duration-500 ${
                    isActive 
                      ? 'border-primary/25 bg-primary/5 shadow-md shadow-primary/2.5' 
                      : 'border-transparent hover:bg-white/2 bg-transparent'
                  }`}
                >
                  {/* Timeline bullet icon */}
                  <div className={`absolute left-[13px] top-4.5 w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-500 ${
                    isActive 
                      ? 'bg-primary border-primary text-black shadow-lg shadow-primary/30 scale-110' 
                      : 'bg-charcoal border-white/5 text-gray-500'
                  }`}>
                    <Icon className="w-3 h-3" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold transition-colors duration-500 ${isActive ? 'text-primary' : 'text-white'}`}>
                        {step.title}
                      </span>
                      {isActive && (
                        <span className="text-[7px] font-mono bg-primary/10 border border-primary/25 text-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-widest animate-pulse">
                          Active Phase
                        </span>
                      )}
                    </div>
                    <p className={`text-[10.5px] mt-1 transition-colors duration-500 leading-relaxed ${isActive ? 'text-gray-300 font-medium' : 'text-gray-500'}`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 border-t border-white/5 bg-[#030303]/40">
        <div className="text-center space-y-4 mb-16">
          <span className="text-[10px] font-mono text-primary font-bold tracking-widest uppercase">
            ENGINEERING STACK
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Built on Industry Standard AI Frameworks
          </h2>
          <p className="text-xs text-gray-500 max-w-lg mx-auto">
            Leveraging state-of-the-art tools across the agentic development lifecycle, from databases to visual flows.
          </p>
        </div>

        {/* Tech Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          {[
            { name: 'FastAPI', category: 'Backend Host', desc: 'High perf python API framework', color: 'border-teal-500/10 hover:border-teal-500/30' },
            { name: 'LangGraph', category: 'AI Orchestration', desc: 'Cyclic graph agent compiler', color: 'border-primary/10 hover:border-primary/30' },
            { name: 'ChromaDB', category: 'Vector Database', desc: 'Semantic semantic retrieval DB', color: 'border-yellow-500/10 hover:border-yellow-500/30' },
            { name: 'Gemini', category: 'Generation model', desc: 'Multimodal model via Google API', color: 'border-blue-500/10 hover:border-blue-500/30' },
            { name: 'Groq', category: 'Inference Host', desc: 'Ultra-fast Llama-3.3 execution', color: 'border-orange-500/10 hover:border-orange-500/30' },
            { name: 'React Flow', category: 'UI Visualizer', desc: 'Nodes & Edges rendering canvas', color: 'border-pink-500/10 hover:border-pink-500/30' },
            { name: 'Next.js', category: 'Web Application', desc: 'Sleek App Router host wrapper', color: 'border-white/10 hover:border-white/30' }
          ].map((tech, i) => (
            <div 
              key={i}
              className={`bg-charcoal/20 border rounded-xl p-4.5 text-center flex flex-col justify-between hover:bg-charcoal/50 transition-all duration-300 ${tech.color}`}
            >
              <div>
                <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest font-bold block mb-1">
                  {tech.category}
                </span>
                <h4 className="text-xs font-bold text-white tracking-wide">
                  {tech.name}
                </h4>
              </div>
              <p className="text-[9px] text-gray-600 mt-2.5 leading-snug">
                {tech.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12 border-t border-white/5 bg-[#030303]/60">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-8 items-center">
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center shadow shadow-primary/20">
                <Cpu className="w-3.5 h-3.5 text-black stroke-[2.5]" />
              </div>
              <span className="font-sans font-bold text-sm tracking-wider text-white">
                AGENTIA WORKFLOW ENGINE
              </span>
            </div>
            <p className="text-[10px] text-gray-500 leading-relaxed max-w-md">
              A premium showcase project demonstrating stateful multi-agent system orchestration, semantic vector retrieval (RAG), and human-in-the-loop audit overrides. Built for interview evaluation and portfolio demonstration.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex flex-col md:items-end gap-3 text-xs">
            <span className="text-[9px] font-mono text-gray-500 font-bold tracking-widest uppercase">
              RESOURCES & SOCIALS
            </span>
            <div className="flex flex-wrap gap-4">
              <a 
                href="https://github.com/tushar330/langgraph-email-automation" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <span>GitHub Repository</span>
                <ExternalLink className="w-3 h-3 text-gray-500" />
              </a>
              <span className="text-white/10">|</span>
              <a 
                href="https://www.linkedin.com/in/tushar-tiwari-72151a289/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3 text-gray-500" />
              </a>
              <span className="text-white/10">|</span>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <span>Developer Resume</span>
                <ExternalLink className="w-3 h-3 text-gray-500" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-gray-600">
          <span>&copy; {new Date().getFullYear()} AGENTIA. ALL RIGHTS RESERVED.</span>
          <span>BUILT WITH NEXT.JS APP ROUTER & TAILWIND CSS</span>
        </div>
      </footer>

    </div>
  );
}
