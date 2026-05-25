from duckduckgo_search import DDGS
from typing import List

class WebSearch:
    def __init__(self, max_results: int = 3):
        self.max_results = max_results

    def search(self, query: str) -> List[str]:
        results = []
        try:
            with DDGS() as ddgs:
                ddg_results = ddgs.text(query, max_results=self.max_results)
                for r in ddg_results:
                    results.append(f"Source: {r['href']}\nContent: {r['body']}")
        except Exception as e:
            print(f"Web search error: {e}")
        return results
