import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../../store';
import { fetchLeaderboard } from '../../store/slices/leaderboardSlice';
import { LeaderboardEntry } from '../../types';

const LeaderboardScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { entries: leaderboard, isLoading } = useAppSelector((state) => state.leaderboard);
  const { user } = useAppSelector((state) => state.auth);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    dispatch(fetchLeaderboard());
  }, [dispatch]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    dispatch(fetchLeaderboard()).finally(() => setRefreshing(false));
  }, [dispatch]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return 'trophy';
      case 2: return 'medal';
      case 3: return 'medal';
      default: return 'person';
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#f59e0b';
      case 2: return '#6b7280';
      case 3: return '#cd7c2f';
      default: return '#64748b';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>Top performing students</Text>
      </View>

      <ScrollView 
        style={styles.leaderboardContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {leaderboard.map((entry, index) => (
          <View 
            key={entry.id} 
            style={[
              styles.leaderboardItem,
              entry.studentId === user?.id && styles.currentUserItem
            ]}
          >
            <View style={styles.rankContainer}>
              <Ionicons 
                name={getRankIcon(entry.rank)} 
                size={24} 
                color={getRankColor(entry.rank)} 
              />
              <Text style={[styles.rankText, { color: getRankColor(entry.rank) }]}>
                #{entry.rank}
              </Text>
            </View>

            <View style={styles.userInfo}>
              <Text style={[
                styles.userName,
                entry.studentId === user?.id && styles.currentUserName
              ]}>
                {entry.studentName}
                {entry.studentId === user?.id && ' (You)'}
              </Text>
              <View style={styles.userMeta}>
                <View style={[styles.levelTag, { backgroundColor: getLevelColor(entry.level) + '20' }]}>
                  <Text style={[styles.levelText, { color: getLevelColor(entry.level) }]}>
                    {entry.level}
                  </Text>
                </View>
                <Text style={styles.assignmentsText}>
                  {entry.assignmentsCompleted} assignments
                </Text>
              </View>
            </View>

            <View style={styles.pointsContainer}>
              <Text style={styles.pointsText}>{entry.points}</Text>
              <Text style={styles.pointsLabel}>points</Text>
            </View>
          </View>
        ))}

        {leaderboard.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No leaderboard data yet</Text>
            <Text style={styles.emptySubtext}>Complete assignments to earn points!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  leaderboardContainer: {
    flex: 1,
    padding: 20,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  currentUserItem: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  rankContainer: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 60,
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  currentUserName: {
    color: '#1e40af',
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '500',
  },
  assignmentsText: {
    fontSize: 12,
    color: '#64748b',
  },
  pointsContainer: {
    alignItems: 'center',
    minWidth: 80,
  },
  pointsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default LeaderboardScreen;
