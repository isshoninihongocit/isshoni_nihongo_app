import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Resource } from '../../types';
import { USE_LOCAL_SEED } from '../../constants/config';
import { seedResources } from '../../utils/seedData';

export const fetchResources = createAsyncThunk(
  'resources/fetchResources',
  async (_, { rejectWithValue }) => {
    try {
      if (USE_LOCAL_SEED) {
        const now = new Date();
        const mocked = seedResources.map((r, idx) => ({
          id: `res_${idx + 1}`,
          createdAt: now,
          updatedAt: now,
          createdBy: 'seed',
          ...r,
        })) as Resource[];
        return mocked;
      }

      const resourcesSnapshot = await getDocs(collection(db, 'resources'));
      const resources = resourcesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Resource[];
      return resources;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addResource = createAsyncThunk(
  'resources/addResource',
  async (resource: Omit<Resource, 'id'>, { rejectWithValue }) => {
    try {
      const docRef = await addDoc(collection(db, 'resources'), resource);
      return { id: docRef.id, ...resource };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateResource = createAsyncThunk(
  'resources/updateResource',
  async ({ id, updates }: { id: string; updates: Partial<Resource> }, { rejectWithValue }) => {
    try {
      await updateDoc(doc(db, 'resources', id), {
        ...updates,
        updatedAt: new Date(),
      });
      return { id, updates };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteResource = createAsyncThunk(
  'resources/deleteResource',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(db, 'resources', id));
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

interface ResourcesState {
  resources: Resource[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ResourcesState = {
  resources: [],
  isLoading: false,
  error: null,
};

const resourcesSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResources.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resources = action.payload;
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addResource.fulfilled, (state, action) => {
        state.resources.push(action.payload);
      })
      .addCase(updateResource.fulfilled, (state, action) => {
        const index = state.resources.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.resources[index] = { ...state.resources[index], ...action.payload.updates };
        }
      })
      .addCase(deleteResource.fulfilled, (state, action) => {
        state.resources = state.resources.filter(r => r.id !== action.payload);
      });
  },
});

export const { clearError } = resourcesSlice.actions;
export default resourcesSlice.reducer;
