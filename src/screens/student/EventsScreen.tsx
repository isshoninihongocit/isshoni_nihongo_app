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
import { fetchEvents, attendEvent } from '../../store/slices/eventsSlice';
import { Event } from '../../types';

const EventsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { events, isLoading } = useAppSelector((state) => state.events);
  const { user } = useAppSelector((state) => state.auth);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    dispatch(fetchEvents()).finally(() => setRefreshing(false));
  }, [dispatch]);

  const handleAttendEvent = async (eventId: string) => {
    if (!user) return;
    
    try {
      await dispatch(attendEvent({ eventId, userId: user.id })).unwrap();
    } catch (error) {
      console.error('Failed to attend event:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isEventPast = (date: Date) => {
    return new Date(date) < new Date();
  };

  const isUserAttending = (event: Event) => {
    return user ? event.attendees.includes(user.id) : false;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Club Events</Text>
        <Text style={styles.subtitle}>Cultural and language events</Text>
      </View>

      <ScrollView 
        style={styles.eventsContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No events scheduled</Text>
            <Text style={styles.emptySubtext}>Check back later for upcoming events!</Text>
          </View>
        ) : (
          events.map((event) => (
            <View 
              key={event.id} 
              style={[
                styles.eventCard,
                isEventPast(event.date) && styles.pastEventCard
              ]}
            >
              <View style={styles.eventHeader}>
                <View style={styles.eventIconContainer}>
                  <Ionicons 
                    name={isEventPast(event.date) ? "time-outline" : "calendar"} 
                    size={24} 
                    color={isEventPast(event.date) ? "#64748b" : "#3b82f6"} 
                  />
                </View>
                <View style={styles.eventInfo}>
                  <Text style={[
                    styles.eventTitle,
                    isEventPast(event.date) && styles.pastEventTitle
                  ]}>
                    {event.title}
                  </Text>
                  <Text style={styles.eventDate}>
                    {formatDate(event.date)}
                  </Text>
                  <Text style={styles.eventLocation}>
                    📍 {event.location}
                  </Text>
                </View>
              </View>

              <Text style={[
                styles.eventDescription,
                isEventPast(event.date) && styles.pastEventDescription
              ]}>
                {event.description}
              </Text>

              <View style={styles.eventFooter}>
                <View style={styles.attendeesInfo}>
                  <Ionicons name="people" size={16} color="#64748b" />
                  <Text style={styles.attendeesText}>
                    {event.attendees.length}
                    {event.maxAttendees && ` / ${event.maxAttendees}`} attending
                  </Text>
                </View>

                {!isEventPast(event.date) && (
                  <TouchableOpacity
                    style={[
                      styles.attendButton,
                      isUserAttending(event) && styles.attendingButton
                    ]}
                    onPress={() => handleAttendEvent(event.id)}
                  >
                    <Ionicons 
                      name={isUserAttending(event) ? "checkmark" : "add"} 
                      size={16} 
                      color={isUserAttending(event) ? "#ffffff" : "#3b82f6"} 
                    />
                    <Text style={[
                      styles.attendButtonText,
                      isUserAttending(event) && styles.attendingButtonText
                    ]}>
                      {isUserAttending(event) ? 'Attending' : 'Attend'}
                    </Text>
                  </TouchableOpacity>
                )}

                {isEventPast(event.date) && (
                  <View style={styles.pastEventBadge}>
                    <Text style={styles.pastEventBadgeText}>Past Event</Text>
                  </View>
                )}
              </View>
            </View>
          ))
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
  eventsContainer: {
    flex: 1,
    padding: 20,
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
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pastEventCard: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  eventHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  eventIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  pastEventTitle: {
    color: '#64748b',
  },
  eventDate: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 14,
    color: '#64748b',
  },
  eventDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  pastEventDescription: {
    color: '#94a3b8',
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendeesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  attendeesText: {
    fontSize: 14,
    color: '#64748b',
  },
  attendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  attendingButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  attendButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  attendingButtonText: {
    color: '#ffffff',
  },
  pastEventBadge: {
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pastEventBadgeText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
});

export default EventsScreen;
