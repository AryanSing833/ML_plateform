from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from src.rag.embeddings import EmbeddingsModel
from src.rag.vector_store import VectorStore
from src.rag.groq_client import GroqClient
from src.rag.web_search import WebSearch
from src.rag.memory import MemoryManager
from src.rag.prompt_builder import PromptBuilder

router = APIRouter()

from src.api.dependencies import embeddings_model, vector_store, groq_client, web_search, memory_manager

router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    session_id: str = "default"
    use_web_search: bool = False

@router.post("/api/chat")
async def chat(request: ChatRequest):
    # 1. Get query embedding
    query_emb = embeddings_model.get_embeddings([request.query])[0]
    
    # 2. Retrieve document context
    doc_results = vector_store.search(query_emb, top_k=3)
    
    # 3. Retrieve web context (optional)
    web_results = web_search.search(request.query) if request.use_web_search else []
    
    # 4. Build prompt
    user_prompt = PromptBuilder.build_context_prompt(request.query, doc_results, web_results)
    system_prompt = PromptBuilder.build_system_prompt()
    
    # 5. Get history
    history = memory_manager.get_history(request.session_id)
    messages = [{"role": "system", "content": system_prompt}] + history + [{"role": "user", "content": user_prompt}]
    
    # 6. Generate response
    response_text = groq_client.generate(messages)
    
    # 7. Update memory
    memory_manager.add_message(request.session_id, "user", request.query)
    memory_manager.add_message(request.session_id, "assistant", response_text)
    
    # Extract sources for citation
    sources = list(set([res["source"] for res in doc_results]))
    
    return {
        "answer": response_text,
        "sources": sources
    }
