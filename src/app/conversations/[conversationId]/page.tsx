//use client;
import { useEffect, useState, useRef } from 'react';
import pb from '../../../services/pocketbase';
import { Box, Typography, TextField, Button, Paper, List, Grid, Avatar, IconButton, CircularProgress, Dialog, DialogContent, InputAdornment, Popover } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import CloseIcon from '@mui/icons-material/Close';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
const BASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL;

type Message = {
  id: string;
  conversation: string;
  sender: string;
  content: string;
  timestamp: string;
  file?: string[];
  collectionId: string;
};

type User = {
  id: string;
  username: string;
  avatar: string;
};

type ConversationDetailsProps = {
  conversationId: string;
};

export default function ConversationDetails({ conversationId }: ConversationDetailsProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<{ [key: string]: User }>({});
  const [newMessage, setNewMessage] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [emojiAnchorEl, setEmojiAnchorEl] = useState<null | HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    const controller = new AbortController();
    const fetchMessages = async () => {
      try {
        const records = await pb.collection('messages').getFullList<Message>({
          filter: `conversation = "${conversationId}"`,
          sort: '-timestamp',
          autoCancel: false,
          signal: controller.signal,
        });
        setMessages(records.reverse());

        const userIds = Array.from(new Set(records.map((message) => message.sender)));
        const usersData = await Promise.all(
          userIds.map(async (userId) => {
            const user = await pb.collection('users').getOne<User>(userId);
            return {
              id: user.id,
              username: user.username,
              avatar: user.avatar,
            };
          })
        );
        const usersMap = usersData.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {} as { [key: string]: User });
        setUsers(usersMap);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Request was aborted');
        } else {
          console.error('Error fetching messages:', error);
        }
      }
    };

    fetchMessages();

    const unsubscribe = pb.collection('messages').subscribe<Message>('*', function (e) {
      if (e.record.conversation === conversationId) {
        setMessages((prevMessages) => [...prevMessages, e.record]);
      }
    });

    return () => {
      controller.abort();
      unsubscribe.then((unsub) => unsub());
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append('conversation', conversationId);
    formData.append('sender', pb.authStore.model?.id || '');
    formData.append('content', newMessage);
    formData.append('timestamp', new Date().toISOString());

    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    try {
      await pb.collection('messages').create(formData);
      setNewMessage('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const getFileUrl = (message: Message) => {
    if (message.file && message.file.length > 0) {
      return `${BASE_URL}/api/files/${message.collectionId}/${message.id}/${message.file[0]}`;
    }
    return null;
  };

  const getAvatarUrl = (user?: User) => {
    if (user && user.avatar) {
      return `${BASE_URL}/api/files/_pb_users_auth_/${user.id}/${user.avatar}`;
    }
    return null;
  };

  const handleEmojiClick = (event: React.MouseEvent<HTMLElement>) => {
    setEmojiAnchorEl(event.currentTarget);
  };

  const handleEmojiClose = () => {
    setEmojiAnchorEl(null);
  };

  const handleEmojiSelect = (emojiObject: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
    handleEmojiClose();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const open = Boolean(emojiAnchorEl);
  const id = open ? 'emoji-popover' : undefined;

  return (
  <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100vh" bgcolor="#36393f" color="#dcddde" p={3}>
    <Paper elevation={3} sx={{ width: '100%', height: '80vh', p: 2, mb: 2, bgcolor: '#2f3136', color: '#dcddde', borderRadius: 2 }}>
    <List
  sx={{
    maxHeight: '60vh',
    overflowY: 'auto',
    mb: 2,
    bgcolor: '#2f3136',
    borderRadius: 1,
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#555',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: '#2f3136',
    },
  }}
>
  {messages.map((message, index) => {
    const user = users[message.sender];
    const isSender = pb.authStore.model?.id === message.sender;
    const previousMessage = messages[index - 1];
    const showDateDivider = !previousMessage || new Date(previousMessage.timestamp).toDateString() !== new Date(message.timestamp).toDateString();
    return (
      <div key={message.id}>
        {showDateDivider && (
          <Box display="flex" justifyContent="center" my={2}>
            <Typography variant="caption" color="#72767d">
              {new Date(message.timestamp).toDateString()}
            </Typography>
          </Box>
        )}
        <Grid container justifyContent={isSender ? 'flex-end' : 'flex-start'} sx={{ mb: 1, pr: isSender ? 2 : 0, pl: isSender ? 0 : 2 }}>
          <Grid item xs={12} sm={10} md={8} lg={6}>
            <Box display="flex" flexDirection={isSender ? 'row-reverse' : 'row'} alignItems="flex-start" gap={1.5}>
              <Avatar src={getAvatarUrl(user) || undefined} sx={{ bgcolor: '#7289da', width: 32, height: 32 }}>
                {!user?.avatar && user?.username[0]}
              </Avatar>
              <Paper sx={{ p: 1.5, bgcolor: isSender ? '#3b4252' : '#4c566a', borderRadius: 2, maxWidth: '100%' }}>
                <Typography variant="body2" color="#ffffff">
                  {message.content}
                </Typography>
                <Typography variant="caption" color="#72767d" display="block" textAlign={isSender ? 'right' : 'left'}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
                {message.file && message.file.length > 0 && (
                  <Box mt={1} display="flex" justifyContent={isSender ? 'flex-end' : 'flex-start'}>
                    {message.file[0].endsWith('.jpg') || message.file[0].endsWith('.jpeg') || message.file[0].endsWith('.png') || message.file[0].endsWith('.webp') ? (
                      <img
                        src={getFileUrl(message) || ''}
                        alt="attachment"
                        style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 8, cursor: 'pointer' }}
                        onClick={() => setSelectedImage(getFileUrl(message) || '')}
                      />
                    ) : (
                      <Typography variant="body2" color="#7289da">
                        <a href={getFileUrl(message) || ''} target="_blank" rel="noopener noreferrer" style={{ color: '#7289da' }}>
                          {message.file[0]}
                        </a>
                      </Typography>
                    )}
                  </Box>
                )}
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </div>
    );
  })}
  <div ref={messagesEndRef} /> {/* Liste sonuna eklenen div ile ref atanması */}
</List>


      <Box
        display="flex"
        alignItems="center"
        gap={2}
        sx={{
          position: 'sticky', // Sabit olarak görünmesini sağlar
          bottom: 0,
          backgroundColor: '#2f3136',
          p: 2,
          borderRadius: 2,
          zIndex: 1,
        }}
      >
        <TextField
          fullWidth
          variant="filled"
          placeholder="Write a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          InputProps={{
            style: { color: '#dcddde', backgroundColor: '#40444b', borderRadius: 20, padding: '10px' },
            startAdornment: (
              <InputAdornment position="start">
                <IconButton sx={{ color: '#7289da' }} onClick={handleEmojiClick}>
                  <EmojiEmotionsIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ input: { color: '#dcddde' }, bgcolor: '#40444b', borderRadius: 2 }}
        />
        <Popover
          id={id}
          open={open}
          anchorEl={emojiAnchorEl}
          onClose={handleEmojiClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          sx={{
            '& .MuiPaper-root': {
              backgroundColor: '#36393f',
              color: '#dcddde',
              borderRadius: '8px',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
            },
          }}
        >
          <EmojiPicker
            onEmojiClick={handleEmojiSelect}
            disableAutoFocus
            theme="dark"
            searchDisabled={false}
            skinTonesDisabled={false}
          />
        </Popover>

        <input
          accept="image/*,application/pdf"
          style={{ display: 'none' }}
          id="file-upload"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload">
          <IconButton component="span" sx={{ color: '#7289da' }}>
            <AttachFileIcon />
          </IconButton>
        </label>
        {selectedFile && (
          <Box display="flex" alignItems="center" gap={1} bgcolor="#40444b" p={1} borderRadius={2}>
            <Typography variant="body2" color="#dcddde">
              {selectedFile.name}
            </Typography>
            <IconButton size="small" sx={{ color: '#ff6f61' }} onClick={() => setSelectedFile(null)}>
              <CloseIcon />
            </IconButton>
          </Box>
        )}
        <Button
          variant="contained"
          color="primary"
          endIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          onClick={handleSendMessage}
          disabled={isUploading}
          sx={{ bgcolor: '#7289da', '&:hover': { bgcolor: '#677bc4' }, borderRadius: 1, height: '100%' }}
        >
          {isUploading ? 'Uploading...' : 'Send'}
        </Button>
      </Box>
    </Paper>
    <Dialog open={Boolean(selectedImage)} onClose={() => setSelectedImage(null)} maxWidth="md" fullWidth>
      <DialogContent sx={{ p: 0 }}>
        <img src={selectedImage || ''} alt="Full Size" style={{ width: '100%', height: 'auto' }} />
      </DialogContent>
    </Dialog>
  </Box>
);

}