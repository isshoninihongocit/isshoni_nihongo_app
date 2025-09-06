# Isshoni Nihongo - Japanese Learning App

A React Native mobile application for learning Japanese language and culture, designed for students and teachers in a collaborative learning environment.

## Features

### Student Features
- **Dashboard**: Overview of learning progress, assignments, and resources
- **Resources**: Access to learning materials (text, PDFs, videos, links)
- **Assignments**: Submit assignments with file upload or text input
- **Leaderboard**: Track progress and compete with fellow students
- **Chat**: Real-time discussion space for peer learning
- **Events**: View and attend cultural/language events
- **About**: Learn about the Nihongo club

### Admin Features
- **Admin Dashboard**: Overview of all students and activities
- **Assignment Management**: Create, review, and grade student submissions
- **Resource Management**: Add and organize learning materials
- **Event Management**: Create and manage club events
- **Leaderboard Management**: Update student scores and rankings
- **Club Management**: Update club information and details

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Redux Toolkit** for state management
- **Firebase** for backend services:
  - Authentication
  - Firestore Database
  - Storage
- **React Navigation** for navigation
- **React Native Paper** for UI components

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd isshoni_nihongo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Enable Storage
   - Download your Firebase config file
   - Update `src/services/firebase.ts` with your Firebase configuration:
     ```typescript
     const firebaseConfig = {
       apiKey: "your-api-key",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "123456789",
       appId: "your-app-id"
     };
     ```

4. **Run the application**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   - For iOS: `npm run ios`
   - For Android: `npm run android`
   - For web: `npm run web`

## Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
│   ├── auth/          # Authentication screens
│   ├── student/       # Student feature screens
│   └── admin/         # Admin feature screens
├── navigation/         # Navigation configuration
├── store/             # Redux store and slices
│   └── slices/        # Redux slices for different features
├── services/          # External services (Firebase, API)
├── types/             # TypeScript type definitions
├── utils/             # Utility functions and seed data
└── constants/         # App constants
```

## Firebase Collections

The app uses the following Firestore collections:

- `users` - User profiles and authentication data
- `resources` - Learning resources and materials
- `assignments` - Assignment definitions and submissions
- `events` - Club events and attendance
- `chatMessages` - Real-time chat messages
- `club` - Club information and settings

## User Roles

### Student
- Access to learning resources
- Submit assignments
- Participate in discussions
- View leaderboard and events

### Admin/Teacher
- Manage all student activities
- Create and grade assignments
- Add learning resources
- Manage events and club information
- Update leaderboard scores

## Development

### Adding New Features
1. Create new Redux slices in `src/store/slices/`
2. Add new screens in appropriate directories
3. Update navigation configuration
4. Add TypeScript types in `src/types/`

### State Management
The app uses Redux Toolkit for state management with the following slices:
- `authSlice` - Authentication state
- `resourcesSlice` - Learning resources
- `assignmentsSlice` - Assignments and submissions
- `leaderboardSlice` - Student rankings
- `chatSlice` - Real-time chat
- `eventsSlice` - Club events
- `clubSlice` - Club information

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
