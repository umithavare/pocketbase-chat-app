//use client;
import { useEffect, useState, useRef } from 'react';
import pb from '../../../services/pocketbase';
import { Box, Typography, TextField, Button, Paper, List, ListItem, ListItemText, Divider, IconButton, CircularProgress, Dialog, DialogContent, Avatar, InputAdornment, Popover } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import CloseIcon from '@mui/icons-material/Close';
import EmojiPicker from 'emoji-picker-react';

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

type ConversationDetailsProps = {
  conversationId: string;
};

export default function ConversationDetails({ conversationId }: ConversationDetailsProps) {
  const [messages, setMessages] = useState<Message[]>([]);
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
          filter: `conversation = \"${conversationId}\"`,
          sort: '-timestamp',
          autoCancel: false,
          signal: controller.signal,
        });
        setMessages(records.reverse());
        scrollToBottom();
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Request was aborted');
        } else {
          console.error('Error fetching messages:', error);
        }
      }
    };

    fetchMessages();

    // Realtime mesaj dinleme
    const unsubscribe = pb.collection('messages').subscribe<Message>('*', function (e) {
      if (e.record.conversation === conversationId) {
        setMessages((prevMessages) => [...prevMessages, e.record]);
        scrollToBottom();
      }
    });

    return () => {
      controller.abort();
      unsubscribe.then((unsub) => unsub());
    };
  }, [conversationId]);

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
      scrollToBottom();
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

  const handleEmojiClick = (event: React.MouseEvent<HTMLElement>) => {
    setEmojiAnchorEl(event.currentTarget);
  };

  const handleEmojiClose = () => {
    setEmojiAnchorEl(null);
  };

  const handleEmojiSelect = (emojiObject: any) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
    handleEmojiClose();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const open = Boolean(emojiAnchorEl);
  const id = open ? 'emoji-popover' : undefined;

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#36393f"
      color="#dcddde"
      p={3}
    >
      <Paper elevation={3} sx={{ width: '100%', height: '100%', p: 2, mb: 2, bgcolor: '#2f3136', color: '#dcddde', borderRadius: 2 }}>
        <List sx={{ maxHeight: '80vh', overflow: 'auto', mb: 2, bgcolor: '#2f3136', borderRadius: 1 }}>
          {messages.map((message) => (
            <ListItem key={message.id} alignItems="flex-start" sx={{ mb: 1 }}>
              <Avatar sx={{ bgcolor: '#7289da', mr: 2 }}>{message.sender[0]}</Avatar>
              <ListItemText
                primary={
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="subtitle2" fontWeight="bold" color="#ffffff">
                      {message.sender}
                    </Typography>
                    <Typography variant="caption" color="#72767d">
                      {new Date(message.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="#dcddde">
                      {message.content}
                    </Typography>
                    {message.file && message.file.length > 0 && (
                      message.file[0].endsWith('.jpg') || message.file[0].endsWith('.jpeg') || message.file[0].endsWith('.png') || message.file[0].endsWith('.webp') ? (
                        <Box mt={1} display="flex" justifyContent="flex-start">
                          <img
                            src={getFileUrl(message) || ''}
                            alt="attachment"
                            style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 8, cursor: 'pointer' }}
                            onClick={() => setSelectedImage(getFileUrl(message) || '')}
                          />
                        </Box>
                      ) : (
                        <Box mt={1} display="flex" justifyContent="flex-start">
                          <Typography variant="body2" color="#7289da">
                            <a href={getFileUrl(message) || ''} target="_blank" rel="noopener noreferrer" style={{ color: '#7289da' }}>
                              {message.file[0]}
                            </a>
                          </Typography>
                        </Box>
                      )
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
        <Divider sx={{ mt: 2, mb: 2, bgcolor: '#42454a' }} />
        <Box display="flex" alignItems="center" gap={2}>
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
                vertical: 'bottom',
                horizontal: 'left',
              }}
              sx={{
                '& .MuiPaper-root': {
                  backgroundColor: '#dcddde',  // Popover arka plan rengi
                  color: '#2f3136',            // Metin ve ikon rengi
                  borderRadius: '8px',         // Kenar yuvarlatma
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',  // Gölge
                },
                '& .EmojiPickerReact': {
                  backgroundColor: '#dcddde',  // Emoji picker arka plan rengi
                  color: '#2f3136',            // Emoji picker metin rengi
                },
                '& .EmojiPickerReact .emoji-categories': {
                  backgroundColor: '#dcddde',  // Kategori arka plan rengi
                },
                '& .EmojiPickerReact .emoji-group': {
                  backgroundColor: '#dcddde',  // Emoji grubunun arka plan rengi
                },
                '& .EmojiPickerReact .emoji-search': {
                  backgroundColor: '#dcddde',  // Arama çubuğu arka plan rengi
                  color: '#2f3136',            // Arama metin rengi
                },
              }}
          >
            <EmojiPicker onEmojiClick={handleEmojiSelect} />
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