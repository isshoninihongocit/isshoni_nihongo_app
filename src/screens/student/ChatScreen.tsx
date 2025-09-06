import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../../store';
import { fetchChatMessages, sendMessage, subscribeToChat } from '../../store/slices/chatSlice';
import { ChatMessage } from '../../types';

const ChatScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { messages, isLoading } = useAppSelector((state) => state.chat);
  const { user } = useAppSelector((state) => state.auth);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    dispatch(fetchChatMessages());
    dispatch(subscribeToChat());
  }, [dispatch]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const message: Omit<ChatMessage, 'id'> = {
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      content: newMessage.trim(),
      timestamp: new Date(),
      type: 'text',
    };

    try {
      await dispatch(sendMessage(message)).unwrap();
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Study Chat</Text>
        <Text style={styles.subtitle}>Discuss with fellow students</Text>
      </View>

      <ScrollView 
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start the conversation!</Text>
          </View>
        ) : (
          messages.map((message) => (
            <View 
              key={message.id} 
              style={[
                styles.messageContainer,
                message.senderId === user?.id && styles.ownMessage
              ]}
            >
              {message.senderId !== user?.id && (
                <View style={styles.messageHeader}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                      {message.senderName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.senderName}>{message.senderName}</Text>
                </View>
              )}
              
              <View style={[
                styles.messageBubble,
                message.senderId === user?.id && styles.ownMessageBubble
              ]}>
                <Text style={[
                  styles.messageText,
                  message.senderId === user?.id && styles.ownMessageText
                ]}>
                  {message.content}
                </Text>
                <Text style={[
                  styles.messageTime,
                  message.senderId === user?.id && styles.ownMessageTime
                ]}>
                  {formatTime(message.timestamp)}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <Ionicons name="send" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  messageContainer: {
    marginBottom: 16,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  senderName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  messageBubble: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    maxWidth: '80%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  ownMessageBubble: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  messageText: {
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#ffffff',
  },
  messageTime: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'right',
  },
  ownMessageTime: {
    color: '#dbeafe',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
    color: '#1e293b',
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
});

export default ChatScreen;
