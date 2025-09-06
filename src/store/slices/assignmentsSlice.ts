import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Assignment, AssignmentSubmission } from '../../types';
import { USE_LOCAL_SEED } from '../../constants/config';
import { seedAssignments } from '../../utils/seedData';

export const fetchAssignments = createAsyncThunk(
  'assignments/fetchAssignments',
  async (_, { rejectWithValue }) => {
    try {
      if (USE_LOCAL_SEED) {
        const now = new Date();
        const mocked = seedAssignments.map((a, idx) => ({
          id: `asg_${idx + 1}`,
          createdAt: now,
          updatedAt: now,
          createdBy: 'seed',
          submissions: [],
          ...a,
        })) as Assignment[];
        return mocked;
      }

      const assignmentsSnapshot = await getDocs(collection(db, 'assignments'));
      const assignments = assignmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        submissions: doc.data().submissions?.map((sub: any) => ({
          ...sub,
          submittedAt: sub.submittedAt?.toDate(),
          gradedAt: sub.gradedAt?.toDate(),
        })) || [],
      })) as Assignment[];
      return assignments;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addAssignment = createAsyncThunk(
  'assignments/addAssignment',
  async (assignment: Omit<Assignment, 'id'>, { rejectWithValue }) => {
    try {
      const docRef = await addDoc(collection(db, 'assignments'), assignment);
      return { id: docRef.id, ...assignment };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateAssignment = createAsyncThunk(
  'assignments/updateAssignment',
  async ({ id, updates }: { id: string; updates: Partial<Assignment> }, { rejectWithValue }) => {
    try {
      await updateDoc(doc(db, 'assignments', id), {
        ...updates,
        updatedAt: new Date(),
      });
      return { id, updates };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const submitAssignment = createAsyncThunk(
  'assignments/submitAssignment',
  async ({ 
    assignmentId, 
    submission 
  }: { 
    assignmentId: string; 
    submission: Omit<AssignmentSubmission, 'id'> 
  }, { rejectWithValue }) => {
    try {
      const assignmentRef = doc(db, 'assignments', assignmentId);
      const assignmentDoc = await getDocs(collection(db, 'assignments'));
      const assignment = assignmentDoc.docs.find(d => d.id === assignmentId);
      
      if (assignment) {
        const currentSubmissions = assignment.data().submissions || [];
        const newSubmissions = [...currentSubmissions, submission];
        
        await updateDoc(assignmentRef, {
          submissions: newSubmissions,
          updatedAt: new Date(),
        });
        
        return { assignmentId, submission };
      }
      throw new Error('Assignment not found');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const gradeAssignment = createAsyncThunk(
  'assignments/gradeAssignment',
  async ({ 
    assignmentId, 
    submissionId, 
    points, 
    feedback 
  }: { 
    assignmentId: string; 
    submissionId: string; 
    points: number; 
    feedback?: string 
  }, { rejectWithValue }) => {
    try {
      const assignmentRef = doc(db, 'assignments', assignmentId);
      const assignmentDoc = await getDocs(collection(db, 'assignments'));
      const assignment = assignmentDoc.docs.find(d => d.id === assignmentId);
      
      if (assignment) {
        const submissions = assignment.data().submissions || [];
        const updatedSubmissions = submissions.map((sub: any) => 
          sub.id === submissionId 
            ? { ...sub, points, feedback, gradedAt: new Date(), status: 'graded' }
            : sub
        );
        
        await updateDoc(assignmentRef, {
          submissions: updatedSubmissions,
          updatedAt: new Date(),
        });
        
        return { assignmentId, submissionId, points, feedback };
      }
      throw new Error('Assignment not found');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

interface AssignmentsState {
  assignments: Assignment[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AssignmentsState = {
  assignments: [],
  isLoading: false,
  error: null,
};

const assignmentsSlice = createSlice({
  name: 'assignments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assignments = action.payload;
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addAssignment.fulfilled, (state, action) => {
        state.assignments.push(action.payload);
      })
      .addCase(updateAssignment.fulfilled, (state, action) => {
        const index = state.assignments.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.assignments[index] = { ...state.assignments[index], ...action.payload.updates };
        }
      })
      .addCase(submitAssignment.fulfilled, (state, action) => {
        const assignment = state.assignments.find(a => a.id === action.payload.assignmentId);
        if (assignment) {
          assignment.submissions.push({
            ...action.payload.submission,
            id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          });
        }
      })
      .addCase(gradeAssignment.fulfilled, (state, action) => {
        const assignment = state.assignments.find(a => a.id === action.payload.assignmentId);
        if (assignment) {
          const submission = assignment.submissions.find(s => s.id === action.payload.submissionId);
          if (submission) {
            submission.points = action.payload.points;
            submission.feedback = action.payload.feedback;
            submission.gradedAt = new Date();
            submission.status = 'graded';
          }
        }
      });
  },
});

export const { clearError } = assignmentsSlice.actions;
export default assignmentsSlice.reducer;
