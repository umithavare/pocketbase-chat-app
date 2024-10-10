import React, { ReactNode, useEffect, useState } from 'react';
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
            backgroundColor: '#7289da', // Butonun arka plan rengi (Discord mavimsi mor tonu)
            color: '#fff', // Butonun yazı rengi
            '&:hover': {
              backgroundColor: '#677bc4', // Hover durumu için daha açık bir ton
            },
            borderRadius: 2, // Hafif yuvarlatılmış köşeler
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
        sx={{ padding: 0, margin: 0 }} // Gereksiz boşlukları kaldırmak için padding ve margin sıfırlandı
      >
        {/* Navbar: sabit genişlik ve gizlenmiş scroll */}
        {/* <Box 
          sx={{
            width: 250, // Navbar için sabit genişlik
            backgroundColor: '#1e1e1e', // Koyu bir arka plan
            flexShrink: 0, 
            overflowY: 'auto', // Navbar çok genişlerse dikey scroll olur
            borderRight: '1px solid #333', // Sağ tarafında hafif bir sınır

            // Scroll barını gizleme stili:
            scrollbarWidth: 'none',  // Firefox için
            '&::-webkit-scrollbar': {
              display: 'none', // Chrome ve Safari için
            },
            padding: 0, // Navbar'ın içinde herhangi bir padding olmadığından emin olalım
            margin: 0, // Navbar'ın dışındaki boşlukları da kaldırıyoruz
          }}
        > */}
          <Navbar 
            conversations={conversations} 
            onConversationSelect={handleConversationSelect} 
          />
        {/* </Box> */}

        {/* Mesajlaşma alanı: ConversationDetails */}
        <Box 
          flexGrow={1} 
          display="flex" 
          flexDirection="column" 
          justifyContent="flex-start"
          alignItems="stretch"
          overflow="hidden" 
          padding={0} // İçerik kısmındaki boşlukları sıfırlamak için padding 0 yapıldı
          margin={0} // Kenarlardaki tüm boşlukları kaldırmak için margin sıfırlandı
          bgcolor="#121212" // Arka planı biraz daha koyu
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
                padding: 0, // Boşlukları kaldırmak için padding 0 yapıldı
                margin: 0, // Ekstra boşlukları kaldırmak için margin 0 yapıldı
              }}
            >
              {/* ConversationDetails genişliği kaplıyor */}
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
              sx={{ padding: 0, margin: 0 }} // Ekstra boşlukları sıfırlamak için padding ve margin 0 yapıldı
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
