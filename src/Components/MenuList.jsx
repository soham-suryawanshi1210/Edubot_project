import { Link } from 'react-router-dom';
import { Menu } from 'antd';
import { PlusSquareOutlined, HistoryOutlined } from "@ant-design/icons";
import { FaRegBookmark } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { RiLogoutBoxLine } from "react-icons/ri";
import { useNavigate } from 'react-router-dom'; // Import useNavigate for programmatic navigation
import PropTypes from 'prop-types'; // Import PropTypes

const MenuList = ({ onNewChat, onLogout }) => {
  const navigate = useNavigate(); // Use the hook to navigate programmatically

  const handleNewChat = () => {
    onNewChat(); // Call the function to reset chat
    navigate('/new-chat'); // Navigate to the new chat page
  };

  return (
    <Menu className="custom-menu" theme='dark' mode='inline'>
      <Menu.Item key='NewChat' icon={<PlusSquareOutlined />} onClick={handleNewChat}>
        New Chat
      </Menu.Item>
      <Menu.Item key='History' icon={<HistoryOutlined />}>
        <Link to="/history">History</Link>
      </Menu.Item>
      <Menu.Item key='Feedback' icon={<FaRegBookmark />}>
        <Link to="/feedback">Support</Link>
      </Menu.Item>
      <Menu.Item key='Settings' icon={<IoSettingsOutline />}>
        <Link to="/settings">Settings</Link>
      </Menu.Item>
      <Menu.Item key='LogOut' icon={<RiLogoutBoxLine />} onClick={onLogout}>Logout</Menu.Item>
    </Menu>
  );
}
MenuList.propTypes = {
  onNewChat: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default MenuList;
