import express from 'express';
import pkg from 'pg'; // PostgreSQL client
import cors from 'cors';
import axios from 'axios'; // For calling the Flask model

const app = express();
const port = 5000;
const { Pool } = pkg;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection setup
const pool = new Pool({
  user: 'postgres', // PostgreSQL username
  host: 'localhost', // Database host
  database: 'chatbotDB', // Database name
  password: 'root', // PostgreSQL password
  port: 5432, // PostgreSQL port
});

// Strip HTML tags to sanitize input
const stripHtml = (input) => input.replace(/<\/?[^>]+(>|$)/g, "").trim();

// Function to sanitize input for college location queries
const sanitizeForLocation = (input) => {
  // Removing punctuation (including question marks) and HTML tags
  return input.replace(/<\/?[^>]+(>|$)/g, "").replace(/[^\w\s]/gi, "").trim();
};

// Function to extract college name from the prompt
const extractCollegeName = (prompt) => {
  const collegeKeywords = ['where is', 'location of', 'find', 'where'];
  let collegeName = '';

  // Check if the prompt includes any of the college keywords
  for (const keyword of collegeKeywords) {
    if (prompt.includes(keyword)) {
      // Extracting college name by removing keyword and trimming
      collegeName = prompt.replace(new RegExp(`(${collegeKeywords.join('|')})`, 'i'), '').trim();
      break;
    }
  }

  return collegeName;
};

// Function to query the Flask model
const callFlaskModel = async (inputText) => {
  try {
    const response = await axios.post('http://127.0.0.1:5172/api', { message: inputText });
    return response.data.response;
  } catch (error) {
    console.error("Error calling Flask model:", error.message);
    return "I'm sorry, but I encountered an error while processing your request.";
  }
};

// Endpoint to handle the chatbot prompt
app.post('/getResponse', async (req, res) => {
  let { prompt } = req.body;

  // Sanitize input by stripping HTML tags and trimming
  prompt = stripHtml(prompt).toLowerCase();

  // Check for college location inquiries
  const collegeName = extractCollegeName(sanitizeForLocation(prompt.toLowerCase()));
  if (collegeName) {
    try {
      // Query to fetch the location based on the college name
      const result = await pool.query(
        "SELECT name, location FROM colleges WHERE LOWER(name) LIKE '%' || $1 || '%'",
        [collegeName.toLowerCase()]
      );

      if (result.rows.length > 0) {
        const foundCollegeName = result.rows[0].name; // College name
        const foundLocation = result.rows[0].location; // Location
        const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(foundCollegeName + ' ' + foundLocation)}`;

        return res.json({
          response: `The location of ${foundCollegeName} is: <a href="${googleMapsLink}" target="_blank">${foundLocation}</a>`
        });
      } else {
        return res.json({ response: `Sorry, I couldn't find the location for ${collegeName}.` });
      }
    } catch (err) {
      console.error("Error querying the database:", err.message);
      return res.status(500).send('Server Error');
    }
  }

  // If no college location was requested, fetch a general response
  try {
    // Query to fetch the response from the chatbot responses based on the sanitized prompt
    const result = await pool.query(
      'SELECT response FROM chatbot_responses WHERE LOWER(TRIM(prompt)) = $1',
      [prompt]
    );

    if (result.rows.length > 0) {
      return res.json({ response: result.rows[0].response });
    } else {
      // Forward the prompt to the Flask model if not found in the database
      const aiResponse = await callFlaskModel(prompt);
      //store into database
      try {
        await pool.query(
          'INSERT INTO chatbot_responses (prompt, response) VALUES ($1, $2)',
          [prompt, aiResponse]
        );
      } catch (error) {
        console.error("Error storing model response in the database:", error.message);
      }
      return res.json({ response: aiResponse });
    }
  } catch (err) {
    console.error("Error querying the database:", err.message);
    return res.status(500).send('Server Error');
  }
});

//feedback submission
app.post('/feedback', async (req, res) => {
  const { feedback } = req.body; // Get feedback from the request body
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(400).json({ message: 'Session ID (token) is required' });
  }
  try {
    // Sanitize feedback before storing it
    const sanitizedFeedback = stripHtml(feedback);

    // Insert feedback into the database
    await pool.query(
      'INSERT INTO feedback (feedback, session_id) VALUES ($1, $2)',
      [sanitizedFeedback, token]
    );

    res.status(201).send({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error("Error saving feedback:", error.message);
    res.status(500).send('Server Error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
