
FROM python:3.9

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

COPY ./task-coin-firestore-creds.json /code/task-coin-firestore-creds.json

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./app /code/app

ENV GOOGLE_APPLICATION_CREDENTIALS="/code/task-coin-firestore-creds.json"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80"]