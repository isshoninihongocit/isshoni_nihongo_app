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
import { signOutUser } from '../../store/slices/authSlice';

const HomeScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { resources } = useAppSelector((state) => state.resources);
  const { assignments } = useAppSelector((state) => state.assignments);
  const { entries: leaderboard } = useAppSelector((state) => state.leaderboard);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    dispatch(fetchResources());
    dispatch(fetchAssignments());
    dispatch(fetchLeaderboard());
  }, [dispatch]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Promise.all([
      dispatch(fetchResources()),
      dispatch(fetchAssignments()),
      dispatch(fetchLeaderboard()),
    ]).finally(() => setRefreshing(false));
  }, [dispatch]);

  const handleSignOut = () => {
    dispatch(signOutUser());
  };

  const userRank = leaderboard.find(entry => entry.studentId === user?.id)?.rank || 0;
  const userPoints = leaderboard.find(entry => entry.studentId === user?.id)?.points || 0;
  const pendingAssignments = assignments.filter(assignment => {
    const submission = assignment.submissions.find(sub => sub.studentId === user?.id);
    return !submission;
  });

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>こんにちは!</Text>
          <Text style={styles.name}>{user?.name}</Text>
        </View>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={24} color="#f59e0b" />
          <Text style={styles.statNumber}>#{userRank || 'N/A'}</Text>
          <Text style={styles.statLabel}>Rank</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="star" size={24} color="#3b82f6" />
          <Text style={styles.statNumber}>{userPoints}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="document-text" size={24} color="#10b981" />
          <Text style={styles.statNumber}>{pendingAssignments.length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="library" size={32} color="#3b82f6" />
            <Text style={styles.actionText}>Resources</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="document-text" size={32} color="#10b981" />
            <Text style={styles.actionText}>Assignments</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="chatbubbles" size={32} color="#f59e0b" />
            <Text style={styles.actionText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="calendar" size={32} color="#ef4444" />
            <Text style={styles.actionText}>Events</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Resources</Text>
        {resources.slice(0, 3).map((resource) => (
          <View key={resource.id} style={styles.resourceCard}>
            <View style={styles.resourceHeader}>
              <Ionicons 
                name={
                  resource.type === 'video' ? 'play-circle' :
                  resource.type === 'pdf' ? 'document' :
                  resource.type === 'link' ? 'link' : 'text'
                } 
                size={20} 
                color="#3b82f6" 
              />
              <Text style={styles.resourceTitle}>{resource.title}</Text>
            </View>
            <Text style={styles.resourceDescription}>{resource.description}</Text>
            <View style={styles.resourceMeta}>
              <Text style={styles.resourceCategory}>{resource.category}</Text>
              <Text style={styles.resourceLevel}>{resource.level}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Assignments</Text>
        {pendingAssignments.slice(0, 2).map((assignment) => (
          <View key={assignment.id} style={styles.assignmentCard}>
            <View style={styles.assignmentHeader}>
              <Text style={styles.assignmentTitle}>{assignment.title}</Text>
              <Text style={styles.assignmentDue}>
                Due: {assignment.dueDate.toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.assignmentDescription}>{assignment.description}</Text>
            <View style={styles.assignmentMeta}>
              <Text style={styles.assignmentPoints}>{assignment.maxPoints} points</Text>
              <Text style={styles.assignmentType}>{assignment.type}</Text>
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
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  signOutButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
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
  resourceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
    flex: 1,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  resourceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resourceCategory: {
    fontSize: 12,
    color: '#3b82f6',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  resourceLevel: {
    fontSize: 12,
    color: '#10b981',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  assignmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  assignmentDue: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
  },
  assignmentDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  assignmentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  assignmentPoints: {
    fontSize: 12,
    color: '#f59e0b',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  assignmentType: {
    fontSize: 12,
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});

export default HomeScreen;
