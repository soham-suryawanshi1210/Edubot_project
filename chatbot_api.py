from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from groq import Groq

app = Flask(__name__)
CORS(app)

client = Groq(api_key="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")
#client = Groq(
 #   api_key=os.environ.get("API_KEY"),
#) 
with open(r"JSPMdata.csv", "r") as file:
    csv_content = file.read()

system_message = """You are an AI assistant for JSPM's RajarshiShahu College of Engineering (RSCOE). Your primary goal is to:

1. Provide accurate information strictly from the provided dataset about RSCOE
2. Answer questions related to the college with precision and brevity
3. Respond to greetings and simple queries with short, friendly messages (2-3 lines)

Guidelines:
- Only answer questions about JSPM RSCOE
- If a question is outside the dataset's scope, respond with: "I don't have information about that in my current dataset."
- For branch-specific queries, provide official website links if available
- Maintain a helpful and professional tone
- Avoid long, unnecessary explanations
- Prioritize clarity and directness in responses

Example responses:
- Greeting: "Hello! I'm the RSCOE assistant. How can I help you learn about our college today?"
- Off-topic query: "I don't have information about that in my current dataset."
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