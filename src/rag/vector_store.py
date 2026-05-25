import faiss
import numpy as np
import json
import os
from typing import List, Dict
from pathlib import Path

DB_DIR = Path("data/vector_db")
DB_DIR.mkdir(parents=True, exist_ok=True)

class VectorStore:
    def __init__(self, dim: int = 384):
        self.dim = dim
        self.index_file = DB_DIR / "faiss.index"
        self.meta_file = DB_DIR / "meta.json"
        
        if self.index_file.exists():
            self.index = faiss.read_index(str(self.index_file))
            with open(self.meta_file, "r") as f:
                self.metadata = json.load(f)
        else:
            self.index = faiss.IndexFlatL2(self.dim)
            self.metadata = []

    def add_documents(self, embeddings: np.ndarray, metadatas: List[Dict[str, str]]):
        self.index.add(embeddings)
        self.metadata.extend(metadatas)
        self.save()

    def search(self, query_embedding: np.ndarray, top_k: int = 5) -> List[Dict[str, str]]:
        if self.index.ntotal == 0:
            return []
        
        distances, indices = self.index.search(np.array([query_embedding]), top_k)
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx != -1 and idx < len(self.metadata):
                res = self.metadata[idx].copy()
                res["distance"] = float(dist)
                results.append(res)
        return results

    def save(self):
        faiss.write_index(self.index, str(self.index_file))
        with open(self.meta_file, "w") as f:
            json.dump(self.metadata, f)
