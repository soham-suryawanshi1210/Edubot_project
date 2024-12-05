import { useState, useEffect } from 'react';
import './App.css';
import { Layout, Button } from 'antd';
import { message } from 'antd'; // Import message for notifications
import { AiOutlineMenuFold, AiOutlineMenuUnfold } from 'react-icons/ai';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatArea from './Components/ChatArea';
import Login from './Components/Login';
import Logo from './Components/Logo';
import MenuList from './Components/MenuList';
import Settings from './Components/Settings';
import Feedback from './Components/Feedback';
import History from './Components/History';
import axios from 'axios'; // Import axios for API calls
//import { Modal } from 'antd';
import { notification } from 'antd'; // Import notification and Button

const { Sider, Content } = Layout;

function App() {
  const [token, setToken] = useState(null); // Initially null, token will be set after login
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
  const [chatKey, setChatKey] = useState(Date.now());
  const [messageApi] = message.useMessage();
  const [chatHistory, setChatHistory] = useState([]); // State to store chat history


  // Handle resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      const isSmall = window.innerWidth < 768;
      setIsSmallScreen(isSmall);
      setCollapsed(isSmall);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Remove token from localStorage when the window is closed
  useEffect(() => {
    const handleUnload = () => {
      localStorage.removeItem('token'); // Remove token when window is closed
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  const contentMarginLeft = collapsed ? (isSmallScreen ? 0 : 80) : 250;

  const handleNewChat = () => {
    setChatKey(Date.now()); // Update key to force remount
  };


  // Handle login by storing token in state (not in localStorage)
  const handleLogin = (newToken) => {
    setToken(String(newToken));// Set token in state only, not in localStorage
    message.success('Login successful!'); // Show a success message on login
  };

// Handle logout
const handleLogout = () => {
  notification.success({
    message: 'Do you want to Logout?',
    description: 'Click OK to Logout or Cancel to Continue',
    placement: 'top',
    btn: (
      <Button type="primary" onClick={() => {
        localStorage.removeItem('token'); // Remove token from local storage
        setToken(null); // Clear token from state
        window.location.reload(); // Refresh the page to go back to the login
      }}>
        OK
      </Button>
    ),
    duration: 0, // Keeps the notification visible until "OK" is clicked
  });
};



 // Function to send user message to the backend and get response
const handleSend = async (messageText) => {
  if (!messageText.trim()) 
    return; // Prevent sending empty messages
  try {
    // Send the message to the server
    const res = await axios.post('http://localhost:5000/getResponse', { prompt: messageText }, {
      headers: { Authorization: `Bearer ${token}` }, // Send token with every request
    });
    const response = res.data.response; // Capture the response from the server

    // Update history state with new message and response
    setChatHistory((prevHistory) => [
      ...prevHistory,
      { prompt: messageText, response }, // Now response is defined
    ]);
    return response; // Return the bot's response
  } catch (error) {
    console.error("Error fetching response:", error);
    messageApi.error("Error fetching response from the server.");
    return "Sorry, I couldn't get a response from the server.";
  }
};

  // Function to fetch chat area data from the server using the token
  const getChatArea = async () => {
    try {
      const res = await axios.get('http://localhost:5001/chatArea', {
        headers: { Authorization: `Bearer ${token}` }, // Use token for authorization
      });
      return res.data.message; // Return the chat area message from the server
    } catch (error) {
      console.error("Error fetching chat area:", error);
      messageApi.error("Error fetching chat area from the server.");
    }
  };

  // Check if token exists and render login or content area accordingly
  return (
    <Router>
      {!token ? (
        <Login setToken={handleLogin} />  // Show login page if not authenticated
      ) : (
        <Layout style={{ minHeight: '100vh' }}>
          <Sider
            collapsed={collapsed}
            collapsible
            trigger={null}
            className="sidebar"
            width={250}
            style={{ display: isSmallScreen && collapsed ? 'none' : 'block' }}
          >
            <Logo collapsed={collapsed} />
            <hr style={{ border: '1px solid white', width: '80%', margin: '0 auto' }} />
            <MenuList onNewChat={handleNewChat} onLogout={handleLogout} />
            <Button onClick={handleLogout} style={{ margin: '16px' }}>Logout
            </Button>
          </Sider>

          <Layout className="main-content" style={{ marginLeft: contentMarginLeft }}>
            <Button
              type="text"
              className="toggle"
              onClick={() => setCollapsed(!collapsed)}
              icon={collapsed ? <AiOutlineMenuUnfold className="menu-icon" /> : <AiOutlineMenuFold className="menu-icon" />}
            />
            <Content className="content-area">
              <Routes>
                <Route path="/" element={<ChatArea key={chatKey} handleSend={handleSend} getChatArea={getChatArea} handleLogout={handleLogout} chatHistory={chatHistory} 
                            setChatHistory={setChatHistory} />} />
    <Route path="/new-chat" element={<ChatArea key={chatKey} handleSend={handleSend} getChatArea={getChatArea} handleLogout={handleLogout} chatHistory={chatHistory} setChatHistory={setChatHistory} />} />
                <Route path="/history" element={<History chatHistory={chatHistory} />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/feedback" element={<Feedback token={token} />} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
        
      )}
    </Router>
  );
}

export default App;
