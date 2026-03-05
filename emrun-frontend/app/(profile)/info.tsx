/**
 * Profile Info Screen
 * Shows ALL questionnaire responses
 * Read-only for: personal info, running experience, problem to solve
 * Editable for: primary goal, available days, training locations, injuries, constraints
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  TextInput,
  Platform,
  LayoutAnimation,
  UIManager,
  Modal,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { WheelPicker } from '@/components/ui/WheelPicker';
import { profileApi } from '@/lib/api/profile';
import type { UserProfileFormData, UserProfileResponse } from '@/types/profile';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { colors } from '@/constants/colors';
import { useNotification } from '@/contexts/NotificationContext';
import * as Haptics from 'expo-haptics';
import { BottomNav } from '@/components/ui/BottomNav';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Labels for questionnaire fields
const LABELS = {
  gender: {
    male: 'Homme',
    female: 'Femme',
    other: 'Autre',
  } as Record<string, string>,
  primary_goal: {
    me_lancer: 'Commencer la course',
    reprendre: 'Reprendre la course',
    entretenir: 'Entretenir ma forme',
    ameliorer_condition: 'Améliorer ma condition',
    courir_race: 'Préparer une course',
    ameliorer_chrono: 'Améliorer mon chrono',
    autre: 'Autre',
  } as Record<string, string>,
  running_experience_period: {
    je_commence: 'Je commence',
    je_reprends: 'Je reprends',
    '1_4_semaines': '1-4 semaines',
    '1_11_mois': '1-11 mois',
    '1_10_ans': '1-10 ans',
    plus_10_ans: 'Plus de 10 ans',
  } as Record<string, string>,
  current_runs_per_week: {
    '0': '0 fois par semaine',
    '1_2': '1-2 fois par semaine',
    '3_4': '3-4 fois par semaine',
    '5_6': '5-6 fois par semaine',
    '7_plus': '7+ fois par semaine',
  } as Record<string, string>,
  available_days: {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche',
  } as Record<string, string>,
  training_locations: {
    route: 'Route',
    chemins: 'Chemins',
    piste: 'Piste',
    tapis: 'Tapis',
    autre: 'Autre',
  } as Record<string, string>,
  race_distance: {
    '5km': '5 km',
    '10km': '10 km',
    '15km': '15 km',
    '20km': '20 km',
    '25km': '25 km',
    semi_marathon: 'Semi-marathon',
    marathon: 'Marathon',
    autre: 'Autre distance',
  } as Record<string, string>,
};

type GoalOption = 'start' | 'restart' | 'race' | 'other';
type DayValue = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
type LocationValue = 'route' | 'chemins' | 'piste' | 'tapis' | 'autre';

const DAYS: { value: DayValue; label: string }[] = [
  { value: 'monday', label: 'Lundi' },
  { value: 'tuesday', label: 'Mardi' },
  { value: 'wednesday', label: 'Mercredi' },
  { value: 'thursday', label: 'Jeudi' },
  { value: 'friday', label: 'Vendredi' },
  { value: 'saturday', label: 'Samedi' },
  { value: 'sunday', label: 'Dimanche' },
];

const DAY_ORDER = DAYS.map(d => d.value);
const sortDays = (days: DayValue[]): DayValue[] =>
  [...days].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));

const LOCATIONS: { value: LocationValue; icon: string; title: string }[] = [
  { value: 'route', icon: 'road-variant', title: 'Route' },
  { value: 'chemins', icon: 'terrain', title: 'Chemins' },
  { value: 'piste', icon: 'run', title: 'Piste' },
  { value: 'tapis', icon: 'dumbbell', title: 'Tapis' },
  { value: 'autre', icon: 'map-marker-plus', title: 'Autre' },
];

const GOAL_OPTIONS: { value: GoalOption; icon: string; title: string }[] = [
  { value: 'start', icon: 'run-fast', title: 'Commencer la course' },
  { value: 'restart', icon: 'reload', title: 'Reprendre la course' },
  { value: 'race', icon: 'trophy', title: 'Préparer une course' },
  { value: 'other', icon: 'note-edit', title: 'Autre' },
];

const RACE_DISTANCES = [
  { value: '5km', label: '5 km' },
  { value: '10km', label: '10 km' },
  { value: '15km', label: '15 km' },
  { value: '20km', label: '20 km' },
  { value: '25km', label: '25 km' },
  { value: 'semi_marathon', label: 'Semi-marathon' },
  { value: 'marathon', label: 'Marathon' },
  { value: 'autre', label: 'Autre distance' },
];

export default function ProfileInfoScreen() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Editable state
  const [selectedGoal, setSelectedGoal] = useState<GoalOption | null>(null);
  const [otherGoalText, setOtherGoalText] = useState('');
  const [raceDistance, setRaceDistance] = useState<string | null>(null);
  const [raceDistanceOther, setRaceDistanceOther] = useState('');
  const [targetRaceDate, setTargetRaceDate] = useState('');
  const [goalTimeHours, setGoalTimeHours] = useState(0);
  const [goalTimeMinutes, setGoalTimeMinutes] = useState(30);
  const [goalTimeSeconds, setGoalTimeSeconds] = useState(0);
  const [intermediateObjectives, setIntermediateObjectives] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDays, setSelectedDays] = useState<DayValue[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<LocationValue[]>([]);
  const [otherLocationText, setOtherLocationText] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [injuries, setInjuries] = useState('');
  const [constraints, setConstraints] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [])
  );

  const mapApiGoalToOption = (apiGoal: string | undefined): GoalOption | null => {
    switch (apiGoal) {
      case 'me_lancer':
      case 'entretenir':
      case 'ameliorer_condition':
        return 'start';
      case 'reprendre':
        return 'restart';
      case 'courir_race':
      case 'ameliorer_chrono':
        return 'race';
      case 'autre':
        return 'other';
      default:
        return null;
    }
  };

  const mapOptionToApiGoal = (option: GoalOption): string => {
    switch (option) {
      case 'start':
        return 'me_lancer';
      case 'restart':
        return 'reprendre';
      case 'race':
        return 'courir_race';
      case 'other':
        return 'autre';
    }
  };

  const loadProfile = async () => {
    console.log('🔄 loadProfile() called');
    try {
      setIsLoading(true);
      console.log('📡 Calling profileApi.getProfile()...');
      const response = await profileApi.getProfile();
      console.log('📊 Profile API Response:', JSON.stringify(response, null, 2));
      console.log('📊 Response type:', typeof response);
      console.log('📊 Response keys:', response ? Object.keys(response) : 'null');
      setProfile(response);

      // Initialize editable state from profile
      const p = response?.profile;
      console.log('👤 Profile data:', p ? 'EXISTS' : 'NULL');
      console.log('👤 first_name:', p?.first_name);
      console.log('👤 height_cm:', p?.height_cm);
      console.log('👤 primary_goal:', p?.primary_goal);
      if (p) {
        setSelectedGoal(mapApiGoalToOption(p.primary_goal));
        setOtherGoalText(p.primary_goal_other || '');
        setRaceDistance(p.race_distance || null);
        setRaceDistanceOther(p.race_distance_other || '');
        setTargetRaceDate(p.target_race_date || '');
        // Parse goal_time "H:MM:SS" format
        if (p.goal_time) {
          const parts = p.goal_time.split(':');
          if (parts.length === 3) {
            setGoalTimeHours(parseInt(parts[0], 10) || 0);
            setGoalTimeMinutes(parseInt(parts[1], 10) || 0);
            setGoalTimeSeconds(parseInt(parts[2], 10) || 0);
          }
        }
        setIntermediateObjectives(p.intermediate_objectives || '');
        // Height: stored as cm in DB, display as meters (e.g. 175 -> "1.75")
        if (p.height_cm) {
          const h = p.height_cm < 10 ? p.height_cm : p.height_cm / 100;
          setHeightCm(h.toFixed(2));
        }
        if (p.weight_kg) {
          setWeightKg(String(p.weight_kg));
        }
        setSelectedDays(sortDays((p.available_days as DayValue[]) || []));
        setSelectedLocations((p.training_locations as LocationValue[]) || []);
        setOtherLocationText(p.training_location_other || '');
        setInjuries(p.injuries ? p.injuries.join('\n') : '');
        setConstraints(p.personal_constraints || '');
      }
      setHasChanges(false);
    } catch (error: any) {
      console.error('❌ Failed to load profile:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      showNotification('Erreur lors du chargement du profil', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!hasChanges || !selectedGoal) return;

    setIsSaving(true);
    try {
      const updateData: Partial<UserProfileFormData> = {
        primary_goal: mapOptionToApiGoal(selectedGoal) as any,
        available_days: selectedDays,
        training_locations: selectedLocations,
      };

      // Conditional fields based on goal
      if (selectedGoal === 'other') {
        updateData.primary_goal_other = otherGoalText.trim() || undefined;
      }

      if (selectedGoal === 'race') {
        updateData.race_distance = raceDistance as any;
        if (raceDistance === 'autre') {
          updateData.race_distance_other = raceDistanceOther.trim() || undefined;
        }
        updateData.goal_time = `${goalTimeHours}:${String(goalTimeMinutes).padStart(2, '0')}:${String(goalTimeSeconds).padStart(2, '0')}`;
        updateData.target_race_date = targetRaceDate || undefined;
        updateData.intermediate_objectives = intermediateObjectives.trim() || undefined;
      }

      // Other location
      if (selectedLocations.includes('autre')) {
        updateData.training_location_other = otherLocationText.trim() || undefined;
      }

      // Injuries
      const injuryLines = injuries
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      updateData.injuries = injuryLines.length > 0 ? injuryLines : undefined;

      // Height & Weight
      const parsedHeight = parseFloat(heightCm);
      if (!isNaN(parsedHeight) && parsedHeight > 0) {
        updateData.height_cm = parsedHeight;
      }
      const parsedWeight = parseInt(weightKg, 10);
      if (!isNaN(parsedWeight) && parsedWeight > 0) {
        updateData.weight_kg = parsedWeight;
      }

      // Constraints
      updateData.personal_constraints = constraints.trim() || undefined;

      console.log('💾 Saving profile with data:', JSON.stringify(updateData, null, 2));
      const result = await profileApi.updateProfile(updateData);
      console.log('✅ Profile saved successfully:', JSON.stringify(result, null, 2));
      showNotification('Profil mis à jour avec succès', 'success');
      setHasChanges(false);

      // Reload to get fresh data
      await loadProfile();
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      const message = error.response?.data?.message || 'Erreur lors de la mise à jour';
      showNotification(message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const markChanged = () => {
    if (!hasChanges) setHasChanges(true);
  };

  const handleGoalSelect = (goal: GoalOption) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedGoal(goal);
    markChanged();
  };

  const toggleDay = (day: DayValue) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      }
      return sortDays([...prev, day]);
    });
    markChanged();
  };

  const toggleLocation = (location: LocationValue) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedLocations((prev) => {
      if (prev.includes(location)) {
        return prev.filter((l) => l !== location);
      }
      return [...prev, location];
    });
    markChanged();
  };

  const getLabel = (category: keyof typeof LABELS, value: string | null | undefined): string => {
    if (!value) return 'Non défini';
    const labels = LABELS[category];
    return labels[value] || value.replace(/_/g, ' ');
  };

  const formatDate = (date: string | null | undefined): string => {
    if (!date) return 'Non défini';
    try {
      return format(new Date(date), 'd MMMM yyyy', { locale: fr });
    } catch {
      return date;
    }
  };

  const formatDays = (days: string[] | null | undefined): string => {
    if (!days || days.length === 0) return 'Non défini';
    const sorted = [...days].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
    return sorted.map((day) => LABELS.available_days[day] || day).join(', ');
  };

  const formatLocations = (locations: string[] | null | undefined): string => {
    if (!locations || locations.length === 0) return 'Non défini';
    return locations.map((loc) => LABELS.training_locations[loc] || loc).join(', ');
  };

  const calculateAge = (birthDate: string | null | undefined): string => {
    if (!birthDate) return 'Non défini';
    try {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return `${age} ans`;
    } catch {
      return 'Non défini';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={colors.accent.blue} />
      </View>
    );
  }

  const profileData = profile?.profile;
  const isRaceGoal = selectedGoal === 'race';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vos informations</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Intro */}
        <View style={styles.introSection}>
          <Text style={styles.introSubtitle}>
            Consultez vos réponses au questionnaire. Ces informations peuvent être modifiées à tout moment.
          </Text>
        </View>

        {/* ============================================ */}
        {/* READ-ONLY SECTIONS */}
        {/* ============================================ */}

        {/* READ-ONLY: Personal Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color={colors.text.tertiary} />
            <Text style={styles.sectionTitleDisabled}>Informations personnelles</Text>
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={12} color={colors.text.tertiary} />
            </View>
          </View>
          <View style={styles.cardDisabled}>
            <InfoRowDisabled label="Nom" value={[profileData?.first_name, profileData?.last_name].filter(Boolean).join(' ') || 'Non défini'} />
            <InfoRowDisabled label="Date de naissance" value={formatDate(profileData?.birth_date)} />
            <InfoRowDisabled label="Âge" value={calculateAge(profileData?.birth_date)} />
            <InfoRowDisabled label="Sexe" value={getLabel('gender', profileData?.gender)} isLast />
          </View>
          <View style={styles.editableRow}>
            <View style={styles.editableFieldHalf}>
              <Text style={styles.editableFieldLabel}>Taille (m)</Text>
              <TextInput
                style={styles.compactInput}
                value={heightCm}
                onChangeText={(text) => { setHeightCm(text); markChanged(); }}
                placeholder="1.75"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="decimal-pad"
                selectionColor={colors.accent.blue}
                cursorColor={colors.accent.blue}
              />
            </View>
            <View style={styles.editableFieldHalf}>
              <Text style={styles.editableFieldLabel}>Poids (kg)</Text>
              <TextInput
                style={styles.compactInput}
                value={weightKg}
                onChangeText={(text) => { setWeightKg(text); markChanged(); }}
                placeholder="70"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="number-pad"
                selectionColor={colors.accent.blue}
                cursorColor={colors.accent.blue}
              />
            </View>
          </View>
        </View>

        {/* READ-ONLY: Running Experience */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trophy" size={20} color={colors.text.tertiary} />
            <Text style={styles.sectionTitleDisabled}>Expérience en course</Text>
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={12} color={colors.text.tertiary} />
            </View>
          </View>
          <View style={styles.cardDisabled}>
            <InfoRowDisabled
              label="Expérience"
              value={getLabel('running_experience_period', profileData?.running_experience_period)}
            />
            <InfoRowDisabled
              label="Fréquence actuelle"
              value={getLabel('current_runs_per_week', profileData?.current_runs_per_week)}
            />
            <InfoRowDisabled
              label="Volume hebdomadaire"
              value={profileData?.current_weekly_volume_km !== undefined && profileData?.current_weekly_volume_km !== null
                ? `${profileData.current_weekly_volume_km} km`
                : 'Non défini'}
              isLast
            />
          </View>
        </View>

        {/* READ-ONLY: Records Persos */}
        {profileData?.records && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="medal" size={20} color={colors.text.tertiary} />
              <Text style={styles.sectionTitleDisabled}>Records persos</Text>
              <View style={styles.lockBadge}>
                <Ionicons name="lock-closed" size={12} color={colors.text.tertiary} />
              </View>
            </View>
            <View style={styles.cardDisabled}>
              <InfoRowDisabled
                label="Meilleurs temps"
                value={profileData.records}
                isLast
              />
            </View>
          </View>
        )}

        {/* ============================================ */}
        {/* EDITABLE SECTIONS */}
        {/* ============================================ */}

        {/* EDITABLE: Primary Goal */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flag" size={20} color={colors.accent.blue} />
            <Text style={styles.sectionTitle}>Objectif principal</Text>
            <View style={styles.editBadge}>
              <Ionicons name="create" size={12} color={colors.accent.blue} />
            </View>
          </View>
          <View style={styles.optionsContainer}>
            {GOAL_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => handleGoalSelect(option.value)}
                activeOpacity={0.8}
                style={[
                  styles.optionCard,
                  selectedGoal === option.value && styles.optionCardSelected,
                ]}
              >
                <View style={[styles.radioCircle, selectedGoal === option.value && styles.radioCircleSelected]}>
                  {selectedGoal === option.value && <View style={styles.radioCircleInner} />}
                </View>
                <Text style={[styles.optionTitle, selectedGoal === option.value && styles.optionTitleSelected]}>
                  {option.title}
                </Text>
                <MaterialCommunityIcons
                  name={option.icon as any}
                  size={20}
                  color={selectedGoal === option.value ? colors.accent.blue : 'rgba(255, 255, 255, 0.2)'}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Other goal text input */}
          {selectedGoal === 'other' && (
            <View style={styles.conditionalInput}>
              <Text style={styles.inputLabel}>Précisez votre objectif</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ex: Courir pour le plaisir..."
                placeholderTextColor={colors.text.tertiary}
                value={otherGoalText}
                onChangeText={(text) => {
                  setOtherGoalText(text);
                  markChanged();
                }}
                selectionColor={colors.accent.blue}
              />
            </View>
          )}

          {/* Race conditional fields */}
          {isRaceGoal && (
            <View style={styles.conditionalFields}>
              <Text style={styles.inputLabel}>Distance de course</Text>
              <View style={styles.distanceGrid}>
                {RACE_DISTANCES.map((dist) => (
                  <TouchableOpacity
                    key={dist.value}
                    onPress={() => {
                      setRaceDistance(dist.value);
                      markChanged();
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    }}
                    style={[
                      styles.distanceChip,
                      raceDistance === dist.value && styles.distanceChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.distanceChipText,
                        raceDistance === dist.value && styles.distanceChipTextSelected,
                      ]}
                    >
                      {dist.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {raceDistance === 'autre' && (
                <View style={styles.conditionalInput}>
                  <Text style={styles.inputLabel}>Précisez la distance</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ex: 10km, semi-marathon..."
                    placeholderTextColor={colors.text.tertiary}
                    value={raceDistanceOther}
                    onChangeText={(text) => {
                      setRaceDistanceOther(text);
                      markChanged();
                    }}
                    selectionColor={colors.accent.blue}
                  />
                </View>
              )}

              <View style={styles.conditionalInput}>
                <Text style={styles.inputLabel}>Date de la course</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="calendar-outline" size={20} color={colors.accent.blue} />
                  <Text style={[styles.datePickerText, !targetRaceDate && styles.datePickerPlaceholder]}>
                    {targetRaceDate
                      ? format(parseISO(targetRaceDate), 'd MMMM yyyy', { locale: fr })
                      : 'Sélectionner une date'}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  Platform.OS === 'ios' ? (
                    <Modal
                      transparent
                      animationType="slide"
                      visible={showDatePicker}
                      onRequestClose={() => setShowDatePicker(false)}
                    >
                      <View style={styles.datePickerModal}>
                        <View style={styles.datePickerContainer}>
                          <View style={styles.datePickerHeader}>
                            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                              <Text style={styles.datePickerCancel}>Annuler</Text>
                            </TouchableOpacity>
                            <Text style={styles.datePickerTitle}>Date de course</Text>
                            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                              <Text style={styles.datePickerDone}>OK</Text>
                            </TouchableOpacity>
                          </View>
                          <DateTimePicker
                            value={targetRaceDate ? parseISO(targetRaceDate) : new Date()}
                            mode="date"
                            display="spinner"
                            minimumDate={new Date()}
                            onChange={(event, date) => {
                              if (date) {
                                setTargetRaceDate(format(date, 'yyyy-MM-dd'));
                                markChanged();
                              }
                            }}
                            textColor={colors.text.primary}
                          />
                        </View>
                      </View>
                    </Modal>
                  ) : (
                    <DateTimePicker
                      value={targetRaceDate ? parseISO(targetRaceDate) : new Date()}
                      mode="date"
                      display="default"
                      minimumDate={new Date()}
                      onChange={(event, date) => {
                        setShowDatePicker(false);
                        if (event.type === 'set' && date) {
                          setTargetRaceDate(format(date, 'yyyy-MM-dd'));
                          markChanged();
                        }
                      }}
                    />
                  )
                )}
              </View>

              {/* Goal Time - shown for all distances */}
              {raceDistance && (() => {
                const hourOpts = [];
                for (let h = 0; h <= 5; h++) {
                  hourOpts.push({ value: h, label: `${h}` });
                }
                const minuteOpts = [];
                for (let m = 0; m < 60; m++) {
                  minuteOpts.push({ value: m, label: String(m).padStart(2, '0') });
                }
                const secondOpts = [];
                for (let s = 0; s < 60; s++) {
                  secondOpts.push({ value: s, label: String(s).padStart(2, '0') });
                }

                return (
                  <View style={styles.conditionalInput}>
                    <Text style={styles.inputLabel}>Temps visé</Text>
                    <Text style={styles.inputHint}>
                      Quel temps souhaitez-vous atteindre ?
                    </Text>
                    <View style={styles.goalTimeRow}>
                      <View style={styles.goalTimeCol}>
                        <Text style={styles.goalTimeUnitLabel}>HEURES</Text>
                        <WheelPicker
                          key={`profile-hours-${raceDistance}`}
                          data={hourOpts}
                          onValueChange={(v) => { setGoalTimeHours(v as number); markChanged(); }}
                          itemHeight={44}
                          wheelHeight={132}
                          fontSize={18}
                          initialIndex={hourOpts.findIndex(o => o.value === goalTimeHours)}
                        />
                      </View>
                      <Text style={styles.goalTimeSep}>:</Text>
                      <View style={styles.goalTimeCol}>
                        <Text style={styles.goalTimeUnitLabel}>MINUTES</Text>
                        <WheelPicker
                          key={`profile-minutes-${raceDistance}`}
                          data={minuteOpts}
                          onValueChange={(v) => { setGoalTimeMinutes(v as number); markChanged(); }}
                          itemHeight={44}
                          wheelHeight={132}
                          fontSize={18}
                          initialIndex={goalTimeMinutes}
                        />
                      </View>
                      <Text style={styles.goalTimeSep}>:</Text>
                      <View style={styles.goalTimeCol}>
                        <Text style={styles.goalTimeUnitLabel}>SECONDES</Text>
                        <WheelPicker
                          key={`profile-seconds-${raceDistance}`}
                          data={secondOpts}
                          onValueChange={(v) => { setGoalTimeSeconds(v as number); markChanged(); }}
                          itemHeight={44}
                          wheelHeight={132}
                          fontSize={18}
                          initialIndex={goalTimeSeconds}
                        />
                      </View>
                    </View>
                    <Text style={styles.goalTimeSummaryText}>
                      Objectif : {goalTimeHours > 0 ? `${goalTimeHours}H` : ''}{String(goalTimeMinutes).padStart(2, '0')}MIN{String(goalTimeSeconds).padStart(2, '0')}SEC
                    </Text>
                  </View>
                );
              })()}

              {/* Intermediate Objectives */}
              <View style={styles.conditionalInput}>
                <Text style={styles.inputLabel}>Objectif intermédiaire (optionnel)</Text>
                <TextInput
                  style={styles.multilineInput}
                  placeholder="Ex: Courir un 10km en moins de 45 minutes..."
                  placeholderTextColor={colors.text.tertiary}
                  value={intermediateObjectives}
                  onChangeText={(text) => { setIntermediateObjectives(text); markChanged(); }}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  selectionColor={colors.accent.blue}
                  cursorColor={colors.accent.blue}
                  maxLength={1000}
                />
              </View>
            </View>
          )}
        </View>

        {/* EDITABLE: Available Days */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={20} color={colors.accent.blue} />
            <Text style={styles.sectionTitle}>Jours disponibles</Text>
            <View style={styles.editBadge}>
              <Ionicons name="create" size={12} color={colors.accent.blue} />
            </View>
          </View>
          <View style={styles.daysContainer}>
            {DAYS.map((day) => (
              <TouchableOpacity
                key={day.value}
                onPress={() => toggleDay(day.value)}
                activeOpacity={0.8}
                style={[styles.dayCard, selectedDays.includes(day.value) && styles.dayCardSelected]}
              >
                <Text style={[styles.dayText, selectedDays.includes(day.value) && styles.dayTextSelected]}>
                  {day.label}
                </Text>
                <View style={[styles.checkbox, selectedDays.includes(day.value) && styles.checkboxSelected]}>
                  {selectedDays.includes(day.value) && (
                    <MaterialCommunityIcons name="check" size={14} color={colors.text.primary} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* EDITABLE: Training Locations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color={colors.accent.blue} />
            <Text style={styles.sectionTitle}>Lieux d'entraînement</Text>
            <View style={styles.editBadge}>
              <Ionicons name="create" size={12} color={colors.accent.blue} />
            </View>
          </View>
          <View style={styles.locationsContainer}>
            {LOCATIONS.map((location) => (
              <TouchableOpacity
                key={location.value}
                onPress={() => toggleLocation(location.value)}
                activeOpacity={0.8}
                style={[
                  styles.locationCard,
                  selectedLocations.includes(location.value) && styles.locationCardSelected,
                ]}
              >
                <View
                  style={[
                    styles.locationIcon,
                    selectedLocations.includes(location.value) && styles.locationIconSelected,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={location.icon as any}
                    size={20}
                    color={selectedLocations.includes(location.value) ? colors.accent.blue : colors.text.secondary}
                  />
                </View>
                <Text
                  style={[
                    styles.locationText,
                    selectedLocations.includes(location.value) && styles.locationTextSelected,
                  ]}
                >
                  {location.title}
                </Text>
                <View
                  style={[
                    styles.checkbox,
                    selectedLocations.includes(location.value) && styles.checkboxSelected,
                  ]}
                >
                  {selectedLocations.includes(location.value) && (
                    <MaterialCommunityIcons name="check" size={14} color={colors.text.primary} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Other location input */}
          {selectedLocations.includes('autre') && (
            <View style={styles.conditionalInput}>
              <Text style={styles.inputLabel}>Précisez le lieu</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ex: Plage, forêt, montagne..."
                placeholderTextColor={colors.text.tertiary}
                value={otherLocationText}
                onChangeText={(text) => {
                  setOtherLocationText(text);
                  markChanged();
                }}
                selectionColor={colors.accent.blue}
              />
            </View>
          )}
        </View>

        {/* EDITABLE: Health - Injuries & Constraints */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="heart" size={20} color={colors.accent.blue} />
            <Text style={styles.sectionTitle}>Santé et contraintes</Text>
            <View style={styles.editBadge}>
              <Ionicons name="create" size={12} color={colors.accent.blue} />
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>
              Blessure(s) ou limitation(s) physique{' '}
              <Text style={styles.inputOptional}>(Optionnel)</Text>
            </Text>
            <TextInput
              style={styles.multilineInput}
              placeholder="Ex: Tendinite d'Achille, douleur au genou..."
              placeholderTextColor={colors.text.tertiary}
              value={injuries}
              onChangeText={(text) => {
                setInjuries(text);
                markChanged();
              }}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              selectionColor={colors.accent.blue}
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>
              Contraintes personnelles{' '}
              <Text style={styles.inputOptional}>(Optionnel)</Text>
            </Text>
            <Text style={styles.inputHint}>Ex: travail de nuit, garde d'enfants...</Text>
            <TextInput
              style={styles.multilineInput}
              placeholder="Partagez vos contraintes pour un plan adapté..."
              placeholderTextColor={colors.text.tertiary}
              value={constraints}
              onChangeText={(text) => {
                setConstraints(text);
                markChanged();
              }}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              selectionColor={colors.accent.blue}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!hasChanges || isSaving) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!hasChanges || isSaving}
          activeOpacity={0.9}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav activeTab="profile" />
    </View>
  );
}

function InfoRowDisabled({ label, value, isLast = false }: { label: string; value: string; isLast?: boolean }) {
  return (
    <View style={[styles.infoRow, !isLast && styles.infoRowBorder]}>
      <Text style={styles.infoLabelDisabled}>{label}</Text>
      <Text style={styles.infoValueDisabled}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary.dark,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },

  // Intro
  introSection: {
    marginBottom: 24,
  },
  introSubtitle: {
    fontSize: 14,
    color: colors.text.tertiary,
    lineHeight: 20,
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  sectionTitleDisabled: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.tertiary,
  },
  lockBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  editBadge: {
    backgroundColor: 'rgba(50, 140, 231, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  // Card - Disabled
  cardDisabled: {
    backgroundColor: 'rgba(26, 38, 50, 0.3)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },

  // Info Row - Disabled
  infoRow: {
    paddingVertical: 12,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  infoLabelDisabled: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValueDisabled: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },

  // Options Container (Goals)
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(26, 38, 50, 0.5)',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  optionCardSelected: {
    borderColor: colors.accent.blue,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.accent.blue,
    backgroundColor: 'rgba(50, 140, 231, 0.15)',
  },
  radioCircleInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent.blue,
  },
  optionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
  },
  optionTitleSelected: {
    color: colors.accent.blue,
  },

  // Conditional Inputs
  conditionalInput: {
    marginTop: 16,
    gap: 8,
  },
  conditionalFields: {
    marginTop: 20,
    gap: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginLeft: 4,
  },
  inputOptional: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.text.secondary,
  },
  inputHint: {
    fontSize: 13,
    color: colors.text.secondary,
    marginLeft: 4,
    marginTop: -4,
  },
  textInput: {
    backgroundColor: 'rgba(26, 38, 50, 0.5)',
    color: colors.text.primary,
    fontSize: 15,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  editableRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  editableFieldHalf: {
    flex: 1,
  },
  editableFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 6,
  },
  compactInput: {
    backgroundColor: 'rgba(26, 38, 50, 0.5)',
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  multilineInput: {
    backgroundColor: 'rgba(26, 38, 50, 0.5)',
    color: colors.text.primary,
    fontSize: 15,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputSection: {
    gap: 8,
    marginBottom: 16,
  },

  // Goal Time
  goalTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  goalTimeCol: {
    flex: 1,
    maxWidth: 100,
  },
  goalTimeUnitLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: 4,
  },
  goalTimeSep: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 16,
  },
  goalTimeSummaryText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.accent.blue,
    textAlign: 'center',
    marginTop: 12,
  },

  // Date Picker
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(26, 38, 50, 0.5)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  datePickerText: {
    fontSize: 15,
    color: colors.text.primary,
    flex: 1,
  },
  datePickerPlaceholder: {
    color: colors.text.tertiary,
  },
  datePickerModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerContainer: {
    backgroundColor: colors.primary.dark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  datePickerCancel: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  datePickerDone: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent.blue,
  },

  // Distance Grid
  distanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  distanceChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(26, 38, 50, 0.5)',
  },
  distanceChipSelected: {
    borderColor: colors.accent.blue,
    backgroundColor: 'rgba(50, 140, 231, 0.15)',
  },
  distanceChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  distanceChipTextSelected: {
    color: colors.accent.blue,
  },

  // Days Container
  daysContainer: {
    gap: 10,
  },
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(26, 38, 50, 0.5)',
  },
  dayCardSelected: {
    borderColor: colors.accent.blue,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
  },
  dayTextSelected: {
    color: colors.accent.blue,
  },

  // Checkbox
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: colors.accent.blue,
    backgroundColor: colors.accent.blue,
  },

  // Locations Container
  locationsContainer: {
    gap: 10,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(26, 38, 50, 0.5)',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  locationCardSelected: {
    borderColor: colors.accent.blue,
  },
  locationIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationIconSelected: {
    backgroundColor: 'rgba(50, 140, 231, 0.2)',
  },
  locationText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
  },
  locationTextSelected: {
    color: colors.accent.blue,
  },

  // Save Button
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent.blue,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    shadowColor: colors.accent.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
