# AI PDF Question Answering Assistant

An AI-powered application that allows users to upload PDF documents and ask questions about their content. It uses semantic search and a Large Language Model (LLM) to generate context-based answers.

## Features

- Upload PDF documents
- Extract text using PyMuPDF
- Split text into overlapping chunks
- Generate embeddings using Sentence Transformers
- Retrieve relevant content using FAISS
- Generate answers using the Groq API
- Display answers with page references

## Tech Stack

- **Language:** Python
- **Backend:** Flask
- **PDF Processing:** PyMuPDF
- **Embeddings:** Sentence Transformers (`all-MiniLM-L6-v2`)
- **Vector Search:** FAISS
- **LLM API:** Groq
- **Frontend:** HTML, CSS, JavaScript

## How It Works

1. Upload a PDF document.
2. Extract text and split it into chunks.
3. Convert chunks into embeddings.
4. Store embeddings in a FAISS index.
5. Retrieve relevant chunks for the user's question.
6. Send the retrieved context to the LLM.
7. Display the generated answer.

