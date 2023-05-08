import os

import openai

from flask import Flask, redirect, render_template, request, url_for

app = Flask(__name__, template_folder='templates')


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/openai/test', methods=['GET'])
def getAiRes():
    input_prompt = request.args.get("input_prompt")
    input_key = request.args.get("input_key")

    openai.api_key = input_key

    response = openai.Completion.create(
            model="text-davinci-003",
            prompt=input_prompt,
            temperature=0.6,
        )

    return response

if __name__ == '__main__':
    app.run()