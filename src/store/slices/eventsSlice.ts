import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Event } from '../../types';
import { USE_LOCAL_SEED } from '../../constants/config';
import { seedEvents } from '../../utils/seedData';

export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      if (USE_LOCAL_SEED) {
        const now = new Date();
        const mocked = seedEvents.map((e, idx) => ({
          id: `evt_${idx + 1}`,
          attendees: [],
          createdAt: now,
          updatedAt: now,
          createdBy: 'seed',
          ...e,
        })) as Event[];
        return mocked.sort((a, b) => b.date.getTime() - a.date.getTime());
      }

      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const events = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Event[];
      return events.sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date descending
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addEvent = createAsyncThunk(
  'events/addEvent',
  async (event: Omit<Event, 'id'>, { rejectWithValue }) => {
    try {
      const docRef = await addDoc(collection(db, 'events'), event);
      return { id: docRef.id, ...event };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ id, updates }: { id: string; updates: Partial<Event> }, { rejectWithValue }) => {
    try {
      await updateDoc(doc(db, 'events', id), {
        ...updates,
        updatedAt: new Date(),
      });
      return { id, updates };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(db, 'events', id));
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const attendEvent = createAsyncThunk(
  'events/attendEvent',
  async ({ eventId, userId }: { eventId: string; userId: string }, { rejectWithValue }) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const event = eventsSnapshot.docs.find(d => d.id === eventId);
      
      if (event) {
        const currentAttendees = event.data().attendees || [];
        const updatedAttendees = currentAttendees.includes(userId)
          ? currentAttendees.filter((id: string) => id !== userId)
          : [...currentAttendees, userId];
        
        await updateDoc(eventRef, {
          attendees: updatedAttendees,
          updatedAt: new Date(),
        });
        
        return { eventId, attendees: updatedAttendees };
      }
      throw new Error('Event not found');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

interface EventsState {
  events: Event[];
  isLoading: boolean;
  error: string | null;
}

const initialState: EventsState = {
  events: [],
  isLoading: false,
  error: null,
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addEvent.fulfilled, (state, action) => {
        state.events.unshift(action.payload);
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        const index = state.events.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.events[index] = { ...state.events[index], ...action.payload.updates };
        }
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.events = state.events.filter(e => e.id !== action.payload);
      })
      .addCase(attendEvent.fulfilled, (state, action) => {
        const event = state.events.find(e => e.id === action.payload.eventId);
        if (event) {
          event.attendees = action.payload.attendees;
        }
      });
  },
});

export const { clearError } = eventsSlice.actions;
export default eventsSlice.reducer;
