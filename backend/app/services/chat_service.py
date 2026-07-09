import json
from sqlalchemy.orm import Session
from app.models.chat import ChatSession, ChatMessage
from app.schemas.chat import ChatSessionCreate
from app.services.ai_service import ai_service

class PromptBuilder:
    SYSTEM_PROMPT = """You are an elite AI Nutrition Coach for the CaloriX app.
You behave like a certified nutritionist.
Provide advice based on the user's goals, metrics, and dietary context.
If asked to log a meal, delete a meal, or update a profile, use the appropriate tools.
Keep your responses helpful, encouraging, and informative. Use markdown for lists, code, and emphasis.
"""

    @staticmethod
    def build(user_context: dict, summary: str, messages: list[ChatMessage], new_message: str) -> str:
        prompt = PromptBuilder.SYSTEM_PROMPT + "\n\n"
        
        prompt += "=== USER CONTEXT & METRICS ===\n"
        prompt += json.dumps(user_context, indent=2) + "\n\n"
        
        if summary:
            prompt += "=== CONVERSATION SUMMARY ===\n"
            prompt += summary + "\n\n"
            
        prompt += "=== RECENT MESSAGES ===\n"
        for msg in messages:
            role = "User" if msg.role == "user" else "Assistant"
            prompt += f"{role}: {msg.content}\n"
            
        prompt += f"\nUser: {new_message}\nAssistant:"
        return prompt

class ChatService:
    MAX_HISTORY = 10 # Number of messages to keep before summarizing
    
    @staticmethod
    def get_sessions(db: Session, user_id: int):
        return db.query(ChatSession).filter(ChatSession.user_id == user_id).order_by(ChatSession.updated_at.desc()).all()

    @staticmethod
    def create_session(db: Session, user_id: int, payload: ChatSessionCreate):
        session = ChatSession(user_id=user_id, title=payload.title)
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    @staticmethod
    def get_session(db: Session, session_id: int, user_id: int):
        return db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == user_id).first()

    @staticmethod
    def delete_session(db: Session, session_id: int, user_id: int):
        session = ChatService.get_session(db, session_id, user_id)
        if session:
            db.delete(session)
            db.commit()

    @staticmethod
    def update_session_title(db: Session, session_id: int, user_id: int, title: str):
        session = ChatService.get_session(db, session_id, user_id)
        if session:
            session.title = title
            db.commit()
            db.refresh(session)
        return session

    @staticmethod
    def handle_message(db: Session, session_id: int, user_id: int, message_text: str):
        session = ChatService.get_session(db, session_id, user_id)
        if not session:
            raise ValueError("Session not found")
            
        # Save user message
        user_msg = ChatMessage(session_id=session.id, role="user", content=message_text)
        db.add(user_msg)
        db.commit()
        
        # Load recent messages
        recent_messages = db.query(ChatMessage).filter(ChatMessage.session_id == session.id).order_by(ChatMessage.created_at.asc()).all()
        
        # Memory Management: if too many, summarize (Mock summarization for this context)
        if len(recent_messages) > ChatService.MAX_HISTORY + 2: # +2 for new exchange
            older_messages = recent_messages[:-ChatService.MAX_HISTORY]
            summary_prompt = f"Summarize these old messages:\n"
            for m in older_messages:
                summary_prompt += f"{m.role}: {m.content}\n"
                
            try:
                # Use AI service to generate a summary
                import google.generativeai as genai
                from app.core.config import get_settings
                settings = get_settings()
                if settings.GEMINI_API_KEY:
                    model = genai.GenerativeModel("gemini-2.5-flash")
                    summary_res = model.generate_content(summary_prompt)
                    new_summary = summary_res.text
                    session.summary = f"{session.summary}\n{new_summary}" if session.summary else new_summary
                    
                    # Delete older messages to save space
                    for m in older_messages:
                        db.delete(m)
                    db.commit()
                    
                    recent_messages = recent_messages[-ChatService.MAX_HISTORY:]
            except Exception as e:
                pass # Fallback if summarization fails
            
        # Get user context
        user_context = ai_service._get_user_context(db, user_id)
        
        # Exclude the very last message since we append it in prompt builder
        context_messages = recent_messages[:-1] 
        
        # Build prompt
        prompt = PromptBuilder.build(user_context, session.summary, context_messages, message_text)
        
        # Call Gemini
        ai_response_text = ai_service.chat_with_coach(db, user_id, prompt)
        
        # Save AI response
        ai_msg = ChatMessage(session_id=session.id, role="model", content=ai_response_text)
        db.add(ai_msg)
        db.commit()
        db.refresh(ai_msg)
        
        return ai_msg
