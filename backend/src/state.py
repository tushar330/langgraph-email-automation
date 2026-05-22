from pydantic import BaseModel, Field
from typing import List, Annotated
from typing_extensions import TypedDict
from langgraph.graph.message import add_messages

class Email(BaseModel):
    id: str = Field(..., description="Unique identifier of the email")
    threadId: str = Field(..., description="Thread identifier of the email")
    messageId: str = Field(..., description="Message identifier of the email")
    references: str = Field(..., description="References of the email")
    sender: str = Field(..., description="Email address of the sender")
    subject: str = Field(..., description="Subject line of the email")
    body: str = Field(..., description="Body content of the email")
    
class EmailState(TypedDict):
    # Core input/output state fields
    email: str
    category: str
    category_confidence: float
    retrieved_docs: List[str]
    generated_response: str
    response_confidence: float
    requires_human_review: bool
    approved: bool
    workflow_logs: List[dict]
    final_response: str
    workflow_status: str


    # Graph mechanics & compatibility fields
    emails: List[Email]
    current_email: Email
    rag_queries: List[str]
    writer_messages: List[str]
    sendable: bool
    trials: int
    is_simulation: bool
    force_review: bool

# Alias GraphState to EmailState for backward compatibility
GraphState = EmailState