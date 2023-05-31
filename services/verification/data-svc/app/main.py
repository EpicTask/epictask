from typing import Union
from fastapi import FastAPI
from pydantic import BaseModel
from google.cloud import firestore
from fastapi.middleware.cors import CORSMiddleware

import json
import openai

class OpenAiPrompt(BaseModel):
    key: str
    prompt: str

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/openai")
async def get_ai_res(input: OpenAiPrompt):
    input_dict = input.dict()

    openai_prompt = input.prompt
    openai_key = input.key

    openai.api_key = openai_key

    response = openai.Completion.create(
            model="text-davinci-003",
            prompt=openai_prompt,
            temperature=0.6,
        )

    return {"prompt": openai_prompt, "response": response}

@app.get("/get/tasks")
def get_tasks():
    db = firestore.Client(project='task-coin-384722')
    doc_output = []

    task_events = db.collection(u'task_events')
    docs = task_events.stream()

    for doc in docs:
        # print(f'{doc.id} => {doc.to_dict()}')
        doc_output.append(doc.to_dict())

    return {"docs": doc_output}