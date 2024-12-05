import { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { FaRegUser } from 'react-icons/fa';
import { MdLockOutline } from 'react-icons/md';
import { GiGraduateCap } from 'react-icons/gi';
import './Login.css';
import { useNavigate } from 'react-router-dom';

function Login({ setToken }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotSecurityAnswer, setForgotSecurityAnswer] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  // Password generator function
  const generateRandomPassword = () => {
    const length = 6; // Minimum length of password
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  };

  // Function to get the security question based on username
  const fetchSecurityQuestion = async (username) => {
    try {
      const response = await axios.post('http://localhost:5001/get-security-question', { username });
      
      if (response.data.securityQuestion) {
        setSecurityQuestion(response.data.securityQuestion);
        setForgotMessage(''); // Clear any previous messages
      } else {
        setForgotMessage('Username not found');
      }
    } catch (err) {
      setSecurityQuestion('');
      setForgotMessage(err.response?.data?.message || 'An error occurred while fetching the question.');
    }
  };

  // Handle submit for login/signup
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation for minimum username and password length
    if (username.length < 4 || password.length < 4) {
      setMessage('Username and password must be at least 6 characters long');
      return;
    }

    const endpoint = isLogin ? '/login' : '/signup';
    setLoading(true);

    const payload = isLogin
      ? { username, password }
      : { username, password, securityQuestion, securityAnswer };

    try {
      const res = await axios.post(`http://localhost:5001${endpoint}`, payload);
      setMessage(res.data.message);

      if (isLogin && res.data.token) {
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
        navigate('/');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password functionality
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMessage('');

    // Generate a new password
    const newPassword = generateRandomPassword();

    try {
      const res = await axios.post('http://localhost:5001/forgot-password', {
        username: forgotUsername,
        securityAnswer: forgotSecurityAnswer,
        newPassword,
      });

      setForgotMessage(`Your new password is: ${newPassword} You may Now Login and Change Password`); // Display the new password
    } catch (err) {
      setForgotMessage(err.response?.data?.message || 'An error occurred.');
    }
  };

  return (
    <div className="login-body">
      <div className="container">
        <h1 className="edubot-title">
          <GiGraduateCap className="graduation-icon" />
          EDUBOT
        </h1>

        <div className="moving-text">
          <p>
            ***Welcome to EDUBOT!*** Website will be down for Maintenance on 14th November (Tuesday)***
          </p>
        </div>

        <div className="header">
          <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
          <div className="underline"></div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input">
            <FaRegUser className="icon" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input">
            <MdLockOutline className="icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Show Security Question for Signup */}
          {!isLogin && (
            <>
              <div className="input">
                <MdLockOutline className="icon" />
                <input
                  type="text"
                  placeholder="Security Question (e.g., What is your pet's name?)"
                  value={securityQuestion}
                  onChange={(e) => setSecurityQuestion(e.target.value)}
                  required
                />
              </div>

              <div className="input">
                <MdLockOutline className="icon" />
                <input
                  type="text"
                  placeholder="Answer to Security Question"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <p style={{ textAlign: 'center', color: 'red', fontSize: '18px', marginTop: '2px' }}>
            {message}
          </p>

          <button type="submit" className="toggle-button" disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <button onClick={() => setIsLogin(!isLogin)} className="toggle-button">
          {isLogin ? 'Create an Account' : 'Already have an account?'}
        </button>

        <button onClick={() => setShowForgotPassword(true)} className="toggle-button">
          Forgot Password?
        </button>

        {showForgotPassword && (
          <>
            <div className="forgot-password-overlay" onClick={() => setShowForgotPassword(false)}></div>
            <div className="forgot-password-modal">
              <div className="header">
                <h2>Forgot Password</h2>
                <div className="underline"></div>
              </div>
              <form onSubmit={handleForgotPassword}>
                <div className="input">
                  <FaRegUser className="icon" />
                  <input
                    type="text"
                    placeholder="Username"
                    value={forgotUsername}
                    onChange={(e) => {
                      setForgotUsername(e.target.value);
                      fetchSecurityQuestion(e.target.value); // Fetch security question when username is entered
                    }}
                    required
                  />
                </div>
                {securityQuestion && (
                  <div className="input">
                    <MdLockOutline className="icon" />
                    <input
                      type="text"
                      placeholder={securityQuestion}
                      value={forgotSecurityAnswer}
                      onChange={(e) => setForgotSecurityAnswer(e.target.value)}
                      required
                    />
                  </div>
                )}
                <p style={{ color: 'red' }}>{forgotMessage}</p>
                <button type="submit" className="submit">
                  Reset Password
                </button>
              </form>
              <button onClick={() => setShowForgotPassword(false)} className="close-btn">
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

Login.propTypes = {
  setToken: PropTypes.func.isRequired,
};

export default Login;
