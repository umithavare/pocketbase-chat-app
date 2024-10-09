"use client";
import { useEffect, useState } from 'react';
import pb from '../../services/pocketbase';
import Link from 'next/link';

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
    <div>
      <h1>Conversations</h1>
      {conversations.map((conversation) => (
        <div key={conversation.id}>
          <Link href={`/conversations/${conversation.id}`}>
            {conversation.name}
          </Link>
        </div>
      ))}
      <Link href="/create-conversation">
        <button>Create Conversation</button>
      </Link>
    </div>
  );
}
