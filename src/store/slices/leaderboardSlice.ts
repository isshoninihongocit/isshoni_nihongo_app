import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { LeaderboardEntry } from '../../types';
import { USE_LOCAL_SEED } from '../../constants/config';
import { seedLeaderboard } from '../../utils/seedData';

export const fetchLeaderboard = createAsyncThunk(
  'leaderboard/fetchLeaderboard',
  async (_, { rejectWithValue }) => {
    try {
      if (USE_LOCAL_SEED) {
        return seedLeaderboard.map((e, idx) => ({ id: `lb_${idx + 1}`, ...e })) as LeaderboardEntry[];
      }

      const usersSnapshot = await getDocs(collection(db, 'users'));
      const students = usersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((user: any) => user.role === 'student')
        .map((student: any, index) => ({
          id: student.id,
          studentId: student.id,
          studentName: student.name,
          avatar: student.avatar,
          points: student.points || 0,
          assignmentsCompleted: student.assignmentsCompleted || 0,
          level: student.level || 'beginner',
          rank: index + 1,
        }))
        .sort((a, b) => b.points - a.points)
        .map((entry, index) => ({ ...entry, rank: index + 1 })) as LeaderboardEntry[];
      
      return students;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateStudentPoints = createAsyncThunk(
  'leaderboard/updateStudentPoints',
  async ({ 
    studentId, 
    points, 
    assignmentsCompleted 
  }: { 
    studentId: string; 
    points: number; 
    assignmentsCompleted: number 
  }, { rejectWithValue }) => {
    try {
      await updateDoc(doc(db, 'users', studentId), {
        points,
        assignmentsCompleted,
        updatedAt: new Date(),
      });
      return { studentId, points, assignmentsCompleted };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

interface LeaderboardState {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
}

const initialState: LeaderboardState = {
  entries: [],
  isLoading: false,
  error: null,
};

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.entries = action.payload;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateStudentPoints.fulfilled, (state, action) => {
        const entry = state.entries.find(e => e.studentId === action.payload.studentId);
        if (entry) {
          entry.points = action.payload.points;
          entry.assignmentsCompleted = action.payload.assignmentsCompleted;
        }
        // Re-sort and update ranks
        state.entries.sort((a, b) => b.points - a.points);
        state.entries.forEach((entry, index) => {
          entry.rank = index + 1;
        });
      });
  },
});

export const { clearError } = leaderboardSlice.actions;
export default leaderboardSlice.reducer;
