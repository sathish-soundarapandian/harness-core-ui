import React, { useState } from 'react';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import TweetyChatPage from '@cd/pages/tweety/TweetyChatPage';

const ChatbotDrawer = ({ isOpen, onClose }) => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const toggleChatbot = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setIsChatbotOpen(open);
  };

  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose}>
      {isChatbotOpen ? (
        <TweetyChatPage />
      ) : (
        <div className="drawer-content">
          <Button variant="contained" color="primary" onClick={toggleChatbot(true)}>
            Open Chatbot
          </Button>
        </div>
      )}
    </Drawer>
  );
};

export default ChatbotDrawer;
