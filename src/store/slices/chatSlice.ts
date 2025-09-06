import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { collection, getDocs, addDoc, orderBy, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { ChatMessage } from '../../types';

export const fetchChatMessages = createAsyncThunk(
  'chat/fetchChatMessages',
  async (_, { rejectWithValue }) => {
    try {
      const messagesSnapshot = await getDocs(
        query(collection(db, 'chatMessages'), orderBy('timestamp', 'desc'))
      );
      const messages = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      })) as ChatMessage[];
      return messages.reverse(); // Reverse to show oldest first
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (message: Omit<ChatMessage, 'id'>, { rejectWithValue }) => {
    try {
      const docRef = await addDoc(collection(db, 'chatMessages'), message);
      return { id: docRef.id, ...message };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const subscribeToChat = createAsyncThunk(
  'chat/subscribeToChat',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const q = query(collection(db, 'chatMessages'), orderBy('timestamp', 'asc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate(),
        })) as ChatMessage[];
        
        dispatch(setMessages(messages));
      });
      
      return unsubscribe;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  isSubscribed: boolean;
}

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
  isSubscribed: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload;
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })
      .addCase(subscribeToChat.fulfilled, (state) => {
        state.isSubscribed = true;
      });
  },
});

export const { clearError, setMessages, addMessage } = chatSlice.actions;
export default chatSlice.reducer;
