"use client";
import { useEffect, useState } from 'react';
import pb from '../../services/pocketbase';
import Layout from '../../components/Layout';
import { Typography } from '@mui/material';

type Conversation = {
  id: string;
  name: string;
};

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const fetchConversations = async () => {
      const records = await pb.collection('conversations').getFullList<Conversation>({
        filter: `participants ~ "${pb.authStore.model?.id}"`,
      });
      setConversations(records);
    };

    fetchConversations();
  }, []);

  return (
    <Layout conversations={conversations}>
      <Typography variant="h4" fontWeight="bold" mb={2}>
        Welcome to the Chat Application
      </Typography>
      <Typography variant="body1">
        Select a conversation to start chatting, or create a new one!
      </Typography>
    </Layout>
  );
}