import React from 'react';
import { Box, List, ListItem, Avatar, Tooltip } from '@mui/material';
import { styled } from '@mui/system';

const StyledNav = styled(Box)({
  width: '80px',
  height: '100vh',
  backgroundColor: '#1F2937',
  padding: '10px',
  color: '#1e1e1e',
  borderRight: '1px solid #1e1e1e',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

type Conversation = {
  id: string;
  name: string;
};

type NavbarProps = {
  conversations: Conversation[];
  onConversationSelect: (id: string) => void;
};

const Navbar: React.FC<NavbarProps> = ({ conversations, onConversationSelect }) => {
  return (
    <StyledNav>
      <List sx={{ width: '100%', maxHeight: 'calc(100vh - 150px)', overflowY: 'auto', padding: 0 }}>
        {conversations.map((conversation) => (
          <React.Fragment key={conversation.id}>
            <Tooltip title={conversation.name} placement="right">
              <ListItem
                button
                onClick={() => onConversationSelect(conversation.id)}
                sx={{
                  mb: 1,
                  borderRadius: '50%',
                  transition: 'background-color 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#1e1e1e',
                  },
                  padding: '10px',
                  justifyContent: 'center',
                }}
              >
                <Avatar sx={{ bgcolor: '#1e1e1e', width: 40, height: 40 }}>
                  {conversation.name.charAt(0).toUpperCase()}
                </Avatar>
              </ListItem>
            </Tooltip>
          </React.Fragment>
        ))}
      </List>
    </StyledNav>
  );
};

export default Navbar;
