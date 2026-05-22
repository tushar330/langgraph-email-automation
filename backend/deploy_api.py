import os
import json
import uvicorn
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from src.graph import Workflow
from dotenv import load_dotenv

# Load .env file
load_dotenv()

app = FastAPI(
    title="Gmail Automation Backend",
    version="1.0",
    description="Clean observable backend for Gmail automation workflow",
)

# CORS middleware
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://langgraph-email-automation-ocy28jn3p-tushars-projects-ec14c6a7.vercel.app",
]
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Initialize the workflow graph
workflow = Workflow()
runnable = workflow.app

# Paths
MOCK_EMAILS_PATH = os.path.join(os.path.dirname(__file__), "data", "mock_emails.json")

# In-memory storage for paused states
paused_states: Dict[str, Dict[str, Any]] = {}
last_paused_state: Optional[Dict[str, Any]] = None

# Pydantic models for request/response standardization
class EmailDetails(BaseModel):
    subject: str
    sender: str
    body: str

class WorkflowExecutionResponse(BaseModel):
    workflow_status: str  # "processing", "needs_review", "approved", "sent", "failed"
    email: EmailDetails
    category: str
    category_confidence: float
    response_confidence: float
    requires_human_review: bool
    generated_response: str
    workflow_logs: List[dict]
    metadata: dict

class ApproveRequest(BaseModel):
    id: Optional[str] = None
    approved: bool = True
    generated_response: Optional[str] = None

def load_mock_emails() -> List[dict]:
    if not os.path.exists(MOCK_EMAILS_PATH):
        return []
    try:
        with open(MOCK_EMAILS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading mock emails: {e}")
        return []

@app.get("/simulation/emails", response_model=List[dict])
def get_simulation_emails():
    """Retrieve the list of simulated mock emails."""
    return load_mock_emails()

@app.post("/simulation/run/{id}", response_model=WorkflowExecutionResponse)
async def run_simulation(id: str, force_review: bool = False):
    """Execute the automation workflow for a mock email in simulation mode."""
    mock_emails = load_mock_emails()
    mock_email = next((email for email in mock_emails if email["id"] == id), None)
    if not mock_email:
        raise HTTPException(status_code=404, detail=f"Mock email with ID '{id}' not found.")

    initial_state = {
        "email": mock_email["body"],
        "is_simulation": True,
        "force_review": force_review,
        "emails": [],
        "current_email": None,
        "category": "",
        "category_confidence": 0.0,
        "retrieved_docs": [],
        "generated_response": "",
        "response_confidence": 0.0,
        "requires_human_review": False,
        "approved": False,
        "workflow_logs": [],
        "final_response": "",
        "writer_messages": [],
        "sendable": False,
        "trials": 0,
        "rag_queries": [],
        "workflow_status": "processing",
        # For GmailTools simulation mapping
        "email_id": mock_email["id"],
        "thread_id": mock_email["threadId"],
        "message_id": mock_email["messageId"],
        "sender": mock_email["sender"],
        "subject": mock_email["subject"],
        "references": mock_email.get("references", "")
    }

    try:
        # Run graph execution
        result = await runnable.ainvoke(initial_state)
        
        # Save paused states if review is required
        status = result.get("workflow_status", "processing")
        if status == "needs_review" or result.get("requires_human_review"):
            paused_states[id] = result
            global last_paused_state
            last_paused_state = result

        # Construct response
        current_email = result.get("current_email")
        email_info = EmailDetails(
            subject=current_email.subject if current_email else mock_email["subject"],
            sender=current_email.sender if current_email else mock_email["sender"],
            body=current_email.body if current_email else mock_email["body"]
        )

        return WorkflowExecutionResponse(
            workflow_status=status,
            email=email_info,
            category=result.get("category", ""),
            category_confidence=result.get("category_confidence", 0.0),
            response_confidence=result.get("response_confidence", 0.0),
            requires_human_review=result.get("requires_human_review", False),
            generated_response=result.get("generated_response", ""),
            workflow_logs=result.get("workflow_logs", []),
            metadata={
                "is_simulation": result.get("is_simulation", True),
                "id": mock_email["id"],
                "threadId": mock_email["threadId"],
                "messageId": mock_email["messageId"]
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Workflow execution failed: {str(e)}")

@app.post("/workflow/approve", response_model=WorkflowExecutionResponse)
async def approve_workflow(request: ApproveRequest):
    """Resume a paused workflow and execute sending."""
    global last_paused_state
    
    # Retrieve paused state
    state = None
    if request.id:
        state = paused_states.get(request.id)
    else:
        state = last_paused_state

    if not state:
        raise HTTPException(status_code=404, detail="No paused workflow state found to approve.")

    # Update state keys for resumption
    state["approved"] = request.approved
    state["workflow_status"] = "approved" if request.approved else "failed"
    state["force_review"] = False
    
    if request.generated_response is not None:
        state["generated_response"] = request.generated_response

    try:
        # Resume graph execution
        result = await runnable.ainvoke(state)
        
        # Cleanup paused state records if completed
        status = result.get("workflow_status", "processing")
        if status != "needs_review":
            if request.id in paused_states:
                del paused_states[request.id]
            if last_paused_state and last_paused_state.get("email_id") == state.get("email_id"):
                last_paused_state = None

        # Construct response
        current_email = result.get("current_email")
        email_info = EmailDetails(
            subject=current_email.subject if current_email else state.get("subject", ""),
            sender=current_email.sender if current_email else state.get("sender", ""),
            body=current_email.body if current_email else state.get("email", "")
        )

        return WorkflowExecutionResponse(
            workflow_status=status,
            email=email_info,
            category=result.get("category", ""),
            category_confidence=result.get("category_confidence", 0.0),
            response_confidence=result.get("response_confidence", 0.0),
            requires_human_review=result.get("requires_human_review", False),
            generated_response=result.get("generated_response", ""),
            workflow_logs=result.get("workflow_logs", []),
            metadata={
                "is_simulation": result.get("is_simulation", True),
                "id": state.get("email_id") or "mock-id",
                "threadId": state.get("thread_id") or "mock-thread-id",
                "messageId": state.get("message_id") or "mock-message-id"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resuming workflow failed: {str(e)}")

def main():
    # Start the API
    uvicorn.run(app, host="0.0.0.0", port=8000)

if __name__ == "__main__":
    main()