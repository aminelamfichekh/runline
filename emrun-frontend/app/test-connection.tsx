/**
 * Connection Test Screen
 * Use this to verify your mobile app can connect to the backend
 * 
 * To use: Navigate to this screen in your app or add a button to access it
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { testBackendConnection, testAuthenticatedConnection } from '@/lib/api/testConnection';

export default function TestConnectionScreen() {
  const router = useRouter();
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState<string>('');
  const [apiUrl, setApiUrl] = useState<string>('');

  const runTest = async () => {
    setIsTesting(true);
    setResult('Testing connection...\n');
    
    // Get API URL from environment
    const url = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';
    setApiUrl(url);
    
    try {
      // Test 1: Basic connection
      setResult(prev => prev + 'Test 1: Testing basic backend connection...\n');
      const basicTest = await testBackendConnection();
      setResult(prev => prev + `\n${basicTest.message}\n`);
      
      if (basicTest.statusCode) {
        setResult(prev => prev + `Status Code: ${basicTest.statusCode}\n`);
      }
      
      if (basicTest.error) {
        setResult(prev => prev + `Error: ${basicTest.error}\n`);
      }
      
      // Test 2: Authenticated endpoint (will fail if not logged in, but that's OK)
      setResult(prev => prev + '\n---\nTest 2: Testing authenticated endpoint...\n');
      const authTest = await testAuthenticatedConnection();
      setResult(prev => prev + `\n${authTest.message}\n`);
      
      if (authTest.statusCode) {
        setResult(prev => prev + `Status Code: ${authTest.statusCode}\n`);
      }
      
      // Summary
      setResult(prev => prev + '\n---\nSummary:\n');
      if (basicTest.success) {
        setResult(prev => prev + '✅ Backend is reachable!\n');
        setResult(prev => prev + '✅ Your mobile app can connect to the backend\n');
      } else {
        setResult(prev => prev + '❌ Backend is NOT reachable\n');
        setResult(prev => prev + '❌ Check if backend is running and URL is correct\n');
      }
      
      if (authTest.statusCode === 401) {
        setResult(prev => prev + 'ℹ️ Authentication endpoint works (401 = needs login, which is expected)\n');
      }
      
    } catch (error: any) {
      setResult(prev => prev + `\n❌ Test failed: ${error.message}\n`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Connection Test</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Configuration</Text>
          <Text style={styles.configText}>
            API URL: {apiUrl || (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api')}
          </Text>
          <Text style={styles.configText}>
            {!process.env.EXPO_PUBLIC_API_URL && '⚠️ Using default URL (localhost). For physical device, use your computer\'s IP address.'}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.testButton, isTesting && styles.testButtonDisabled]} 
          onPress={runTest}
          disabled={isTesting}
        >
          <Text style={styles.testButtonText}>
            {isTesting ? 'Testing...' : 'Test Connection'}
          </Text>
        </TouchableOpacity>

        {result ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Test Results:</Text>
            <Text style={styles.resultText}>{result}</Text>
          </View>
        ) : (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>How to Test:</Text>
            <Text style={styles.instructionsText}>
              1. Make sure your backend is running{'\n'}
              2. Click "Test Connection" button above{'\n'}
              3. Check the results below{'\n'}
              {'\n'}
              <Text style={styles.boldText}>For physical device:</Text>{'\n'}
              - Backend must be accessible from your network{'\n'}
              - Use your computer's IP address instead of localhost{'\n'}
              - Example: http://192.168.11.213:8000/api{'\n'}
              {'\n'}
              <Text style={styles.boldText}>To set custom URL:</Text>{'\n'}
              - Create .env file in project root{'\n'}
              - Add: EXPO_PUBLIC_API_URL=http://YOUR_IP:8000/api{'\n'}
              - Restart Expo dev server
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  configText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  testButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  testButtonDisabled: {
    opacity: 0.5,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  resultText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  instructionsContainer: {
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
  boldText: {
    fontWeight: '600',
    color: '#fff',
  },
});






