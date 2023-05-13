from typing import Union
from fastapi import FastAPI
from pydantic import BaseModel
from google.cloud import firestore

import json
import openai

class OpenAiPrompt(BaseModel):
    key: str
    prompt: str

app = FastAPI()


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

    users_ref = db.collection(u'task_management_service')
    docs = users_ref.stream()

    for doc in docs:
        print(f'{doc.id} => {doc.to_dict()}')
        doc_output.append(doc.id)

    return {"docs": doc_output}