import React, { useEffect, useState } from 'react';
import Header from './Header';
import Navbar from './Navbar';
import { Box, Typography, Button } from '@mui/material'; // MUI'dan Button eklendi
import { useRouter } from 'next/navigation';
import ConversationDetails from '../app/conversations/[conversationId]/page';

type Conversation = {
  id: string;
  name: string;
};

type LayoutProps = {
  conversations: Conversation[];
  selectedConversationId?: string;
};

const Layout: React.FC<LayoutProps> = ({ conversations, selectedConversationId }) => {
  const router = useRouter();
  const [conversationId, setConversationId] = useState<string | null>(selectedConversationId || null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleConversationSelect = (id: string) => {
    setConversationId(id);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token'); // auth_token silinir
    router.push('/login'); // Login sayfasına yönlendirilir
  };

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      minHeight="100vh" 
      bgcolor="#1e1e1e" 
      color="#e0e0e0"
    >
      {/* Sabit header alanı */}
      <Header />

      {/* Çıkış Yap butonu */}
      <Box
        position="absolute"
        top={16}
        right={16}
      >
        <Button 
          variant="contained" 
          onClick={handleLogout}
          sx={{
            backgroundColor: '#7289da',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#677bc4',
            },
            borderRadius: 2,
          }}
        >
          Çıkış Yap
        </Button>
      </Box>

      {/* Navbar ve ConversationDetails bölgesi */}
      <Box 
        display="flex" 
        flexGrow={1} 
        height="calc(100vh - 64px)" 
        overflow="hidden"
        sx={{ padding: 0, margin: 0 }} 
      >
        {/* Navbar: sabit genişlik ve gizlenmiş scroll */}
        <Box
          sx={{
            width: '5%', // Navbar sabit genişlik
            flexShrink: 0,
            overflowY: 'hidden', // Kaydırılabilir ama taşmaz
            scrollbarWidth: 'none', // Firefox için
            '&::-webkit-scrollbar': {
              display: 'none', // Chrome ve diğer WebKit tarayıcılar için
            },
          }}
        >
          <Navbar 
            conversations={conversations} 
            onConversationSelect={handleConversationSelect} 
          />
        </Box>

        {/* Mesajlaşma alanı: ConversationDetails */}
        <Box 
          flexGrow={1} 
          display="flex" 
          flexDirection="column" 
          justifyContent="flex-start"
          alignItems="stretch"
          overflow="hidden" 
          padding={0}
          margin={0}
          bgcolor="#121212"
        >
          {conversationId ? (
            <Box
              sx={{
                flexGrow: 1,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'stretch',
                overflow: 'hidden',
                padding: 0,
                margin: 0,
              }}
            >
              <ConversationDetails 
                key={conversationId} 
                conversationId={conversationId} 
              />
            </Box>
          ) : (
            <Box 
              display="flex" 
              flexDirection="column"
              justifyContent="center" 
              alignItems="center" 
              width="100%" 
              height="100%"
              textAlign="center"
              sx={{ padding: 0, margin: 0 }}
            >
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Welcome to the Chat Application
              </Typography>
              <Typography variant="body1" color="#b0bec5">
                Select a conversation to start chatting, or create a new one!
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
