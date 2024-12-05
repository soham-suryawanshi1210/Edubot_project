import { useState } from 'react';
import { notification, Button, Modal } from 'antd'; // Import Modal from Ant Design
import './Feedback.css'; // Import the CSS file
import PropTypes from 'prop-types'; // Import PropTypes

export default function Feedback({ token }) {
  const [feedback, setFeedback] = useState('');
  const [isSupportModalVisible, setIsSupportModalVisible] = useState(false); // State for support modal visibility
  const [isAboutModalVisible, setIsAboutModalVisible] = useState(false); // State for about modal visibility

  const handleFeedbackChange = (event) => {
    setFeedback(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ feedback }),
      });

      if (response.ok) {
        setFeedback(''); // Clear the feedback textbox after submission

        // Show success notification
        notification.success({
          message: 'Feedback Submitted',
          description: 'Thank you for your feedback!',
          placement: 'top',
          btn: (
            <Button
              type="primary"
              onClick={() => {
                notification.destroy(); // Close the notification
              }}
            >
              OK
            </Button>
          ),
          duration: 0, // Keeps the notification visible until "OK" is clicked
        });
      } else {
        notification.error({
          message: 'Submission Failed',
          description: 'Please try again later.',
          placement: 'top',
        });
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      notification.error({
        message: 'An Error Occurred',
        description: 'Please try again later.',
        placement: 'top',
      });
    }
  };

  const handleContactSupportClick = () => {
    setIsSupportModalVisible(true); // Show the support modal
  };

  const handleAboutEdubotClick = () => {
    setIsAboutModalVisible(true); // Show the about modal
  };

  const handleModalClose = () => {
    setIsSupportModalVisible(false); // Close support modal
    setIsAboutModalVisible(false); // Close about modal
  };

  return (
    <div className="feedback-container">
      <hr className="separator2" />
      <h1 className="feedback-title">Feedback to the Administrator</h1>
      <form onSubmit={handleSubmit} className="feedback-form">
        <div>
          <textarea
            className="feedback-textarea"
            value={feedback}
            onChange={handleFeedbackChange}
            placeholder="Enter your feedback here..."
            rows="4"
            cols="50"
            required
          />
        </div>
        <button type="submit" className="feedback-button">Send Feedback</button>
      </form>
      <hr className="separator2" />
      <h1 className="feedback-title2">More Support</h1>
      <div className="additional-buttons">
        <button className="contact-button" onClick={handleContactSupportClick}>
          Contact Human Support
        </button>
        <button className="additional-button" onClick={handleAboutEdubotClick}>
          About Edubot
        </button>
      </div>

      {/* Support Modal */}
      <Modal
        title="Contact Customer Support"
        visible={isSupportModalVisible}
        onCancel={handleModalClose}
        footer={null}
        centered
      >
        <p>Customer Care Number: <strong>+9199603490489</strong></p>
        <Button type="primary">
          <a href="tel:+9199603490489" style={{ color: 'white' }}>Call Now</a>
        </Button>
      </Modal>

      {/* About Edubot Modal */}
      <Modal
        title="About Edubot"
        visible={isAboutModalVisible}
        onCancel={handleModalClose}
        footer={null}
        centered
      >
        <p>
          Edubot is an advanced educational chatbot designed to assist students and educators. 
          It provides personalized career guidance, academic support, and valuable resources 
          based on student performance and interests.
        </p>
        <p>
          Our goal is to make education services in Hands of each individual.
        </p>
      </Modal>
      <hr className="separator2" />
    </div>
  );
}

// PropTypes validation for token prop
Feedback.propTypes = {
  token: PropTypes.string.isRequired,
};
