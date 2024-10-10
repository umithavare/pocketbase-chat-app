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
  Grid,
  Paper,
  IconButton,
  useTheme,
  Autocomplete,
} from '@mui/material';
import { styled } from '@mui/system';
import CloseIcon from '@mui/icons-material/Close';
import pb from '../services/pocketbase';

// Stil tanımlamaları
const StyledNav = styled(Box)({
  width: '100px',
  height: '100vh',
  backgroundColor: '#1F2937',
  padding: '10px',
  color: '#ffffff',
  borderRight: '1px solid #1e1e1e',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-between',
  overflowY: 'hidden', // Scroll çubuğunu gizleme
});

// Tip tanımlamaları
type Conversation = {
  id: string;
  name: string;
};

type User = {
  id: string;
  name: string;
  avatar?: string;
};

type NavbarProps = {
  conversations: Conversation[];
  onConversationSelect: (id: string) => void;
};

const Navbar: React.FC<NavbarProps> = ({ conversations, onConversationSelect }) => {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [groupNameError, setGroupNameError] = useState('');
  const [selectedUsersError, setSelectedUsersError] = useState('');
  const theme = useTheme();

  // Kullanıcı listesini ve mevcut kullanıcıyı almak için useEffect
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const records = await pb.collection('users').getFullList<User>();
        const currentUser = JSON.parse(localStorage.getItem('user_record') || '{}');
        setUsers(records.filter((user) => user.id !== currentUser.id));
        setCurrentUserId(currentUser.id);
      } catch (error) {
        console.error('Kullanıcılar alınamadı:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setGroupName('');
    setSelectedUsers([]);
    setGroupNameError('');
    setSelectedUsersError('');
  };

  const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupName(e.target.value);
    if (e.target.value.trim() === '') {
      setGroupNameError('Grup adı zorunludur!');
    } else {
      setGroupNameError('');
    }
  };

  const handleCreateGroup = async () => {
    let valid = true;

    if (!groupName.trim()) {
      setGroupNameError('Grup adı zorunludur!');
      valid = false;
    }

    if (selectedUsers.length < 1) {
      setSelectedUsersError('En az bir katılımcı seçmelisiniz!');
      valid = false;
    }

    if (!valid) {
      return;
    }

    try {
      const participants = currentUserId
        ? Array.from(new Set([...selectedUsers.map((user) => user.id), currentUserId]))
        : selectedUsers.map((user) => user.id);

      await pb.collection('conversations').create({
        name: groupName,
        isGroup: true,
        participants: participants,
      });

      handleClose();
      window.location.reload();
    } catch (error) {
      console.error('Grup oluşturulamadı:', error);
      alert('Grup oluşturulamadı. Lütfen tekrar deneyin.');
    }
  };

  return (
    <StyledNav>
      {/* Konuşmalar Listesi */}
      <List
        sx={{
          width: 50,
          flexGrow: 1,
          overflowY: 'auto',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
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
            alignSelf: 'center',
            mt: 2,
          }}
        >
          +
        </Button>
      </List>

      {/* Grup Oluşturma Modalı */}
      <Modal open={open} onClose={handleClose}>
        <Box
          component={Paper}
          elevation={12}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            bgcolor: '#1F2937',
            color: '#ffffff',
            boxShadow: 24,
            p: 4,
            borderRadius: 4,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" component="h2" fontWeight="bold">
              Grup Oluştur
            </Typography>
            <IconButton onClick={handleClose} sx={{ color: '#ffffff' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <TextField
            fullWidth
            label="Grup Adı"
            value={groupName}
            onChange={handleGroupNameChange}
            variant="outlined"
            margin="normal"
            error={Boolean(groupNameError)}
            helperText={groupNameError}
            InputProps={{
              sx: {
                borderRadius: 2,
                bgcolor: '#374151',
                color: '#ffffff',
              },
            }}
            InputLabelProps={{
              sx: {
                color: '#9CA3AF',
              },
            }}
          />
          <Typography variant="subtitle1" mt={3} mb={2} fontWeight="medium">
            Katılımcıları Seçin:
          </Typography>
          <Autocomplete
            multiple
            options={users}
            getOptionLabel={(option) => option.name}
            value={selectedUsers}
            onChange={(event, newValue) => {
              setSelectedUsers(newValue);
              if (newValue.length >= 1) {
                setSelectedUsersError('');
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Katılımcı Ara"
                InputProps={{
                  ...params.InputProps,
                  sx: {
                    borderRadius: 2,
                    bgcolor: '#374151',
                    color: '#ffffff',
                  },
                }}
                InputLabelProps={{
                  sx: {
                    color: '#9CA3AF',
                  },
                }}
              />
            )}
            sx={{
              bgcolor: '#374151',
              borderRadius: 2,
              color: '#ffffff',
              mb: 2,
            }}
          />
          {selectedUsersError && (
            <Typography color="error" variant="body2" mt={1}>
              {selectedUsersError}
            </Typography>
          )}
          <Box display="flex" justifyContent="flex-end" mt={4}>
            <Button onClick={handleClose} sx={{ mr: 2 }} variant="outlined" color="secondary">
              İptal
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateGroup}
              sx={{
                bgcolor: '#3b82f6',
                '&:hover': {
                  bgcolor: '#2563eb',
                },
                borderRadius: 2,
              }}
            >
              Grup Oluştur
            </Button>
          </Box>
        </Box>
      </Modal>
    </StyledNav>
  );
};

export default Navbar;