from pydantic import BaseModel, Field
from typing import List
from enum import Enum

# **Categorize Email Output**
class EmailCategory(str, Enum):
    product_enquiry = "product_enquiry"
    customer_complaint = "customer_complaint"
    customer_feedback = "customer_feedback"
    unrelated = "unrelated"

class CategorizeEmailOutput(BaseModel):
    category: EmailCategory = Field(
        ..., 
        description="The category assigned to the email, indicating its type based on predefined rules."
    )
    confidence: float = Field(
        ...,
        description="A calibrated confidence score between 0.0 and 1.0. Use the rubric in the prompt: 0.9+ only for unambiguous intent; 0.55-0.89 for normal cases; below 0.55 when two categories are plausible."
    )

# **RAG Query Output**
class RAGQueriesOutput(BaseModel):
    queries: List[str] = Field(
        ..., 
        description="A list of up to three questions representing the customer's intent, based on their email."
    )

# **Email Writer Output**
class WriterOutput(BaseModel):
    email: str = Field(
        ..., 
        description="The draft email written in response to the customer's inquiry, adhering to company tone and standards."
    )

# **Proofreader Email Output**
class ProofReaderOutput(BaseModel):
    feedback: str = Field(
        ..., 
        description="Detailed feedback explaining why the email is or is not sendable."
    )
    send: bool = Field(
        ..., 
        description="Indicates whether the email is ready to be sent (true) or requires rewriting (false)."
    )
    confidence: float = Field(
        ...,
        description="A calibrated quality score between 0.0 and 1.0. Use the rubric in the prompt: 0.9+ only for exceptional replies; 0.7-0.89 for solid replies with minor gaps; below 0.55 for significant issues. Do not default to 0.9 — penalise vague or incomplete responses."
    )
