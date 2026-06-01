from colorama import Fore, Style
from .agents import Agents
from .tools.GmailTools import GmailToolsClass
from .state import GraphState, Email


class Nodes:
    def __init__(self):
        self.agents = Agents()
        self._gmail_tools = None

    def _add_log(self, state: GraphState, node_name: str, message: str, details: dict = None) -> list:
        """Appends a new execution log entry to the workflow_logs."""
        import datetime
        current_logs = state.get("workflow_logs") or []
        new_logs = list(current_logs)
        new_logs.append({
            "step": node_name,
            "status": "completed",
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "message": message,
            "details": details or {}
        })
        return new_logs

    def calculate_response_confidence(self, proofreader_confidence: float, trials: int, is_sendable: bool) -> float:
        """Calculates response confidence based on proofreader confidence and trials decay."""
        if not is_sendable:
            return 0.0
        decay = max(0.5, 1.0 - (trials - 1) * 0.15)
        return proofreader_confidence * decay

    @property
    def gmail_tools(self):
        if self._gmail_tools is None:
            self._gmail_tools = GmailToolsClass()
        return self._gmail_tools

    def load_new_emails(self, state: GraphState) -> GraphState:
        """Loads new emails from Gmail and updates the state."""
        # Initialize safe default values for the graph state
        defaults = {
            "workflow_logs": state.get("workflow_logs") or [],
            "category_confidence": state.get("category_confidence") or 0.0,
            "response_confidence": state.get("response_confidence") or 0.0,
            "requires_human_review": state.get("requires_human_review") or False,
            "is_simulation": state.get("is_simulation") or False,
            "approved": state.get("approved") or False,
            "force_review": state.get("force_review") or False,
            "final_response": state.get("final_response") or "",
            "retrieved_docs": state.get("retrieved_docs") or [],
            "generated_response": state.get("generated_response") or "",
            "writer_messages": state.get("writer_messages") or [],
            "sendable": state.get("sendable") or False,
            "trials": state.get("trials") or 0,
            "rag_queries": state.get("rag_queries") or [],
            "workflow_status": state.get("workflow_status") or ("approved" if state.get("approved") else "processing")
        }

        # If an email body is already provided in the state (e.g., simulation or direct run),
        # wrap it in an Email object to bypass Gmail API.
        if state.get("email"):
            email_body = state["email"]
            current_email = state.get("current_email")
            if not current_email or not getattr(current_email, "body", None):
                current_email = Email(
                    id=state.get("email_id") or "mock-id",
                    threadId=state.get("thread_id") or "mock-thread-id",
                    messageId=state.get("message_id") or "mock-message-id",
                    references=state.get("references") or "",
                    sender=state.get("sender") or "customer@example.com",
                    subject=state.get("subject") or "Product Inquiry",
                    body=email_body
                )
            defaults["workflow_logs"] = self._add_log(state, "load_inbox_emails", "Loaded mock email for simulation.")
            updates = {
                "emails": [current_email],
                "current_email": current_email,
                "email": email_body
            }
            updates.update(defaults)
            return updates

        print(Fore.YELLOW + "Loading new emails...\n" + Style.RESET_ALL)
        recent_emails = self.gmail_tools.fetch_unanswered_emails()
        emails = [Email(**email) for email in recent_emails]
        defaults["workflow_logs"] = self._add_log(state, "load_inbox_emails", f"Fetched {len(emails)} unanswered emails from Gmail inbox.")
        updates = {"emails": emails}
        updates.update(defaults)
        return updates

    def check_new_emails(self, state: GraphState) -> str:
        """Checks if there are new emails to process."""
        emails = state.get("emails", [])
        if len(emails) == 0:
            print(Fore.RED + "No new emails" + Style.RESET_ALL)
            return "empty"
            
        if state.get("workflow_status") == "approved" or state.get("approved", False):
            print(Fore.GREEN + "Human approved email found in state. Routing directly to send." + Style.RESET_ALL)
            return "send_approved"
            
        if state.get("workflow_status") == "failed":
            print(Fore.RED + "Workflow marked as failed/rejected by human. Routing to skip." + Style.RESET_ALL)
            return "skip_rejected"

        if state.get("workflow_status") == "retry":
            print(Fore.YELLOW + "Human rejected draft — re-running workflow from scratch." + Style.RESET_ALL)
            return "process"

        print(Fore.GREEN + "New emails to process" + Style.RESET_ALL)
        return "process"

    def is_email_inbox_empty(self, state: GraphState) -> GraphState:
        emails_count = len(state.get("emails", []))
        updates = {
            "workflow_logs": self._add_log(
                state,
                "is_email_inbox_empty",
                f"Checked email queue. Queue size: {emails_count}."
            )
        }
        # On retry (human rejected), wipe all previous draft state so the AI starts fresh
        if state.get("workflow_status") == "retry":
            updates.update({
                "writer_messages": [],
                "trials": 0,
                "generated_response": "",
                "final_response": "",
                "sendable": False,
                "retrieved_docs": [],
                "rag_queries": [],
                "requires_human_review": False,
                "approved": False,
                "workflow_status": "processing",
            })
        return updates

    def categorize_email(self, state: GraphState) -> GraphState:
        """Categorizes the current email using the categorize_email agent."""
        print(Fore.YELLOW + "Checking email category...\n" + Style.RESET_ALL)
        
        # Get the last email
        current_email = state["emails"][-1]
        result = self.agents.categorize_email.invoke({"email": current_email.body})
        category_val = result.category.value
        confidence_val = min(float(getattr(result, "confidence", 0.0)), 0.95)
        print(Fore.MAGENTA + f"Email category: {category_val} (confidence: {confidence_val})" + Style.RESET_ALL)
        
        return {
            "category": category_val,
            "category_confidence": confidence_val,
            "email": current_email.body,
            "current_email": current_email,
            "workflow_logs": self._add_log(
                state, 
                "categorize_email", 
                f"Categorized email as '{category_val}' (confidence: {confidence_val:.2f}).",
                {"category": category_val, "confidence": confidence_val}
            )
        }

    def route_email_based_on_category(self, state: GraphState) -> str:
        """Routes the email based on its category."""
        print(Fore.YELLOW + "Routing email based on category...\n" + Style.RESET_ALL)
        category = state.get("category")
        if category == "product_enquiry":
            return "product related"
        elif category == "unrelated":
            return "unrelated"
        else:
            return "not product related"

    def construct_rag_queries(self, state: GraphState) -> GraphState:
        """Constructs RAG queries based on the email content."""
        print(Fore.YELLOW + "Designing RAG query...\n" + Style.RESET_ALL)
        email_content = state.get("email") or state["current_email"].body
        query_result = self.agents.design_rag_queries.invoke({"email": email_content})
        
        return {
            "rag_queries": query_result.queries,
            "workflow_logs": self._add_log(
                state, 
                "construct_rag_queries", 
                f"Designed {len(query_result.queries)} RAG queries.",
                {"queries": query_result.queries}
            )
        }

    def retrieve_from_rag(self, state: GraphState) -> GraphState:
        """Retrieves information from internal knowledge based on RAG questions."""
        print(Fore.YELLOW + "Retrieving information from internal knowledge...\n" + Style.RESET_ALL)
        retrieved_docs = []
        for query in state["rag_queries"]:
            rag_result = self.agents.generate_rag_answer.invoke(query)
            retrieved_docs.append(f"Query: {query}\nAnswer: {rag_result}")
        
        return {
            "retrieved_docs": retrieved_docs,
            "workflow_logs": self._add_log(
                state, 
                "retrieve_from_rag", 
                f"Retrieved context from knowledge base for {len(state['rag_queries'])} queries.",
                {"retrieved_docs_count": len(retrieved_docs)}
            )
        }

    def write_draft_email(self, state: GraphState) -> GraphState:
        """Writes a draft email based on the current email and retrieved information."""
        print(Fore.YELLOW + "Writing draft email...\n" + Style.RESET_ALL)
        
        retrieved_info = "\n\n".join(state.get("retrieved_docs", []))
        # Format input to the writer agent
        inputs = (
            f'# **EMAIL CATEGORY:** {state.get("category")}\n\n'
            f'# **EMAIL CONTENT:**\n{state.get("email")}\n\n'
            f'# **INFORMATION:**\n{retrieved_info}' # Empty for feedback or complaint
        )
        
        # Get messages history for current email
        writer_messages = state.get('writer_messages') or []
        
        # Write email
        draft_result = self.agents.email_writer.invoke({
            "email_information": inputs,
            "history": writer_messages
        })
        email_text = draft_result.email
        trials = state.get('trials', 0) + 1

        # Append writer's draft to the message list
        new_messages = writer_messages + [f"**Draft {trials}:**\n{email_text}"]

        return {
            "generated_response": email_text, 
            "trials": trials,
            "writer_messages": new_messages,
            "workflow_logs": self._add_log(
                state, 
                "email_writer", 
                f"Generated draft response (Trial {trials}).",
                {"draft_preview": email_text[:120]}
            )
        }

    def verify_generated_email(self, state: GraphState) -> GraphState:
        """Verifies the generated email using the proofreader agent."""
        print(Fore.YELLOW + "Verifying generated email...\n" + Style.RESET_ALL)
        review = self.agents.email_proofreader.invoke({
            "initial_email": state.get("email"),
            "generated_email": state.get("generated_response"),
        })

        writer_messages = state.get('writer_messages') or []
        feedback_msg = f"**Proofreader Feedback:**\n{review.feedback}"
        new_messages = writer_messages + [feedback_msg]
        status = "sendable" if review.send else "not sendable"

        # Default to 0.8 when proofreader says sendable but omits confidence (LLM calibration gap)
        raw_confidence = getattr(review, "confidence", None)
        if raw_confidence is None or (review.send and float(raw_confidence) == 0.0):
            review_confidence = 0.8
        else:
            review_confidence = float(raw_confidence)

        trials = state.get("trials", 1)
        response_confidence = self.calculate_response_confidence(review_confidence, trials, review.send)

        # Mark as approved when proofreader says sendable and force_review is off.
        # Confidence gates use a lenient floor (0.5) to catch true failures only —
        # Llama 3.3 is calibrated conservatively and routinely returns 0.65–0.75.
        status_update = {}
        if review.send and not state.get("force_review", False):
            category_conf = state.get("category_confidence", 0.0)
            if response_confidence >= 0.5 and category_conf >= 0.5:
                status_update["workflow_status"] = "approved"

        ret_val = {
            "sendable": review.send,
            "response_confidence": response_confidence,
            "writer_messages": new_messages,
            "workflow_logs": self._add_log(
                state, 
                "email_proofreader", 
                f"Verified generated email: {status} (confidence: {review_confidence:.2f}, response confidence: {response_confidence:.2f}).",
                {
                    "feedback": review.feedback, 
                    "sendable": review.send, 
                    "confidence": review_confidence,
                    "response_confidence": response_confidence
                }
            )
        }
        if "workflow_status" in status_update:
            ret_val["workflow_status"] = status_update["workflow_status"]
        return ret_val

    def must_rewrite(self, state: GraphState) -> str:
        """Determines if the email needs to be rewritten based on the review and trial count."""
        if state.get("workflow_status") == "approved" or state.get("approved", False):
            print(Fore.GREEN + "Email has been approved, sending..." + Style.RESET_ALL)
            return "send"

        email_sendable = state.get("sendable", False)
        if email_sendable:
            # Force Human Review toggle takes absolute priority
            if state.get("force_review", False):
                print(Fore.YELLOW + "force_review enabled — routing to human review." + Style.RESET_ALL)
                return "review"

            response_conf = state.get("response_confidence", 0.0)
            category_conf = state.get("category_confidence", 0.0)
            # Only block auto-send for very low confidence (< 0.5) which signals a true failure
            if response_conf < 0.5 or category_conf < 0.5:
                print(Fore.YELLOW + f"Very low confidence (category: {category_conf:.2f}, response: {response_conf:.2f}) — routing to human review." + Style.RESET_ALL)
                return "review"

            print(Fore.GREEN + "Email approved by AI — ready to send." + Style.RESET_ALL)
            return "send"
        elif state.get("trials", 0) >= 3:
            print(Fore.RED + "Email is not good, we reached max trials must stop!!!" + Style.RESET_ALL)
            return "stop"
        else:
            print(Fore.RED + "Email is not good, must rewrite it..." + Style.RESET_ALL)
            return "rewrite"

    def create_draft_response(self, state: GraphState) -> GraphState:
        """Creates a draft response in Gmail."""
        print(Fore.YELLOW + "Creating draft email...\n" + Style.RESET_ALL)
        
        # Check if we have a current email and aren't in simulation
        is_sim = state.get("is_simulation", False)
        if state.get("current_email") and not is_sim:
            self.gmail_tools.create_draft_reply(state["current_email"], state.get("generated_response"))
        
        emails = state.get("emails", []).copy()
        if emails:
            emails.pop()

        action = "Skipped Gmail draft creation (Simulation Mode)" if is_sim else "Created draft reply in Gmail inbox"

        return {
            "emails": emails,
            "writer_messages": [],
            "retrieved_docs": [],
            "trials": 0,
            "final_response": state.get("generated_response"),
            "workflow_status": "sent",
            "workflow_logs": self._add_log(
                state, 
                "send_email", 
                f"Completed draft phase. Action: {action}.",
                {"is_simulation": is_sim}
            )
        }

    def send_email_response(self, state: GraphState) -> GraphState:
        """Sends the email response directly using Gmail."""
        print(Fore.YELLOW + "Sending email...\n" + Style.RESET_ALL)
        is_sim = state.get("is_simulation", False)
        if state.get("current_email") and not is_sim:
            self.gmail_tools.send_reply(state["current_email"], state.get("generated_response"))
        
        emails = state.get("emails", []).copy()
        if emails:
            emails.pop()
            
        action = "Skipped sending email (Simulation Mode)" if is_sim else "Sent reply using Gmail API"

        return {
            "emails": emails,
            "writer_messages": [],
            "retrieved_docs": [],
            "trials": 0,
            "final_response": state.get("generated_response"),
            "workflow_status": "sent",
            "workflow_logs": self._add_log(
                state, 
                "send_email_response", 
                f"Completed send phase. Action: {action}.",
                {"is_simulation": is_sim}
            )
        }
    
    def skip_unrelated_email(self, state: GraphState) -> GraphState:
        """Skip unrelated email and remove from emails list."""
        print("Skipping unrelated email...\n")
        emails = state.get("emails", []).copy()
        if emails:
            emails.pop()
        return {
            "emails": emails,
            "writer_messages": [],
            "retrieved_docs": [],
            "trials": 0,
            "workflow_status": "failed",
            "workflow_logs": self._add_log(
                state, 
                "skip_unrelated_email", 
                "Skipped email categorization as unrelated."
            )
        }

    def skip_failed_email(self, state: GraphState) -> GraphState:
        """Skip failed email (max trials reached or human rejected) and remove from emails list."""
        is_rejection = state.get("workflow_status") == "failed"
        log_msg = "Skipped email: rejected by human." if is_rejection else "Skipped email: proofreading failed after maximum trials."
        print(f"Skipping email... Reason: {log_msg}\n")
        emails = state.get("emails", []).copy()
        if emails:
            emails.pop()
        return {
            "emails": emails,
            "writer_messages": [],
            "retrieved_docs": [],
            "trials": 0,
            "workflow_status": "failed",
            "workflow_logs": self._add_log(
                state, 
                "skip_failed_email", 
                log_msg
            )
        }

    def human_review(self, state: GraphState) -> GraphState:
        """Pauses the workflow and flags that human review is required."""
        print(Fore.YELLOW + "Pending human review. Workflow paused...\n" + Style.RESET_ALL)
        
        return {
            "requires_human_review": True,
            "workflow_status": "needs_review",
            "workflow_logs": self._add_log(
                state, 
                "human_review", 
                "Workflow paused: Draft requires human review before sending.",
                {
                    "category_confidence": state.get("category_confidence"),
                    "response_confidence": state.get("response_confidence")
                }
            )
        }