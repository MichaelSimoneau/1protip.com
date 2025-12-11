import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView, TextInput, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link2, UserPlus, Hash, X, Plus } from 'lucide-react-native';
import { useLinkedInAuth } from '@/features/auth/hooks/useLinkedInAuth';
import { useHashtagPreferences } from '@/features/settings/hooks/useHashtagPreferences';
import { useEffect, useState } from 'react';

export default function SettingsTab() {
  const { login, profile, isLoading, error, getProfile } = useLinkedInAuth();
  const { hashtags, isLoading: hashtagsLoading, addHashtag, removeHashtag } = useHashtagPreferences();
  const [newHashtag, setNewHashtag] = useState('');

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  const handleLinkedInConnect = async () => {
    try {
      await login();
    } catch (err) {
      console.error('LinkedIn connection failed:', err);
    }
  };

  const handleConnectWithMichael = async () => {
    const linkedInUrl = 'https://linkedin.com/in/michaelsimoneau';
    const canOpen = await Linking.canOpenURL(linkedInUrl);
    if (canOpen) {
      await Linking.openURL(linkedInUrl);
    }
  };

  const handleAddHashtag = async () => {
    if (newHashtag.trim()) {
      try {
        await addHashtag(newHashtag.trim());
        setNewHashtag('');
      } catch (err) {
        Alert.alert('Error', 'Failed to add hashtag');
      }
    }
  };

  const handleRemoveHashtag = async (tag: string) => {
    if (tag === '#1protip') {
      return;
    }
    try {
      await removeHashtag(tag);
    } catch (err) {
      Alert.alert('Error', 'Failed to remove hashtag');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Connect & Account</Text>
        <Text style={styles.subtitle}>Manage your LinkedIn connection and preferences</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LinkedIn Account</Text>

          <Pressable
            style={styles.settingCard}
            onPress={handleLinkedInConnect}
            disabled={isLoading}
          >
            <View style={styles.settingIcon}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#0066cc" />
              ) : (
                <Link2 size={24} color="#0066cc" />
              )}
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Your LinkedIn</Text>
              <Text style={styles.settingDescription}>
                {profile ? `Connected as ${profile.firstName}` : 'Not connected'}
              </Text>
            </View>
            {profile ? (
              <Text style={[styles.settingBadge, styles.settingBadgeSuccess]}>
                Connected
              </Text>
            ) : (
              <Text style={styles.settingBadge}>Tap to Connect</Text>
            )}
          </Pressable>

          <Pressable
            style={[styles.settingCard, styles.connectCard]}
            onPress={handleConnectWithMichael}
          >
            <View style={[styles.settingIcon, styles.connectIcon]}>
              <UserPlus size={24} color="#ffffff" />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, styles.connectText]}>Connect with Michael Simoneau</Text>
              <Text style={[styles.settingDescription, styles.connectSubtext]}>
                Follow the creator of #1ProTip
              </Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hashtag Preferences</Text>

          <View style={styles.hashtagCard}>
            <View style={styles.hashtagInputContainer}>
              <Hash size={20} color="#666666" style={styles.hashIcon} />
              <TextInput
                style={styles.hashtagInput}
                placeholder="Add hashtag to follow"
                value={newHashtag}
                onChangeText={setNewHashtag}
                onSubmitEditing={handleAddHashtag}
                autoCapitalize="none"
                returnKeyType="done"
              />
              <Pressable
                style={styles.addButton}
                onPress={handleAddHashtag}
                disabled={!newHashtag.trim() || hashtagsLoading}
              >
                {hashtagsLoading ? (
                  <ActivityIndicator size="small" color="#0066cc" />
                ) : (
                  <Plus size={20} color={newHashtag.trim() ? "#0066cc" : "#cccccc"} />
                )}
              </Pressable>
            </View>

            <View style={styles.hashtagList}>
              {hashtags.map((tag) => (
                <View key={tag} style={styles.hashtagTag}>
                  <Text style={styles.hashtagText}>{tag}</Text>
                  {tag !== '#1protip' && (
                    <Pressable
                      onPress={() => handleRemoveHashtag(tag)}
                      hitSlop={8}
                      disabled={hashtagsLoading}
                    >
                      <X size={16} color="#666666" />
                    </Pressable>
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>

        {!profile && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Get Started:</Text>
            <Text style={styles.infoText}>
              1. Connect your LinkedIn account above
            </Text>
            <Text style={styles.infoText}>
              2. Add hashtags you want to follow
            </Text>
            <Text style={styles.infoText}>
              3. Start sharing and engaging with posts
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  connectCard: {
    backgroundColor: '#0066cc',
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  connectIcon: {
    backgroundColor: '#0052a3',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  connectText: {
    color: '#ffffff',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666666',
  },
  connectSubtext: {
    color: '#e3f2fd',
  },
  settingBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ff6b35',
    backgroundColor: '#fff3f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  settingBadgeSuccess: {
    color: '#00cc88',
    backgroundColor: '#e6fff8',
  },
  hashtagCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  hashtagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  hashIcon: {
    marginRight: 8,
  },
  hashtagInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#1a1a1a',
  },
  addButton: {
    padding: 4,
  },
  hashtagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hashtagTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  hashtagText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066cc',
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 20,
    marginTop: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0066cc',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 24,
    color: '#1a1a1a',
  },
});
