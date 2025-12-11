import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExternalLink } from 'lucide-react-native';
import { useState } from 'react';

export default function HomeTab() {
  const [setupStep, setSetupStep] = useState(0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>#1ProTip</Text>
          <Text style={styles.subtitle}>
            Pro Software Engineering Tips by Michael Simoneau
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome to 1ProTip!</Text>
            <Text style={styles.cardText}>
              This platform will display your LinkedIn #1ProTip posts and allow
              you to manage them all in one place.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Setup Progress</Text>
            <View style={styles.step}>
              <View style={[styles.stepIndicator, styles.stepComplete]}>
                <Text style={styles.stepNumber}>✓</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Database Ready</Text>
                <Text style={styles.stepText}>
                  Supabase database configured with tips and blog tables
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepIndicator}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>LinkedIn App Setup (Next)</Text>
                <Text style={styles.stepText}>
                  Create a LinkedIn Developer App to enable OAuth
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepIndicator}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Feed Integration</Text>
                <Text style={styles.stepText}>
                  Connect LinkedIn to fetch your #1ProTip posts
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Quick Links</Text>
            <Pressable style={styles.link}>
              <ExternalLink size={20} color="#0066cc" />
              <Text style={styles.linkText}>MichaelSimoneau.com</Text>
            </Pressable>
            <Pressable style={styles.link}>
              <ExternalLink size={20} color="#0066cc" />
              <Text style={styles.linkText}>#1ProTip on LinkedIn</Text>
            </Pressable>
          </View>
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
    color: '#0066cc',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666666',
  },
  step: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepComplete: {
    backgroundColor: '#00cc88',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666666',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  linkText: {
    fontSize: 16,
    color: '#0066cc',
    fontWeight: '500',
  },
});
