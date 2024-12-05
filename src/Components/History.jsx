import PropTypes from 'prop-types'; // Import PropTypes
import './History.css'; // Optional: add CSS for styling

const History = ({ chatHistory }) => {
  console.log(chatHistory); // Log the received chatHistory

  // Handle case when there is no chat history
  if (chatHistory.length === 0) {
    return (
      <div className="history-container">
        <h2>Chat History</h2>
        <p>No chat history available.</p>
      </div>
    );
  }

  // Function to export as a .txt file
  const exportChatHistoryTxt = () => {
    const chatText = chatHistory
      .map(item => `User: ${item.prompt}\nBot: ${item.response}\n\n`)
      .join('');
    const blob = new Blob([chatText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'chat-history.txt';
    link.click();
  };


  return (
    <div className="history-container">
      <h2>Chat History</h2>
      <ul>
        {chatHistory.map((item, index) => (
          <li key={index}>
            <strong>User:</strong> {item.prompt} <br />
            <strong>Bot:</strong> {item.response}
          </li>
        ))}
      </ul>

      {/* Export Buttons */}
      <div className="export-buttons">
        <button onClick={exportChatHistoryTxt}>Export as TXT</button>
      </div>
    </div>
  );
};

// Define PropTypes for the component
History.propTypes = {
  chatHistory: PropTypes.arrayOf(
    PropTypes.shape({
      prompt: PropTypes.string.isRequired,
      response: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default History;
