import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../../store';
import { fetchResources } from '../../store/slices/resourcesSlice';
import { Resource } from '../../types';

const ResourcesScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { resources, isLoading } = useAppSelector((state) => state.resources);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  useEffect(() => {
    dispatch(fetchResources());
  }, [dispatch]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    dispatch(fetchResources()).finally(() => setRefreshing(false));
  }, [dispatch]);

  const categories = ['all', 'grammar', 'vocabulary', 'kanji', 'culture', 'general'];
  const levels = ['all', 'beginner', 'intermediate', 'advanced'];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || resource.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return 'play-circle';
      case 'pdf': return 'document';
      case 'link': return 'link';
      default: return 'text';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'grammar': return '#3b82f6';
      case 'vocabulary': return '#10b981';
      case 'kanji': return '#f59e0b';
      case 'culture': return '#ef4444';
      case 'general': return '#8b5cf6';
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
        <Text style={styles.title}>Learning Resources</Text>
        <Text style={styles.subtitle}>Explore Japanese language materials</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search resources..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <TouchableOpacity
          style={[styles.filterChip, selectedCategory === 'all' && styles.filterChipActive]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text style={[styles.filterText, selectedCategory === 'all' && styles.filterTextActive]}>
            All Categories
          </Text>
        </TouchableOpacity>
        {categories.slice(1).map((category) => (
          <TouchableOpacity
            key={category}
            style={[styles.filterChip, selectedCategory === category && styles.filterChipActive]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[styles.filterText, selectedCategory === category && styles.filterTextActive]}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.levelFiltersContainer}
        contentContainerStyle={styles.levelFiltersContent}
      >
        {levels.map((level) => (
          <TouchableOpacity
            key={level}
            style={[styles.levelChip, selectedLevel === level && styles.levelChipActive]}
            onPress={() => setSelectedLevel(level)}
          >
            <Text style={[styles.levelText, selectedLevel === level && styles.levelTextActive]}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView 
        style={styles.resourcesContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredResources.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="library-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No resources found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
          </View>
        ) : (
          filteredResources.map((resource) => (
            <View key={resource.id} style={styles.resourceCard}>
              <View style={styles.resourceHeader}>
                <View style={styles.resourceIconContainer}>
                  <Ionicons 
                    name={getResourceIcon(resource.type)} 
                    size={24} 
                    color="#3b82f6" 
                  />
                </View>
                <View style={styles.resourceInfo}>
                  <Text style={styles.resourceTitle}>{resource.title}</Text>
                  <Text style={styles.resourceDescription}>{resource.description}</Text>
                </View>
              </View>
              
              <View style={styles.resourceMeta}>
                <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(resource.category) + '20' }]}>
                  <Text style={[styles.categoryText, { color: getCategoryColor(resource.category) }]}>
                    {resource.category}
                  </Text>
                </View>
                <View style={[styles.levelTag, { backgroundColor: getLevelColor(resource.level) + '20' }]}>
                  <Text style={[styles.levelTagText, { color: getLevelColor(resource.level) }]}>
                    {resource.level}
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.accessButton}>
                <Text style={styles.accessButtonText}>
                  {resource.type === 'link' ? 'Open Link' : 
                   resource.type === 'video' ? 'Watch Video' :
                   resource.type === 'pdf' ? 'View PDF' : 'Read Content'}
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#3b82f6" />
              </TouchableOpacity>
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
  searchContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filtersContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filterChip: {
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#3b82f6',
  },
  filterText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  levelFiltersContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  levelFiltersContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  levelChip: {
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  levelChipActive: {
    backgroundColor: '#10b981',
  },
  levelText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  levelTextActive: {
    color: '#ffffff',
  },
  resourcesContainer: {
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
  },
  resourceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resourceHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  resourceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  resourceMeta: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  levelTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  levelTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  accessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  accessButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
});

export default ResourcesScreen;
