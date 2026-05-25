import os
from groq import Groq
from typing import List, Dict

class GroqClient:
    def __init__(self):
        # API key should be in environment
        self.api_key = os.getenv("GROQ_API_KEY", "")
        self.client = Groq(api_key=self.api_key) if self.api_key else None
        # Default to a highly capable, fast model
        self.default_model = "llama-3.1-8b-instant"

    def generate(self, messages: List[Dict[str, str]], model: str = None) -> str:
        if not self.client:
            return "Error: GROQ_API_KEY is not configured."
        
        try:
            response = self.client.chat.completions.create(
                messages=messages,
                model=model or self.default_model,
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error communicating with Groq API: {str(e)}"
