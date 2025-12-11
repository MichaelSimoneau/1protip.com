import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link2, Database, Shield } from 'lucide-react-native';
import { useLinkedInAuth } from '@/features/auth/hooks/useLinkedInAuth';

export default function SettingsTab() {
  const { login, profile, isLoading, error } = useLinkedInAuth();

  const handleLinkedInConnect = async () => {
    try {
      await login();
    } catch (err) {
      console.error('LinkedIn connection failed:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Configure your 1ProTip platform</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Integrations</Text>

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
              <Text style={styles.settingTitle}>LinkedIn Connection</Text>
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

          <Pressable style={styles.settingCard}>
            <View style={styles.settingIcon}>
              <Database size={24} color="#00cc88" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Supabase Database</Text>
              <Text style={styles.settingDescription}>Connected</Text>
            </View>
            <Text style={[styles.settingBadge, styles.settingBadgeSuccess]}>
              Active
            </Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>

          <Pressable style={styles.settingCard}>
            <View style={styles.settingIcon}>
              <Shield size={24} color="#0066cc" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Row Level Security</Text>
              <Text style={styles.settingDescription}>
                All tables protected with optimized RLS policies
              </Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Next Steps:</Text>
          <Text style={styles.infoText}>
            1. Create a LinkedIn Developer App
          </Text>
          <Text style={styles.infoText}>
            2. Configure OAuth redirect URLs
          </Text>
          <Text style={styles.infoText}>
            3. Add credentials to environment variables
          </Text>
        </View>
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
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
  settingDescription: {
    fontSize: 14,
    color: '#666666',
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
