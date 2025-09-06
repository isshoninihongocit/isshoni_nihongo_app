import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  RefreshControl,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../../store';
import { fetchClubInfo } from '../../store/slices/clubSlice';
import { ClubInfo } from '../../types';

const AboutScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { clubInfo, isLoading } = useAppSelector((state) => state.club);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    dispatch(fetchClubInfo());
  }, [dispatch]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    dispatch(fetchClubInfo()).finally(() => setRefreshing(false));
  }, [dispatch]);

  const handleEmailPress = () => {
    if (clubInfo?.contactInfo.email) {
      Linking.openURL(`mailto:${clubInfo.contactInfo.email}`);
    }
  };

  const handlePhonePress = () => {
    if (clubInfo?.contactInfo.phone) {
      Linking.openURL(`tel:${clubInfo.contactInfo.phone}`);
    }
  };

  const handleSocialPress = (platform: string, handle?: string) => {
    if (!handle) return;
    
    let url = '';
    switch (platform) {
      case 'instagram':
        url = `https://instagram.com/${handle.replace('@', '')}`;
        break;
      case 'facebook':
        url = `https://facebook.com/${handle}`;
        break;
      case 'twitter':
        url = `https://twitter.com/${handle.replace('@', '')}`;
        break;
    }
    
    if (url) {
      Linking.openURL(url);
    }
  };

  if (!clubInfo) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>About Club</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading club information...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>About {clubInfo.name}</Text>
        <Text style={styles.subtitle}>Learn more about our community</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="information-circle" size={24} color="#3b82f6" />
          <Text style={styles.sectionTitle}>About Us</Text>
        </View>
        <Text style={styles.sectionContent}>{clubInfo.description}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="flag" size={24} color="#10b981" />
          <Text style={styles.sectionTitle}>Our Mission</Text>
        </View>
        <Text style={styles.sectionContent}>{clubInfo.mission}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar" size={24} color="#f59e0b" />
          <Text style={styles.sectionTitle}>Meeting Schedule</Text>
        </View>
        <Text style={styles.sectionContent}>{clubInfo.meetingSchedule}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="people" size={24} color="#ef4444" />
          <Text style={styles.sectionTitle}>Club Officers</Text>
        </View>
        <View style={styles.officersContainer}>
          <View style={styles.officerItem}>
            <Text style={styles.officerTitle}>President</Text>
            <Text style={styles.officerName}>{clubInfo.officers.president}</Text>
          </View>
          <View style={styles.officerItem}>
            <Text style={styles.officerTitle}>Vice President</Text>
            <Text style={styles.officerName}>{clubInfo.officers.vicePresident}</Text>
          </View>
          <View style={styles.officerItem}>
            <Text style={styles.officerTitle}>Treasurer</Text>
            <Text style={styles.officerName}>{clubInfo.officers.treasurer}</Text>
          </View>
          <View style={styles.officerItem}>
            <Text style={styles.officerTitle}>Secretary</Text>
            <Text style={styles.officerName}>{clubInfo.officers.secretary}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="call" size={24} color="#8b5cf6" />
          <Text style={styles.sectionTitle}>Contact Information</Text>
        </View>
        <View style={styles.contactContainer}>
          <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
            <Ionicons name="mail" size={20} color="#3b82f6" />
            <Text style={styles.contactText}>{clubInfo.contactInfo.email}</Text>
          </TouchableOpacity>
          
          {clubInfo.contactInfo.phone && (
            <TouchableOpacity style={styles.contactItem} onPress={handlePhonePress}>
              <Ionicons name="call" size={20} color="#10b981" />
              <Text style={styles.contactText}>{clubInfo.contactInfo.phone}</Text>
            </TouchableOpacity>
          )}

          {clubInfo.contactInfo.socialMedia && (
            <View style={styles.socialContainer}>
              {clubInfo.contactInfo.socialMedia.instagram && (
                <TouchableOpacity 
                  style={styles.socialItem}
                  onPress={() => handleSocialPress('instagram', clubInfo.contactInfo.socialMedia?.instagram)}
                >
                  <Ionicons name="logo-instagram" size={20} color="#E4405F" />
                  <Text style={styles.socialText}>{clubInfo.contactInfo.socialMedia.instagram}</Text>
                </TouchableOpacity>
              )}
              
              {clubInfo.contactInfo.socialMedia.facebook && (
                <TouchableOpacity 
                  style={styles.socialItem}
                  onPress={() => handleSocialPress('facebook', clubInfo.contactInfo.socialMedia?.facebook)}
                >
                  <Ionicons name="logo-facebook" size={20} color="#1877F2" />
                  <Text style={styles.socialText}>{clubInfo.contactInfo.socialMedia.facebook}</Text>
                </TouchableOpacity>
              )}
              
              {clubInfo.contactInfo.socialMedia.twitter && (
                <TouchableOpacity 
                  style={styles.socialItem}
                  onPress={() => handleSocialPress('twitter', clubInfo.contactInfo.socialMedia?.twitter)}
                >
                  <Ionicons name="logo-twitter" size={20} color="#1DA1F2" />
                  <Text style={styles.socialText}>{clubInfo.contactInfo.socialMedia.twitter}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Last updated: {clubInfo.updatedAt.toLocaleDateString()}
        </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 12,
  },
  sectionContent: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  officersContainer: {
    gap: 12,
  },
  officerItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
  },
  officerTitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  officerName: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
    marginTop: 2,
  },
  contactContainer: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  contactText: {
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
  },
  socialContainer: {
    gap: 8,
  },
  socialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  socialText: {
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#94a3b8',
  },
});

export default AboutScreen;
