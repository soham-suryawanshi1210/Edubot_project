from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from groq import Groq

app = Flask(__name__)
CORS(app)


client = Groq(
   api_key="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",
)
with open(r"JSPMdata.csv", "r") as file:
    csv_content = file.read()

system_message = f"""You are an AI assistant trained on the following CSV data about JSPM's RajarshiShahuCollegeofEngineering:

{csv_content}

Your task is to answer questions based on this data. If the topic is not related to jspm rscoe or If you don't have an answer in the provided data , respond with "I don't have information about that in my current dataset.".You can also give links to websiteor maps link if user asks.
"""

def generate_response(input_text):
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": input_text}
            ],
            model="mixtral-8x7b-32768",
            temperature=0.5,
            max_tokens=1000,
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        print(f"Error in generate_response: {e}")
        return "I'm sorry, but I encountered an error while processing your request. Please try again later."

@app.route('/')
def home():
    return "Hello, this is the EduBot server powered by Groq!"

@app.route('/api', methods=['POST'])
def chat():
    print("Received a request to /api/chat")
    data = request.get_json()
    print(f"Received data: {data}")
    input_text = data.get('message', '')
    
    if not input_text:
        return jsonify({'response': 'No input provided'}), 400
    
    response = generate_response(input_text)
    print(f"Sending response: {response}")
    return jsonify({'response': response})

if __name__ == '__main__':
    print("Starting Flask server...")
    app.run(debug=True, host='0.0.0.0', port=5172)