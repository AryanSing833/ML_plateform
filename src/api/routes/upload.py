import os
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
from pypdf import PdfReader
from src.storage.local_storage import LocalStorage
from src.storage.s3_storage import S3Storage
from src.rag.chunker import TextChunker
from src.rag.embeddings import EmbeddingsModel
from src.rag.vector_store import VectorStore

router = APIRouter()
s3_storage = S3Storage()
chunker = TextChunker()

from src.api.dependencies import embeddings_model, vector_store

def process_document(file_path: str, filename: str):
    try:
        text = ""
        if filename.endswith('.pdf'):
            reader = PdfReader(file_path)
            for page in reader.pages:
                text += page.extract_text() + "\n"
        elif filename.endswith('.txt'):
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
        else:
            return # Unsupported in background
        
        if not text.strip():
            return

        chunks = chunker.chunk_text(text, source=filename)
        if not chunks:
            return

        texts = [c["text"] for c in chunks]
        embeddings = embeddings_model.get_embeddings(texts)
        
        vector_store.add_documents(embeddings, chunks)
        print(f"Successfully indexed {filename}")
    except Exception as e:
        print(f"Error processing {filename}: {e}")

@router.post("/api/upload")
async def upload_document(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.endswith(('.pdf', '.txt')):
        raise HTTPException(status_code=400, detail="Only PDF and TXT files are supported")
    
    content = await file.read()
    file_path = await LocalStorage.save_file(file.filename, content)
    
    # Optional S3 upload
    s3_storage.upload_file(file_path, file.filename)
    
    # Process in background to return quickly
    background_tasks.add_task(process_document, file_path, file.filename)
    
    return {"message": "File uploaded successfully. Processing in background.", "filename": file.filename}

@router.get("/api/documents")
async def list_documents():
    files = LocalStorage.get_files()
    return {"documents": files}

@router.delete("/api/documents/{filename}")
async def delete_document(filename: str):
    success = LocalStorage.delete_file(filename)
    if success:
        return {"message": f"Deleted {filename}"}
    raise HTTPException(status_code=404, detail="File not found")
