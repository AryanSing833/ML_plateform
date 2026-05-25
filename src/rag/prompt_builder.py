from typing import List, Dict

class PromptBuilder:
    @staticmethod
    def build_system_prompt() -> str:
        return """You are a helpful and intelligent AI document assistant. 
You answer questions based ONLY on the provided document context and optional web search context. 
If the answer is not contained within the context, say "I cannot answer this based on the provided documents." 
Always cite the source document when providing an answer."""

    @staticmethod
    def build_context_prompt(query: str, doc_context: List[Dict[str, str]], web_context: List[str]) -> str:
        prompt = f"Question: {query}\n\n"
        
        if doc_context:
            prompt += "--- Document Context ---\n"
            for ctx in doc_context:
                prompt += f"[Source: {ctx.get('source', 'unknown')}] {ctx.get('text', '')}\n\n"
                
        if web_context:
            prompt += "--- Web Search Context ---\n"
            for ctx in web_context:
                prompt += f"{ctx}\n\n"
                
        prompt += "\nPlease provide a clear, concise answer based on the context above."
        return prompt
