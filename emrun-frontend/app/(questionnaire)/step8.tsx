/**
 * Step 8: Lieux d'Entraînement
 * Training locations checkboxes
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type LocationValue = 'route' | 'chemins' | 'piste' | 'tapis' | 'autre';

interface LocationOption {
  value: LocationValue;
  icon: string;
  title: string;
  subtitle: string;
}

const LOCATIONS: LocationOption[] = [
  { value: 'route', icon: 'road-variant', title: 'Route', subtitle: 'Bitume, ville' },
  { value: 'chemins', icon: 'terrain', title: 'Chemins', subtitle: 'Sentiers, nature' },
  { value: 'piste', icon: 'run', title: 'Piste', subtitle: "Piste d'athlétisme" },
  { value: 'tapis', icon: 'dumbbell', title: 'Tapis', subtitle: 'Tapis de course' },
  { value: 'autre', icon: 'dots-horizontal', title: 'Autre', subtitle: 'Autre lieu' },
];

export default function Step8Screen() {
  const router = useRouter();
  const { form } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const [selectedLocations, setSelectedLocations] = useState<LocationValue[]>(
    (watch('training_locations') as LocationValue[]) || []
  );

  const toggleLocation = (location: LocationValue) => {
    setSelectedLocations(prev => {
      if (prev.includes(location)) {
        return prev.filter(l => l !== location);
      } else {
        return [...prev, location];
      }
    });
  };

  const handleContinue = () => {
    setValue('training_locations', selectedLocations);
    router.push('/(questionnaire)/step9');
  };

  const renderLocationCard = (location: LocationOption) => {
    const isSelected = selectedLocations.includes(location.value);

    return (
      <TouchableOpacity
        key={location.value}
        onPress={() => toggleLocation(location.value)}
        activeOpacity={0.7}
        style={[
          styles.locationCard,
          isSelected && styles.locationCardSelected
        ]}
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={location.icon as any} size={24} color="#328ce7" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.locationTitle}>{location.title}</Text>
          <Text style={styles.locationSubtitle}>{location.subtitle}</Text>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && (
            <MaterialCommunityIcons name="check" size={16} color="#ffffff" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.push('/(questionnaire)/step7')} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.logo}>RUNLINE</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '89%' }]} />
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          {/* Headline */}
          <View style={styles.headlineContainer}>
            <Text style={styles.headline}>
              Vos <Text style={styles.headlineHighlight}>lieux de pratique</Text>
            </Text>
            <Text style={styles.subheadline}>
              Sélectionnez tous les terrains sur lesquels vous avez l'habitude de courir.
            </Text>
          </View>

          {/* Location Options */}
          <View style={styles.locationsContainer}>
            {LOCATIONS.map(renderLocationCard)}
          </View>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continuer</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111921',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(50, 140, 231, 0.08)',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a2632',
  },
  logo: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2.4,
    color: '#93adc8',
    textAlign: 'center',
  },
  progressContainer: {
    gap: 8,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  progressPercent: {
    fontSize: 12,
    color: '#93adc8',
  },
  progressBar: {
    height: 6,
    width: '100%',
    backgroundColor: '#344d65',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#328ce7',
    borderRadius: 9999,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  mainContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  headlineContainer: {
    paddingVertical: 24,
  },
  headline: {
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 40,
    color: '#ffffff',
    marginBottom: 8,
  },
  headlineHighlight: {
    color: '#328ce7',
  },
  subheadline: {
    fontSize: 14,
    lineHeight: 22,
    color: '#93adc8',
  },
  locationsContainer: {
    gap: 12,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#344d65',
    backgroundColor: '#1a2632',
  },
  locationCardSelected: {
    borderColor: '#328ce7',
    backgroundColor: 'rgba(50, 140, 231, 0.05)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#243442',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
  },
  locationSubtitle: {
    fontSize: 12,
    color: '#93adc8',
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#5a7690',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: '#328ce7',
    backgroundColor: '#328ce7',
    shadowColor: '#328ce7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#328ce7',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#328ce7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
