import os
import shutil
from pathlib import Path
from typing import List

UPLOAD_DIR = Path("data/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

class LocalStorage:
    @staticmethod
    async def save_file(filename: str, file_bytes: bytes) -> str:
        file_path = UPLOAD_DIR / filename
        with open(file_path, "wb") as f:
            f.write(file_bytes)
        return str(file_path)

    @staticmethod
    def get_files() -> List[str]:
        return [f.name for f in UPLOAD_DIR.iterdir() if f.is_file()]

    @staticmethod
    def delete_file(filename: str) -> bool:
        file_path = UPLOAD_DIR / filename
        if file_path.exists():
            file_path.unlink()
            return True
        return False
