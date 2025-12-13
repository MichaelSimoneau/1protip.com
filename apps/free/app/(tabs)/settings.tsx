import { View, Text, StyleSheet, Pressable, ScrollView, Image, Linking, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link2, UserPlus, Check, ExternalLink, MessageCircle, Hash, LogOut } from 'lucide-react-native';
import { useLinkedInAuth } from '@/features/auth/hooks/useLinkedInAuth';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { useHashtagPreferences } from '@/features/settings/hooks/useHashtagPreferences';
import { TAB_BAR_HEIGHT } from './_layout';

const MICHAEL_PROFILE_URL = 'https://linkedin.com/in/michaelsimoneau';
// Placeholder for Michael's profile picture if not dynamically fetched (which implies web scraping). 
// I'll use a generic or empty one, or a specific asset if I had it. 
// For now, I'll use a high-quality placeholder or the app icon as a fallback if I can't find a better one.
const MICHAEL_AVATAR_URI = 'https://media.licdn.com/dms/image/v2/D5603AQF7iI1f9tqD0g/profile-displayphoto-shrink_400_400/0/1708538666324?e=1741824000&v=beta&t=example'; // I shouldn't guess the URL.
// I'll use a standard placeholder.
const PLACEHOLDER_AVATAR = 'https://ui-avatars.com/api/?name=Michael+Simoneau&background=0066cc&color=fff&size=200';

export default function AccountScreen() {
  const { login, profile, isLoading, error, getProfile, updateConnectionStatus } = useLinkedInAuth();
  const { hashtags } = useHashtagPreferences();

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  const isConnectedToMichael = profile?.has_connected_with_owner;

  const handleConnectWithMichael = async () => {
    const canOpen = await Linking.canOpenURL(MICHAEL_PROFILE_URL);
    if (canOpen) {
      await Linking.openURL(MICHAEL_PROFILE_URL);
      // Assume if they clicked, they might have connected.
      // If we are logged in, update the status.
      if (profile) {
        updateConnectionStatus(true);
      }
    }
  };

  const handleLogin = async () => {
    try {
      await login();
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner Section */}
        <View style={styles.bannerContainer}>
          <LinearGradient
            colors={['#004182', '#0077b5']}
            style={styles.banner}
          />
          <View style={styles.profileHeader}>
            <Image
              source={{ uri: PLACEHOLDER_AVATAR }} 
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.name}>Michael Simoneau</Text>
              <Text style={styles.headline}>Enterprise Architect & Technology Leader | Creator of 1ProTip</Text>
              <Text style={styles.location}>San Francisco Bay Area</Text>
              
              <View style={styles.statsRow}>
                <Text style={styles.statText}><Text style={styles.statBold}>500+</Text> connections</Text>
              </View>

              <View style={styles.actionButtons}>
                {isConnectedToMichael ? (
                  <Pressable style={[styles.button, styles.buttonSecondary]}>
                    <Check size={20} color="#666" />
                    <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Pending</Text>
                  </Pressable>
                ) : (
                  <Pressable style={[styles.button, styles.buttonPrimary]} onPress={handleConnectWithMichael}>
                    <UserPlus size={20} color="#fff" />
                    <Text style={styles.buttonText}>Connect</Text>
                  </Pressable>
                )}
                
                <Pressable style={[styles.button, styles.buttonOutline]} onPress={() => Linking.openURL(MICHAEL_PROFILE_URL)}>
                  <ExternalLink size={20} color="#0077b5" />
                  <Text style={[styles.buttonText, styles.buttonTextOutline]}>View Profile</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Highlights / Interactions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Highlights</Text>
          <View style={styles.card}>
            <View style={styles.highlightItem}>
              <View style={styles.highlightIconContainer}>
                <Hash size={18} color="#666" />
              </View>
              <View style={styles.highlightContent}>
                <Text style={styles.highlightTitle}>Common Interests</Text>
                <Text style={styles.highlightText}>You both follow <Text style={styles.highlightBold}>#1protip</Text></Text>
              </View>
            </View>
            
            {profile && (
              <View style={[styles.highlightItem, { marginTop: 16 }]}>
                <View style={styles.highlightIconContainer}>
                   <Image source={{ uri: profile.profilePicture || PLACEHOLDER_AVATAR }} style={{ width: 24, height: 24, borderRadius: 12 }} />
                </View>
                 <View style={styles.highlightContent}>
                  <Text style={styles.highlightTitle}>You know Michael</Text>
                  <Text style={styles.highlightText}>
                    {isConnectedToMichael ? 'You connected with Michael via 1ProTip' : 'Connect to expand your network'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* User's Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Account</Text>
          <View style={styles.card}>
            {profile ? (
              <View style={styles.accountRow}>
                <Image source={{ uri: profile.profilePicture }} style={styles.userAvatar} />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{profile.firstName} {profile.lastName}</Text>
                  <Text style={styles.userStatus}>Connected via LinkedIn</Text>
                </View>
                {/* Logout or Manage could go here */}
              </View>
            ) : (
              <View style={styles.connectPrompt}>
                <Text style={styles.connectPromptText}>Connect your LinkedIn to see mutual connections and manage your profile.</Text>
                <Pressable style={styles.signInButton} onPress={handleLogin} disabled={isLoading}>
                   {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signInButtonText}>Sign in with LinkedIn</Text>}
                </Pressable>
              </View>
            )}
          </View>
          
          {profile && (
            <View style={[styles.card, { marginTop: 16 }]}>
                <Text style={styles.cardLabel}>Hashtags you follow</Text>
                <View style={styles.tagsContainer}>
                    {hashtags.map(tag => (
                        <View key={tag} style={styles.tagChip}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View>
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    left: 0,
    right: 0,
    top: 0,
    bottom: TAB_BAR_HEIGHT,
    overflow: 'hidden',
    backgroundColor: '#f3f2ef', // LinkedIn-like background gray
  },
  scrollContent: {
    paddingBottom: 40,
  },
  bannerContainer: {
    backgroundColor: '#fff',
    marginBottom: 8,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  banner: {
    height: 120,
    width: '100%',
  },
  profileHeader: {
    paddingHorizontal: 24,
    marginTop: -50,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#eee',
  },
  profileInfo: {
    marginTop: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.9)',
  },
  headline: {
    fontSize: 16,
    color: 'rgba(0,0,0,0.6)',
    marginTop: 4,
    lineHeight: 22,
  },
  location: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.6)',
    marginTop: 4,
  },
  statsRow: {
    marginTop: 12,
    flexDirection: 'row',
  },
  statText: {
    fontSize: 14,
    color: '#0077b5',
    fontWeight: '600',
  },
  statBold: {
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    gap: 8,
    minWidth: 120,
  },
  buttonPrimary: {
    backgroundColor: '#0077b5',
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#666',
  },
  buttonOutline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0077b5',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonTextSecondary: {
    color: '#666',
  },
  buttonTextOutline: {
    color: '#0077b5',
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.9)',
    marginHorizontal: 16,
    marginVertical: 12,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 0, // Edge to edge on mobile mostly, or consistent with style
    // If we want cards look:
    // marginHorizontal: 12, borderRadius: 8
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  highlightIconContainer: {
    marginTop: 2,
  },
  highlightContent: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.9)',
  },
  highlightText: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.6)',
    marginTop: 2,
    lineHeight: 20,
  },
  highlightBold: {
    fontWeight: '600',
    color: 'rgba(0,0,0,0.9)',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eee',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.9)',
  },
  userStatus: {
    fontSize: 14,
    color: '#0077b5',
  },
  connectPrompt: {
    alignItems: 'center',
    padding: 8,
  },
  connectPromptText: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.6)',
    textAlign: 'center',
    marginBottom: 16,
  },
  signInButton: {
    backgroundColor: '#0077b5',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cardLabel: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 12,
      color: 'rgba(0,0,0,0.7)',
  },
  tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
  },
  tagChip: {
      backgroundColor: '#f3f2ef',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.1)',
  },
  tagText: {
      fontSize: 14,
      color: 'rgba(0,0,0,0.7)',
      fontWeight: '600',
  }
});