export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'admin';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student extends User {
  role: 'student';
  points: number;
  assignmentsCompleted: number;
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface Admin extends User {
  role: 'admin';
  permissions: string[];
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'text' | 'pdf' | 'video' | 'link';
  url?: string;
  content?: string;
  category: 'grammar' | 'vocabulary' | 'kanji' | 'culture' | 'general';
  level: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  dueDate: Date;
  maxPoints: number;
  type: 'text' | 'file' | 'both';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  submissions: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  submittedAt: Date;
  gradedAt?: Date;
  points?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'late';
}

export interface LeaderboardEntry {
  id: string;
  studentId: string;
  studentName: string;
  avatar?: string;
  points: number;
  assignmentsCompleted: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  rank: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  replyTo?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  imageUrl?: string;
  attendees: string[];
  maxAttendees?: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ClubInfo {
  id: string;
  name: string;
  description: string;
  mission: string;
  meetingSchedule: string;
  contactInfo: {
    email: string;
    phone?: string;
    socialMedia?: {
      instagram?: string;
      facebook?: string;
      twitter?: string;
    };
  };
  officers: {
    president: string;
    vicePresident: string;
    treasurer: string;
    secretary: string;
  };
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AppState {
  auth: AuthState;
  resources: Resource[];
  assignments: Assignment[];
  leaderboard: LeaderboardEntry[];
  chatMessages: ChatMessage[];
  events: Event[];
  clubInfo: ClubInfo | null;
}
