# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
EDUbot: A Knowledge-Driven Chatbot for JSPM's RSCOE JSPM-logo.


Overview

EDUbot is a sophisticated chatbot designed to provide informative and engaging responses to user queries. Leveraging the power of Retrieval Augmented Generation (RAG) and the Groq LLM, EDUbot is capable of accessing and processing vast amounts of information to deliver accurate and relevant answers.

Key Features

RAG-Powered Responses: EDUbot utilizes RAG to retrieve relevant information from a knowledge base and generates comprehensive and informative responses.
Groq LLM Integration: The Groq LLM provides the foundation for EDUbot's natural language understanding and generation capabilities.
Continuous Learning: EDUbot can be continuously trained and updated with new information, ensuring that it remains up-to-date and accurate.
User-Friendly Interface: The chatbot interface is designed to be intuitive and easy to use, allowing for seamless interaction.
How to Use

Installation:

Set up the Knowledge Base:
Create a knowledge base containing relevant information.
Configure the chatbot to access and process this knowledge base.

Configure the Groq LLM:
Set up the necessary credentials and API keys for the Groq LLM.

Database Setup:
Construct a PostgreSQL database consisting of chatbotDB database with colleges,chatbot_responses and colleges table.
second database named 'Authentication' with users table.
Refer server.js and server2.js file for more information.

Running the Chatbot:
run commands:
npm run dev
server.js
server2.js
python chatbot_api.py

Interact with the Chatbot:
Use the provided interface or API to send queries to the chatbot.
Technical Details

RAG Implementation:
The RAG component retrieves relevant information from the knowledge base based on user queries.
The retrieved information is processed and used to generate responses.
Groq LLM Integration:
The Groq LLM is used to understand user queries and generate human-quality responses.
Model Training:
The chatbot can be fine-tuned on specific datasets to improve its performance on particular tasks.
Future Directions

Enhanced Knowledge Base: Expanding the knowledge base to include more diverse and up-to-date information.
Improved Response Generation: Further refining the response generation process to produce even more informative and engaging responses.
Multilingual Support: Enabling the chatbot to support multiple languages.
Advanced Features: Implementing advanced features such as summarization, translation, and code generation.
