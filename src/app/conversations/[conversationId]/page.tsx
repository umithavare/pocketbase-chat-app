"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import pb from '../../../services/pocketbase';
import { Box, Typography, TextField, Button, Paper, List, ListItem, ListItemText, Divider, IconButton, CircularProgress, Dialog, DialogContent } from '@mui/material';
import Image from 'next/image';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';

const BASE_URL = 'https://kerembas.com.tr/api/files';

type Message = {
  id: string;
  conversation: string;
  sender: string;
  content: string;
  timestamp: string;
  file?: string[];
  collectionId: string;
};

export default function ConversationDetails() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { conversationId } = useParams();

  useEffect(() => {
    if (!conversationId || typeof conversationId !== 'string') return;

    const controller = new AbortController();
    const fetchMessages = async () => {
      try {
        const records = await pb.collection('messages').getFullList<Message>({
          filter: `conversation = "${conversationId}"`,
          sort: '-timestamp',
          autoCancel: false,
          signal: controller.signal,
        });
        setMessages(records);
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
        setMessages((prevMessages) => [e.record, ...prevMessages]);
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
    formData.append('conversation', Array.isArray(conversationId) ? conversationId.join(',') : conversationId);
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
      return `${BASE_URL}/${message.collectionId}/${message.id}/${message.file[0]}`;
    }
    return null;
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#121212"
      color="#e0e0e0"
      p={3}
    >
      <Paper elevation={5} sx={{ width: '100%', maxWidth: 700, p: 3, mb: 3, bgcolor: '#1e1e1e', color: '#e0e0e0', borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center" color="#ffffff" fontWeight="bold">
          Conversation
        </Typography>
        <Divider sx={{ mb: 2, bgcolor: '#424242' }} />
        <List sx={{ maxHeight: 400, overflow: 'auto', mb: 2, bgcolor: '#1a1a1a', borderRadius: 1 }}>
          {messages.map((message) => (
            <ListItem key={message.id} alignItems="flex-start">
              <ListItemText
                primary={
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="subtitle1" fontWeight="bold" color="#90caf9">
                      {message.sender}
                    </Typography>
                    <Typography variant="caption" color="#b0bec5">
                      {new Date(message.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="#b0bec5">
                      {message.content}
                    </Typography>
                    {message.file && message.file.length > 0 && (
                      message.file[0].endsWith('.jpg') || message.file[0].endsWith('.jpeg') || message.file[0].endsWith('.png') || message.file[0].endsWith('.webp') ? (
                        <Box mt={1} display="flex" justifyContent="flex-start">
                          <Image
                            src={getFileUrl(message) || ''}
                            alt="attachment"
                            width={150}
                            height={150}
                            style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 8, cursor: 'pointer' }}
                            onClick={() => setSelectedImage(getFileUrl(message) || '')}
                          />
                        </Box>
                      ) : (
                        <Box mt={1} display="flex" justifyContent="flex-start">
                          <Typography variant="body2" color="#90caf9">
                            <a ref={getFileUrl(message)} target="_blank" rel="noopener noreferrer" style={{ color: '#90caf9' }}>
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
        </List>
        <Divider sx={{ mt: 2, mb: 2, bgcolor: '#424242' }} />
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            fullWidth
            variant="filled"
            placeholder="Write a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            InputProps={{ style: { color: '#e0e0e0', backgroundColor: '#2c2c2c' } }}
            sx={{ input: { color: '#e0e0e0' }, bgcolor: '#2c2c2c', borderRadius: 1 }}
          />
          <input
            accept="image/*,application/pdf"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload">
            <IconButton component="span" sx={{ color: '#90caf9' }}>
              <AttachFileIcon />
            </IconButton>
          </label>
          <Button
            variant="contained"
            color="primary"
            endIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            onClick={handleSendMessage}
            disabled={isUploading}
            sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' }, borderRadius: 1, height: '100%' }}
          >
            {isUploading ? 'Uploading...' : 'Send'}
          </Button>
        </Box>
      </Paper>
      <Dialog open={Boolean(selectedImage)} onClose={() => setSelectedImage(null)} maxWidth="md">
        <DialogContent sx={{ p: 0 }}>
          <img src={selectedImage || ''} alt="Full Size" style={{ width: '100%', height: 'auto' }} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}