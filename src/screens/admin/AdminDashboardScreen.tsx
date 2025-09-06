import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../../store';
import { fetchResources } from '../../store/slices/resourcesSlice';
import { fetchAssignments } from '../../store/slices/assignmentsSlice';
import { fetchLeaderboard } from '../../store/slices/leaderboardSlice';
import { fetchEvents } from '../../store/slices/eventsSlice';
import { signOutUser } from '../../store/slices/authSlice';

const AdminDashboardScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { resources } = useAppSelector((state) => state.resources);
  const { assignments } = useAppSelector((state) => state.assignments);
  const { entries: leaderboard } = useAppSelector((state) => state.leaderboard);
  const { events } = useAppSelector((state) => state.events);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    dispatch(fetchResources());
    dispatch(fetchAssignments());
    dispatch(fetchLeaderboard());
    dispatch(fetchEvents());
  }, [dispatch]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Promise.all([
      dispatch(fetchResources()),
      dispatch(fetchAssignments()),
      dispatch(fetchLeaderboard()),
      dispatch(fetchEvents()),
    ]).finally(() => setRefreshing(false));
  }, [dispatch]);

  const handleSignOut = () => {
    dispatch(signOutUser());
  };

  const pendingSubmissions = assignments.reduce((total, assignment) => {
    return total + assignment.submissions.filter(sub => sub.status === 'submitted').length;
  }, 0);

  const upcomingEvents = events.filter(event => new Date(event.date) > new Date()).length;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back, {user?.name}!</Text>
          <Text style={styles.role}>Admin Dashboard</Text>
        </View>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="library" size={24} color="#3b82f6" />
          <Text style={styles.statNumber}>{resources.length}</Text>
          <Text style={styles.statLabel}>Resources</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="document-text" size={24} color="#10b981" />
          <Text style={styles.statNumber}>{assignments.length}</Text>
          <Text style={styles.statLabel}>Assignments</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="people" size={24} color="#f59e0b" />
          <Text style={styles.statNumber}>{leaderboard.length}</Text>
          <Text style={styles.statLabel}>Students</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={24} color="#ef4444" />
          <Text style={styles.statNumber}>{upcomingEvents}</Text>
          <Text style={styles.statLabel}>Upcoming Events</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="add-circle" size={32} color="#3b82f6" />
            <Text style={styles.actionText}>Add Resource</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="document-text" size={32} color="#10b981" />
            <Text style={styles.actionText}>Create Assignment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="calendar" size={32} color="#f59e0b" />
            <Text style={styles.actionText}>Add Event</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="trophy" size={32} color="#ef4444" />
            <Text style={styles.actionText}>Update Scores</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending Submissions</Text>
        {pendingSubmissions > 0 ? (
          <View style={styles.pendingCard}>
            <Ionicons name="time" size={24} color="#f59e0b" />
            <View style={styles.pendingInfo}>
              <Text style={styles.pendingTitle}>{pendingSubmissions} submissions need grading</Text>
              <Text style={styles.pendingSubtext}>Review and grade student submissions</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#64748b" />
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Text style={styles.emptyText}>All submissions graded!</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {assignments.slice(0, 3).map((assignment) => (
          <View key={assignment.id} style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <Ionicons name="document-text" size={20} color="#3b82f6" />
              <Text style={styles.activityTitle}>{assignment.title}</Text>
              <Text style={styles.activityDate}>
                {assignment.createdAt.toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.activityDescription}>{assignment.description}</Text>
            <View style={styles.activityMeta}>
              <Text style={styles.activitySubmissions}>
                {assignment.submissions.length} submissions
              </Text>
              <Text style={styles.activityPoints}>{assignment.maxPoints} points</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  greeting: {
    fontSize: 18,
    color: '#64748b',
  },
  role: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  signOutButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '47%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '47%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionText: {
    fontSize: 14,
    color: '#1e293b',
    marginTop: 8,
    fontWeight: '500',
  },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  pendingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
  },
  pendingSubtext: {
    fontSize: 14,
    color: '#a16207',
    marginTop: 2,
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065f46',
    marginLeft: 12,
  },
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
    flex: 1,
  },
  activityDate: {
    fontSize: 12,
    color: '#64748b',
  },
  activityDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activitySubmissions: {
    fontSize: 12,
    color: '#3b82f6',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activityPoints: {
    fontSize: 12,
    color: '#10b981',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});

export default AdminDashboardScreen;
