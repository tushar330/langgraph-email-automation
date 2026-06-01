'use client';

import React, { useMemo } from 'react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode, { CustomNodeData } from './CustomNode';
import { useWorkflowStore } from '@/store/workflowStore';

const nodeTypes = {
  customNode: CustomNode,
};

export default function WorkflowGraph() {
  const { currentExecution, isExecuting } = useWorkflowStore();

  // Helper to map backend logs to node status
  const getNodeStatus = (nodeId: string): 'completed' | 'running' | 'failed' | 'pending' => {
    if (!currentExecution) {
      if (isExecuting && nodeId === 'inbox') return 'running';
      return 'pending';
    }

    const logs = currentExecution.workflow_logs || [];
    const status = currentExecution.workflow_status;
    const hasLog = (stepName: string) => logs.some((l) => l.step === stepName);

    switch (nodeId) {
      case 'inbox':
        return hasLog('load_inbox_emails') ? 'completed' : (isExecuting ? 'running' : 'pending');
      
      case 'classify':
        if (hasLog('categorize_email')) return 'completed';
        if (isExecuting && hasLog('load_inbox_emails')) return 'running';
        return 'pending';
      
      case 'rag':
        const category = currentExecution.category;
        if (category && category !== 'product_enquiry') {
          return 'pending'; // Skipped in visualization
        }
        if (hasLog('retrieve_from_rag')) return 'completed';
        if (isExecuting && hasLog('categorize_email')) return 'running';
        return 'pending';
      
      case 'writer':
        if (hasLog('email_writer')) return 'completed';
        if (
          isExecuting && 
          (hasLog('retrieve_from_rag') || 
            (currentExecution.category && currentExecution.category !== 'product_enquiry' && hasLog('categorize_email')))
        ) {
          return 'running';
        }
        return 'pending';
      
      case 'proofread':
        if (hasLog('email_proofreader')) return 'completed';
        if (isExecuting && hasLog('email_writer')) return 'running';
        return 'pending';
      
      case 'review':
        if (status === 'needs_review') return 'running';
        if (hasLog('human_review') || status === 'approved' || status === 'sent') {
          // If review node was triggered in logs or we bypassed it but completed, show completed if reviews occurred
          const reviewLogs = logs.filter(l => l.step === 'human_review');
          if (reviewLogs.length > 0) return 'completed';
        }
        return 'pending';
      
      case 'send':
        if (status === 'sent') return 'completed';
        if (status === 'failed') return 'failed';
        if (isExecuting && (status === 'approved' || hasLog('human_review'))) return 'running';
        return 'pending';
      
      default:
        return 'pending';
    }
  };

  // Construct React Flow nodes
  const nodes = useMemo(() => {
    const inboxStatus = getNodeStatus('inbox');
    const classifyStatus = getNodeStatus('classify');
    const ragStatus = getNodeStatus('rag');
    const writerStatus = getNodeStatus('writer');
    const proofreadStatus = getNodeStatus('proofread');
    const reviewStatus = getNodeStatus('review');
    const sendStatus = getNodeStatus('send');

    const result = currentExecution?.category || '';
    const hasReview = currentExecution?.requires_human_review || false;

    // Base custom data mapping
    const baseNodes = [
      {
        id: 'inbox',
        type: 'customNode',
        position: { x: 200, y: 0 },
        data: {
          label: 'Email Inbox Loader',
          sublabel: 'Ingests inbound messages',
          status: inboxStatus,
          icon: 'inbox',
          badge: currentExecution ? '1 Active' : 'Idle',
        },
      },
      {
        id: 'classify',
        type: 'customNode',
        position: { x: 200, y: 110 },
        data: {
          label: 'AI Intent Classifier',
          sublabel: 'Llama-3.3-70b-versatile',
          status: classifyStatus,
          icon: 'classify',
          confidence: currentExecution?.category_confidence || undefined,
          badge: result ? result.toUpperCase().replace('_', ' ') : undefined,
        },
      },
      {
        id: 'rag',
        type: 'customNode',
        position: { x: 40, y: 220 },
        data: {
          label: 'RAG Knowledge Search',
          sublabel: 'ChromaDB Vector Retrieval',
          status: ragStatus,
          icon: 'rag',
          badge: currentExecution?.category === 'product_enquiry' ? 'SEARCHING' : 'BYPASSED',
        },
      },
      {
        id: 'writer',
        type: 'customNode',
        position: { x: 200, y: 340 },
        data: {
          label: 'AI Draft Writer',
          sublabel: 'Gemini 1.5 Flash Agent',
          status: writerStatus,
          icon: 'writer',
          badge: currentExecution?.generated_response ? 'DRAFTED' : undefined,
        },
      },
      {
        id: 'proofread',
        type: 'customNode',
        position: { x: 200, y: 460 },
        data: {
          label: 'AI Compliance Checker',
          sublabel: 'Quality Verification Agent',
          status: proofreadStatus,
          icon: 'proofread',
          confidence: currentExecution?.response_confidence || undefined,
          badge: currentExecution?.response_confidence ? 'VERIFIED' : undefined,
        },
      },
      {
        id: 'review',
        type: 'customNode',
        position: { x: 420, y: 550 },
        data: {
          label: 'Human Review Gate',
          sublabel: 'Observability & Approval',
          status: reviewStatus,
          icon: 'review',
          badge: currentExecution?.workflow_status === 'needs_review' ? 'PAUSED' : hasReview ? 'REVIEWED' : 'AUTO PASS',
        },
      },
      {
        id: 'send',
        type: 'customNode',
        position: { x: 200, y: 680 },
        data: {
          label: 'Gmail Delivery Node',
          sublabel: 'Dispatches finalized emails',
          status: sendStatus,
          icon: 'send',
          badge: currentExecution?.workflow_status.toUpperCase(),
        },
      },
    ];

    return baseNodes;
  }, [currentExecution, isExecuting]);

  // Construct React Flow edges
  const edges = useMemo(() => {
    const inboxStatus = getNodeStatus('inbox');
    const classifyStatus = getNodeStatus('classify');
    const ragStatus = getNodeStatus('rag');
    const writerStatus = getNodeStatus('writer');
    const proofreadStatus = getNodeStatus('proofread');
    const reviewStatus = getNodeStatus('review');
    const sendStatus = getNodeStatus('send');

    const isProduct = currentExecution?.category === 'product_enquiry';
    const needsReview = currentExecution?.requires_human_review || false;

    return [
      {
        id: 'e-inbox-classify',
        source: 'inbox',
        target: 'classify',
        animated: inboxStatus === 'completed' && classifyStatus === 'running',
        className: classifyStatus === 'completed' ? 'completed' : classifyStatus === 'running' ? 'active' : '',
      },
      {
        id: 'e-classify-rag',
        source: 'classify',
        target: 'rag',
        animated: classifyStatus === 'completed' && ragStatus === 'running' && isProduct,
        className: ragStatus === 'completed' ? 'completed' : ragStatus === 'running' ? 'active' : '',
        style: { opacity: !currentExecution || isProduct ? 1 : 0.25 },
      },
      {
        id: 'e-classify-writer',
        source: 'classify',
        target: 'writer',
        animated: classifyStatus === 'completed' && writerStatus === 'running' && !isProduct,
        className: writerStatus === 'completed' && !isProduct ? 'completed' : writerStatus === 'running' && !isProduct ? 'active' : '',
        style: { opacity: !currentExecution || !isProduct ? 1 : 0.25 },
      },
      {
        id: 'e-rag-writer',
        source: 'rag',
        target: 'writer',
        animated: ragStatus === 'completed' && writerStatus === 'running',
        className: writerStatus === 'completed' && isProduct ? 'completed' : writerStatus === 'running' && isProduct ? 'active' : '',
        style: { opacity: !currentExecution || isProduct ? 1 : 0.25 },
      },
      {
        id: 'e-writer-proofread',
        source: 'writer',
        target: 'proofread',
        animated: writerStatus === 'completed' && proofreadStatus === 'running',
        className: proofreadStatus === 'completed' ? 'completed' : proofreadStatus === 'running' ? 'active' : '',
      },
      // Proofread to Send (Auto-approval path)
      {
        id: 'e-proofread-send',
        source: 'proofread',
        target: 'send',
        animated: proofreadStatus === 'completed' && sendStatus === 'running' && !needsReview,
        className: sendStatus === 'completed' && !needsReview ? 'completed' : sendStatus === 'running' && !needsReview ? 'active' : '',
        style: { opacity: !currentExecution || !needsReview ? 1 : 0.25 },
      },
      // Proofread to Review (Pending review path)
      {
        id: 'e-proofread-review',
        source: 'proofread',
        target: 'review',
        animated: proofreadStatus === 'completed' && reviewStatus === 'running',
        className: reviewStatus === 'completed' ? 'completed' : reviewStatus === 'running' ? 'active' : '',
        style: { opacity: !currentExecution || needsReview ? 1 : 0.25 },
      },
      // Review to Send (Manual approval path)
      {
        id: 'e-review-send',
        source: 'review',
        target: 'send',
        animated: reviewStatus === 'completed' && sendStatus === 'running',
        className: sendStatus === 'completed' && needsReview ? 'completed' : sendStatus === 'running' && needsReview ? 'active' : '',
        style: { opacity: !currentExecution || needsReview ? 1 : 0.25 },
      },
    ];
  }, [currentExecution, isExecuting]);

  return (
    <div className="w-full h-full relative" style={{ minHeight: '650px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnDoubleClick={false}
        preventScrolling={true}
      >
        <Background color="rgba(255,255,255,0.06)" gap={22} size={1} />
        <Controls className="!bg-[var(--ink-800)] !border-[var(--line)] !text-[var(--fg-dim)]" />
      </ReactFlow>
    </div>
  );
}
