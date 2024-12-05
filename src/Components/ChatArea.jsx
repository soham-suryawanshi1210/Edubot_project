import { useState, useEffect, useRef } from 'react';
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import 'regenerator-runtime/runtime';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
  InputToolbox
} from "@chatscope/chat-ui-kit-react";
import { FaMicrophone } from 'react-icons/fa';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import axios from 'axios'; 
import PropTypes from 'prop-types';  

export default function ChatArea({ getChatArea, handleLogout, setChatHistory }) {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([{
    message: "Hello I Am EduBot",
    sender: "ChatBot",
    direction: "incoming",
    position: "single"
  }]);
  const [userInput, setUserInput] = useState(''); 
  const inputRef = useRef(); 

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    const loadChat = async () => {
      const result = await getChatArea();
      if (result) {
        setMessages(prevMessages => [
          ...prevMessages,
          { message: result, sender: "System", direction: "incoming", position: "single" }
        ]);
      }
    };
    loadChat();
  }, [getChatArea]);

  const getBotResponse = async (prompt) => {
    try {
      const res = await axios.post('http://localhost:5000/getResponse', { prompt });
      return res.data.response;
    } catch (error) {
      console.error("Error fetching response:", error);
      return "Sorry, I couldn't get a response from the server.";
    }
  };

  // Helper function to strip HTML tags
const stripHTML = (text) => text.replace(/<\/?[^>]+(>|$)/g, "");

  const handleSend = async (messageText) => {
    if (!messageText.trim()) return;

 // Example of removing HTML tags from user input before sending
 const strippedMessage = stripHTML(messageText);

    SpeechRecognition.stopListening();
    resetTranscript();
    setUserInput('');

    const newMessage = {
      message: strippedMessage,
      sender: "user",
      direction: "outgoing",
      position: "single"
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setTyping(true);

    try {
      //const botResponse = await getBotResponse(messageText);
      const botResponse = await getBotResponse(strippedMessage);
      
      const botMessage = {
        message:  botResponse,
        sender: "ChatBot",
        direction: "incoming",
        position: "single"
      };

      setMessages(prevMessages => [...prevMessages, botMessage]);
      setChatHistory(prevHistory => [...prevHistory, { prompt: strippedMessage, response: stripHTML(botResponse)}]);
    } catch (error) {
      console.error("Error fetching bot response:", error);
      setMessages(prevMessages => [
        ...prevMessages,
        { message: "Error fetching response", sender: "ChatBot", direction: "incoming", position: "single" }
      ]);
    } finally {
      setTyping(false);
    }
  };

  const handleMicClick = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  useEffect(() => {
    if (listening) {
      setUserInput(transcript);
      inputRef.current.focus();
    }
  }, [transcript, listening]);

  return (
    <MainContainer>
      <ChatContainer>
        <div className="header">
          <h2>Chat Area</h2>
          <button onClick={handleLogout}>Logout</button>
        </div>
        <MessageList
          typingIndicator={typing ? <TypingIndicator content="EduBot is typing" /> : null}>
          {messages.map((msg, index) => (
            <Message 
              key={`${msg.sender}-${index}`}  // Ensures a unique key for each message don't remove or small box appears
              model={msg} />
          ))}
        </MessageList>

        <InputToolbox className="inputBox" style={{ display: 'flex', alignItems: 'center' }}>
          <button
            className='cs-button--mic'
            onClick={handleMicClick}
            disabled={!browserSupportsSpeechRecognition} 
          >
            <FaMicrophone size={22} color={listening ? 'red' : 'black'} />
          </button>

          <MessageInput
             ref={inputRef}
             placeholder={listening ? "Listening..." : "Enter Prompt Here"}
             value={userInput}
             onSend={() => handleSend(userInput)}  // Corrected to use `userInput` directly
             onChange={(val) => {
               setUserInput(val);
               if (val.trim() === '') {
                 SpeechRecognition.startListening({ continuous: true });
               } else {
                 SpeechRecognition.stopListening();
               }
             }}
             attachButton={false} 
             style={{ flex: 1 }} 
          />
        </InputToolbox>
      </ChatContainer>
    </MainContainer>
  );
}

ChatArea.propTypes = {
  getChatArea: PropTypes.func.isRequired,
  handleLogout: PropTypes.func.isRequired,
  setChatHistory: PropTypes.func.isRequired,
};
