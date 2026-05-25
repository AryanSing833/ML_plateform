import re
from typing import List, Dict

class TextChunker:
    def __init__(self, chunk_size: int = 1000, overlap: int = 200):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def chunk_text(self, text: str, source: str = "unknown") -> List[Dict[str, str]]:
        # Basic splitting by paragraphs or sentences
        words = text.split()
        chunks = []
        
        i = 0
        while i < len(words):
            chunk_words = words[i:i + self.chunk_size]
            chunk_text = " ".join(chunk_words)
            chunks.append({
                "text": chunk_text,
                "source": source
            })
            i += self.chunk_size - self.overlap
            
        return chunks
