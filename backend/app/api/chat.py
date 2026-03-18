import os
import httpx
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.api.deps import get_current_user
from app.models.user import User
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

CONTEXT_FILE_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "chatbot_context.txt")

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    stream: Optional[bool] = False

@router.post("/")
async def chat_with_ai(request: ChatRequest, current_user: User = Depends(get_current_user)):
    # Reload env and key on every request to be sure
    load_dotenv()
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key or api_key == "your_openai_api_key_here":
        print("Chat Error: OPENAI_API_KEY not found or default value detected.")
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")

    try:
        with open(CONTEXT_FILE_PATH, "r") as f:
            system_context = f.read()
    except Exception as e:
        print(f"Chat Context Error: {e}")
        system_context = "You are a helpful assistant for CreatorHub."

    # Standard message format supporting the 'system' role
    api_messages = [{"role": "system", "content": system_context}]
    
    for msg in request.messages:
        api_messages.append({"role": msg.role, "content": msg.content})

    async with httpx.AsyncClient() as client:
        try:
            print(f"Sending request to OpenAI for user {current_user.email}...")
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key.strip()}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4o-mini",
                    "messages": api_messages
                },
                timeout=30.0
            )
            
            if response.status_code != 200:
                print(f"OpenRouter API returned error {response.status_code}: {response.text}")
                raise HTTPException(status_code=response.status_code, detail=f"OpenRouter Error: {response.text}")

            data = response.json()
            if "choices" not in data:
                print(f"OpenRouter Unexpected Response: {data}")
                raise HTTPException(status_code=500, detail="Invalid response format from OpenRouter")
                
            return data["choices"][0]["message"]
            
        except httpx.RequestError as e:
            print(f"Httpx Request Error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Connection to OpenRouter failed: {str(e)}")
        except Exception as e:
            print(f"Chat General Error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
