// components/Navbar.tsx

"use client";
import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  Avatar,
  Tooltip,
  Button,
  Modal,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import { styled } from '@mui/system';
import pb from '../services/pocketbase'; // PocketBase servisini doğru şekilde içe aktarın

// Stil tanımlamaları
const StyledNav = styled(Box)({
  width: '100px', // Daha geniş bir alan
  height: '100vh',
  backgroundColor: '#1F2937',
  padding: '10px',
  color: '#ffffff',
  borderRight: '1px solid #1e1e1e',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-between', // Butonu en alta yerleştirmek için
});

// Tip tanımlamaları
type Conversation = {
  id: string;
  name: string;
};

type User = {
  id: string;
  name: string;
};

type NavbarProps = {
  conversations: Conversation[];
  onConversationSelect: (id: string) => void;
};

const Navbar: React.FC<NavbarProps> = ({ conversations, onConversationSelect }) => {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Kullanıcı listesini ve mevcut kullanıcıyı almak için useEffect
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const records = await pb.collection('users').getFullList<User>();
        setUsers(records);
      } catch (error) {
        console.error('Kullanıcılar alınamadı:', error);
      }
    };

    const fetchCurrentUser = async () => {
      const user = pb.authStore.model;
      if (user) {
        setCurrentUserId(user.id);
      }
    };

    fetchUsers();
    fetchCurrentUser();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setGroupName('');
    setSelectedUsers([]);
  };

  const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupName(e.target.value);
  };

  const handleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (groupName.trim() && selectedUsers.length > 0) {
      try {
        // Mevcut kullanıcıyı katılımcılara ekleyin (opsiyonel)
        const participants = currentUserId
          ? Array.from(new Set([...selectedUsers, currentUserId]))
          : selectedUsers;

        await pb.collection('conversations').create({
          name: groupName,
          isGroup: true,
          participants: participants,
        });

        // Grup oluşturulduktan sonra modalı kapat ve formu temizle
        handleClose();

        // Konuşmaları güncellemek için sayfayı yeniden yükleyebilirsiniz
        window.location.reload();
      } catch (error) {
        console.error('Grup oluşturulamadı:', error);
        alert('Grup oluşturulamadı. Lütfen tekrar deneyin.');
      }
    } else {
      alert('Grup adı ve katılımcılar zorunludur!');
    }
  };

  return (
    
    <StyledNav>
      
      {/* Konuşmalar Listesi */}
      <List sx={{ width: 50, flexGrow: 1, overflowY: 'auto', padding: 0 }}>
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
                    backgroundColor: '#374151',
                  },
                  padding: '5px',
                  justifyContent: 'center',
                }}
              >
                <Avatar sx={{ bgcolor: '#374151', width: 40, height: 40 }}>
                  {conversation.name.charAt(0).toUpperCase()}
                </Avatar>
              </ListItem>
            </Tooltip>
          </React.Fragment>
        ))}
        <Button
        onClick={handleOpen}
        sx={{
          width: 40,
          height: 40,
          minWidth: 0,
          borderRadius: '50%',
          bgcolor: '#4B5563',
          color: 'white',
          '&:hover': {
            bgcolor: '#6B7280',
          },
          justifyContent: 'center',
          padding: '5px',

        }}
      >
        +
      </Button>
      </List>

      {/* + Create New Group Butonu */}


      {/* Grup Oluşturma Modalı */}
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" component="h2" mb={2}>
            Grup Oluştur
          </Typography>
          <TextField
            fullWidth
            label="Grup Adı"
            value={groupName}
            onChange={handleGroupNameChange}
            variant="outlined"
            margin="normal"
          />
          <Typography variant="subtitle1" mt={2} mb={1}>
            Katılımcıları Seçin:
          </Typography>
          <FormGroup>
            {users.map((user) => (
              <FormControlLabel
                key={user.id}
                control={
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleUserSelection(user.id)}
                  />
                }
                label={user.name}
              />
            ))}
          </FormGroup>
          <Box display="flex" justifyContent="flex-end" mt={3}>
            <Button onClick={handleClose} sx={{ mr: 2 }}>
              İptal
            </Button>
            <Button variant="contained" color="primary" onClick={handleCreateGroup}>
              Grup Oluştur
            </Button>
          </Box>
        </Box>
      </Modal>
    </StyledNav>
  );
};

export default Navbar;
