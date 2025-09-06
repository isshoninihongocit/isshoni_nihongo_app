import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { ClubInfo } from '../../types';

export const fetchClubInfo = createAsyncThunk(
  'club/fetchClubInfo',
  async (_, { rejectWithValue }) => {
    try {
      const clubDoc = await getDoc(doc(db, 'club', 'info'));
      if (clubDoc.exists()) {
        return {
          id: clubDoc.id,
          ...clubDoc.data(),
          updatedAt: clubDoc.data().updatedAt?.toDate(),
        } as ClubInfo;
      } else {
        // Create default club info if it doesn't exist
        const defaultClubInfo: ClubInfo = {
          id: 'info',
          name: 'Isshoni Nihongo Club',
          description: 'A community dedicated to learning Japanese language and culture together.',
          mission: 'To create an inclusive environment where students can learn Japanese language and culture through collaborative learning, cultural events, and peer support.',
          meetingSchedule: 'Every Friday 3:00 PM - 4:30 PM in Room 201',
          contactInfo: {
            email: 'isshoni.nihongo@university.edu',
            phone: '+1 (555) 123-4567',
            socialMedia: {
              instagram: '@isshoni_nihongo',
              facebook: 'Isshoni Nihongo Club',
            },
          },
          officers: {
            president: 'Yuki Tanaka',
            vicePresident: 'Hiroshi Sato',
            treasurer: 'Aiko Nakamura',
            secretary: 'Kenji Yamamoto',
          },
          updatedAt: new Date(),
        };
        
        await setDoc(doc(db, 'club', 'info'), defaultClubInfo);
        return defaultClubInfo;
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateClubInfo = createAsyncThunk(
  'club/updateClubInfo',
  async (updates: Partial<ClubInfo>, { rejectWithValue }) => {
    try {
      await setDoc(doc(db, 'club', 'info'), {
        ...updates,
        updatedAt: new Date(),
      }, { merge: true });
      return updates;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

interface ClubState {
  clubInfo: ClubInfo | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ClubState = {
  clubInfo: null,
  isLoading: false,
  error: null,
};

const clubSlice = createSlice({
  name: 'club',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClubInfo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClubInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clubInfo = action.payload;
      })
      .addCase(fetchClubInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateClubInfo.fulfilled, (state, action) => {
        if (state.clubInfo) {
          state.clubInfo = { ...state.clubInfo, ...action.payload };
        }
      });
  },
});

export const { clearError } = clubSlice.actions;
export default clubSlice.reducer;
