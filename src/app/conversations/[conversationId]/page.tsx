"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import pb from '../../../services/pocketbase';

type Message = {
  id: string;
  conversation: string;
  sender: string;
  content: string;
  timestamp: string;
};

export default function ConversationDetails() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const { conversationId } = useParams();

  useEffect(() => {
    if (!conversationId || typeof conversationId !== 'string') return;

    const fetchMessages = async () => {
      const records = await pb.collection('messages').getFullList<Message>({
        filter: `conversation = "${conversationId}"`,
        sort: '-timestamp',
      });
      setMessages(records);
    };

    fetchMessages();

    // Realtime mesaj dinleme
    const unsubscribe = pb.collection('messages').subscribe<Message>('*', function (e) {
      if (e.record.conversation === conversationId) {
        setMessages((prevMessages) => [e.record, ...prevMessages]);
      }
    });

    return () => {
      unsubscribe.then((unsub) => unsub());
    };
  }, [conversationId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    await pb.collection('messages').create({
      conversation: conversationId,
      sender: pb.authStore.model?.id,
      content: newMessage,
      timestamp: new Date().toISOString(),
    });

    setNewMessage('');
  };

  return (
    <div>
      <h1>Messages</h1>
      <div>
        {messages.map((message) => (
          <div key={message.id}>
            <strong>{message.sender}</strong>: {message.content}
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Write a message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
}
