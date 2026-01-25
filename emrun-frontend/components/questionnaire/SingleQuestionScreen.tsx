/**
 * SingleQuestionScreen Component
 * Composant réutilisable pour afficher 1 question par écran
 * Gère la progression, navigation, et validation
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';

interface SingleQuestionScreenProps {
  questionNumber: number;
  totalQuestions: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onNext: () => void;
  onPrevious?: () => void;
  isValid: boolean;
  isOptional?: boolean;
  showProgress?: boolean;
}

export const SingleQuestionScreen: React.FC<SingleQuestionScreenProps> = ({
  questionNumber,
  totalQuestions,
  title,
  subtitle,
  children,
  onNext,
  onPrevious,
  isValid,
  isOptional = false,
  showProgress = true,
}) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onPrevious ? (
          <TouchableOpacity onPress={onPrevious} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}
        
        {showProgress && (
          <ProgressBar current={questionNumber} total={totalQuestions} />
        )}
        
        <TouchableOpacity
          onPress={() => router.push('/')}
          style={styles.closeButton}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.questionHeader}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          {isOptional && (
            <Text style={styles.optionalLabel}>(Optionnel)</Text>
          )}
        </View>

        <View style={styles.questionContent}>{children}</View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title={isOptional && !isValid ? "Passer" : "Continuer"}
          onPress={onNext}
          disabled={!isOptional && !isValid}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  questionHeader: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    lineHeight: 24,
    marginTop: 4,
  },
  optionalLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  questionContent: {
    flex: 1,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
});



