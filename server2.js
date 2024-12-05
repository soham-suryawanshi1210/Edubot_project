import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pkg from 'pg';
import cors from 'cors';

const app = express();
const port = 5001;
const { Pool } = pkg;

// PostgreSQL connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Authentication',
  password: 'root',
  port: 5432,
});

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Sign-up route
app.post('/signup', async (req, res) => {
  const { username, password, securityQuestion, securityAnswer } = req.body;

  // Check if user already exists
  const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  if (userCheck.rows.length > 0) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Hash password and security answer
  const hashedPassword = await bcrypt.hash(password, 10);
  const hashedAnswer = await bcrypt.hash(securityAnswer, 10);

  try {
    // Insert new user into database
    await pool.query(
      'INSERT INTO users (username, password, security_question, security_answer) VALUES ($1, $2, $3, $4)',
      [username, hashedPassword, securityQuestion, hashedAnswer]
    );
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred while signing up the user' });
  }
});



// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Find user in the database
  const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

  if (user.rows.length === 0) {
    return res.status(400).json({ message: 'User does not exist' });
  }

  // Compare hashed password
  const validPassword = await bcrypt.compare(password, user.rows[0].password);
  if (!validPassword) {
    return res.status(400).json({ message: 'Invalid password' });
  }

  // Generate JWT token
  const token = jwt.sign({ userId: user.rows[0].id }, 'secretkey', { expiresIn: '1h' });

  res.json({ token, message: 'Login successful' });
});

// Protected route (Chatarea)
app.get('/chatarea', (req, res) => {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, 'secretkey', (err) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }

    // If token is valid, allow access to the chatarea
    res.json({ message: 'Welcome to the Chat Area!' });
  });
});

//password change section
// Change Password route
app.post('/change-password', async (req, res) => {
  const token = req.headers['authorization'];
  const { oldPassword, newPassword } = req.body;

  // Check for token
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, 'secretkey');
    const userId = decoded.userId;

    // Fetch the user from the database
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate the old password
    const validPassword = await bcrypt.compare(oldPassword, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedNewPassword, userId]);

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred while changing the password' });
  }
});
//password update section

//delete section start
app.delete('/delete-account', async (req, res) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, 'secretkey');
    const userId = decoded.userId;

    // Delete the user from the database
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred while deleting the account' });
  }
});
//delete section

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

//forgot password
app.post('/forgot-password', async (req, res) => {
  const { username, securityAnswer, newPassword } = req.body;

  try {
    // Find user by username
    const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare provided answer with stored hashed answer
    const isAnswerValid = await bcrypt.compare(securityAnswer, user.rows[0].security_answer);
    if (!isAnswerValid) {
      return res.status(400).json({ message: 'Incorrect answer to the security question' });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await pool.query('UPDATE users SET password = $1 WHERE username = $2', [hashedNewPassword, username]);

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred while resetting the password' });
  }
});
//forgot password

// Fetch security question route
app.post('/get-security-question', async (req, res) => {
  const { username } = req.body;

  try {
    // Query the database for the user's security question
    const result = await pool.query('SELECT security_question FROM users WHERE username = $1', [username]);

    // Check if user exists in the database
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Username not found' });
    }

    // Return the security question
    res.json({ securityQuestion: result.rows[0].security_question });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred while fetching the question' });
  }
});



