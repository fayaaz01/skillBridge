import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList } from 'react-native';
import { darkTheme } from '../theme/colors';

type Message = { id: string; author: 'me' | 'them'; text: string };

export const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', author: 'them', text: 'Hi! How can I help?' }
  ]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    const mine: Message = { id: String(Date.now()), author: 'me', text: input.trim() };
    setMessages(prev => [...prev, mine]);
    setInput('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: darkTheme.bg, padding: 16 }}>
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <View style={{
            alignSelf: item.author === 'me' ? 'flex-end' : 'flex-start',
            backgroundColor: item.author === 'me' ? '#1F6FEB' : darkTheme.surface,
            padding: 10,
            borderRadius: 12,
            marginVertical: 6,
            maxWidth: '80%'
          }}>
            <Text style={{ color: item.author === 'me' ? '#fff' : darkTheme.text }}>{item.text}</Text>
          </View>
        )}
      />
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message"
          placeholderTextColor={darkTheme.textFaint}
          style={{ flex: 1, backgroundColor: darkTheme.surface, color: darkTheme.text, padding: 12, borderRadius: 12 }}
        />
        <Pressable onPress={send} style={{ backgroundColor: '#1F6FEB', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
};

