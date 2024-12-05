import { useState } from 'react';
import axios from 'axios';
import { message, notification, Modal } from 'antd'; // Import Modal for confirmation
import './Settings.css';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false); // State to control the modal visibility

  const handleChangePassword = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token'); // Get token from storage
      const response = await axios.post(
        'http://localhost:5001/change-password',
        { oldPassword, newPassword },
        { headers: { Authorization: token } }
      );

      message.success(response.data.message, 3); // Show success message for 3 seconds
    } catch (error) {
      message.error(error.response?.data?.message || 'An error occurred', 4); // Show error message
    }
  };

  const showDeleteConfirm = () => {
    setIsModalVisible(true); // Show the confirmation modal
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');

      // Make the delete request to the server
      await axios.delete('http://localhost:5001/delete-account', {
        headers: { Authorization: token },
      });

      // Show success notification
      notification.success({
        message: 'Account deleted successfully.',
        description: 'You will be logged out now.',
        placement: 'top',
        duration: 3, // Show the notification for 3 seconds
      });

      // Remove the token from local storage and refresh the page
      localStorage.removeItem('token');
      window.location.reload(); // Refresh to log out the user
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'An error occurred while deleting the account';

      // Show error notification
      notification.error({
        message: 'Error deleting account',
        description: errorMessage,
        placement: 'top',
        duration: 3, // Show the error notification for 3 seconds
      });
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false); // Close the modal without deleting the account
  };

  return (
    <div className="settings">
      <div className="container">
      <hr className="separator" />
        <h2 className="title">Change Password</h2>
        <form onSubmit={handleChangePassword} className="form">
          <div className="input-group">
            <label className="label">Old Password:</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="input"
              required
            />
          </div>
          <div className="input-group">
            <label className="label">New Password:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input"
              required
            />
          </div>
          <button type="submit" className="button">
            Update Password
          </button>
        </form>

        {/* Separator Line */}
        <hr className="separator" />

        <h2 className="title-delete-account">Delete Account</h2>
        <button className="button-delete" onClick={showDeleteConfirm}>
          Delete Account
        </button>
        <hr className="separator" />

        {/* Confirmation Modal */}
        <Modal
          title="Confirm Deletion"
          visible={isModalVisible}
          onOk={handleDeleteAccount}
          onCancel={handleCancel}
          okText="OK"
          cancelText="Cancel"
        >
          <p>Are you sure you want to delete your account? This action cannot be undone.</p>
        </Modal>
      </div>
    </div>
  );
};

export default ChangePassword;
