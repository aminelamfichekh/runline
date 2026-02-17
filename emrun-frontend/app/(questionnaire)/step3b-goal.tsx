/**
 * Step 3b-goal: Détails de l'Objectif (CONDITIONAL)
 * Polished UI with shared components and correct progress tracking
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  Modal,
  Animated,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { colors } from '@/constants/colors';
import {
  QuestionnaireHeader,
  ContinueButton,
  questionnaireTokens,
  getStepProgress,
} from '@/components/questionnaire';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type DistancePreset = '5km' | '10km' | 'semi_marathon' | 'marathon' | 'autre';

interface DistanceCardProps {
  value: DistancePreset;
  icon: string;
  label: string;
  isSelected: boolean;
  onSelect: (value: DistancePreset) => void;
  index: number;
}

function DistanceCard({ value, icon, label, isSelected, onSelect, index }: DistanceCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSelect(value);
  };

  return (
    <Animated.View
      style={[
        styles.distanceCardWrapper,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[styles.distanceCard, isSelected && styles.distanceCardSelected]}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={22}
          color={isSelected ? colors.accent.blue : colors.text.secondary}
        />
        <Text style={[styles.distanceCardLabel, isSelected && styles.distanceCardLabelSelected]}>
          {label}
        </Text>
        {isSelected && (
          <View style={styles.checkWrap}>
            <MaterialCommunityIcons name="check-circle" size={18} color={colors.accent.blue} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function Step3bGoalScreen() {
  const router = useRouter();
  const { form, saveNow } = useQuestionnaireForm();
  const { setValue, watch } = form;
  const scrollViewRef = useRef<ScrollView>(null);

  // Use 'courir_race' path for correct progress calculation
  const { currentStep, totalSteps } = getStepProgress('step3b-goal', 'courir_race');

  const savedDistance = watch('race_distance') as string | undefined;
  const savedDate = watch('target_race_date') as string | undefined;
  const savedRaceDistanceOther = watch('race_distance_other') as string | undefined;

  const mapBackendToPreset = (v?: string): DistancePreset => {
    if (v === '5km' || v === '10km' || v === 'semi_marathon' || v === 'marathon') return v;
    if (v === 'autre') return 'autre';
    return '10km';
  };

  const [distancePreset, setDistancePreset] = useState<DistancePreset>(
    mapBackendToPreset(savedDistance)
  );
  const [autreDescription, setAutreDescription] = useState<string>(savedRaceDistanceOther || '');

  // Date: null means not selected yet
  const [raceDate, setRaceDate] = useState<Date | null>(() => {
    if (savedDate) {
      const d = new Date(savedDate);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleContinue = async () => {
    if (distancePreset === 'autre') {
      setValue('race_distance', 'autre');
      setValue('race_distance_other', autreDescription);
      setValue('race_distance_km', undefined as any);
    } else {
      setValue('race_distance', distancePreset);
      setValue('race_distance_other', undefined as any);
      setValue('race_distance_km', undefined as any);
    }
    if (raceDate) {
      setValue('target_race_date', format(raceDate, 'yyyy-MM-dd'));
    }
    // Save data immediately before navigation to ensure it's persisted
    await saveNow();
    router.push('/(questionnaire)/step3b');
  };

  const handleDistanceSelect = (preset: DistancePreset) => {
    // Animate layout change smoothly
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setDistancePreset(preset);
    if (preset !== 'autre') {
      setValue('race_distance', preset as any);
      setValue('race_distance_other', undefined as any);
    } else {
      setValue('race_distance', 'autre');
      setValue('race_distance_other', autreDescription);
      // Scroll down to show the text input
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleAutreDescriptionChange = (text: string) => {
    setAutreDescription(text);
    setValue('race_distance', 'autre');
    setValue('race_distance_other', text);
  };

  const onDateChange = (_: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) setRaceDate(date);
  };

  const dateLabel = raceDate
    ? format(raceDate, 'EEEE d MMMM yyyy', { locale: fr })
    : 'Choisir une date';

  const distances: Array<{ value: DistancePreset; icon: string; label: string }> = [
    { value: '5km', icon: 'shoe-sneaker', label: '5 km' },
    { value: '10km', icon: 'run-fast', label: '10 km' },
    { value: 'semi_marathon', icon: 'timer-outline', label: 'Semi' },
    { value: 'marathon', icon: 'trophy-outline', label: 'Marathon' },
  ];

  // Default date for picker (2 months from now)
  const getPickerDate = () => {
    if (raceDate) return raceDate;
    const d = new Date();
    d.setMonth(d.getMonth() + 2);
    return d;
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient} />

      <QuestionnaireHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        backRoute="/(questionnaire)/step3"
      />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
          <View style={styles.headlineContainer}>
            <Text style={styles.headline}>
              Détails de{'\n'}
              <Text style={styles.headlineHighlight}>votre objectif</Text>
            </Text>
            <Text style={styles.subheadline}>
              Personnalisez votre plan pour votre prochaine course.
            </Text>
          </View>

          {/* Distance Selection */}
          <View style={styles.section}>
            <View style={styles.sectionLabelRow}>
              <MaterialCommunityIcons name="ruler" size={18} color={colors.accent.blue} />
              <Text style={styles.sectionLabel}>Quelle distance préparez-vous ?</Text>
            </View>
            <View style={styles.distanceGrid}>
              {distances.map((d, index) => (
                <DistanceCard
                  key={d.value}
                  value={d.value}
                  icon={d.icon}
                  label={d.label}
                  isSelected={distancePreset === d.value}
                  onSelect={handleDistanceSelect}
                  index={index}
                />
              ))}
            </View>

            {/* Autre option */}
            <TouchableOpacity
              onPress={() => handleDistanceSelect('autre')}
              activeOpacity={0.8}
              style={[
                styles.distanceCardAutre,
                distancePreset === 'autre' && styles.distanceCardAutreSelected,
              ]}
            >
              <MaterialCommunityIcons
                name="map-marker-path"
                size={20}
                color={distancePreset === 'autre' ? colors.accent.blue : colors.text.secondary}
              />
              <Text
                style={[
                  styles.distanceCardAutreLabel,
                  distancePreset === 'autre' && styles.distanceCardAutreLabelSelected,
                ]}
              >
                Autre distance
              </Text>
              {distancePreset === 'autre' && (
                <MaterialCommunityIcons name="radiobox-marked" size={18} color={colors.accent.blue} />
              )}
            </TouchableOpacity>

            {distancePreset === 'autre' && (
              <View style={styles.autreInputWrap}>
                <Text style={styles.autreInputLabel}>DÉTAILS DE VOTRE OBJECTIF</Text>
                <TextInput
                  style={styles.autreTextInput}
                  placeholder="Ex: Trail de 35km, Ultra de 80km, Course locale..."
                  placeholderTextColor={colors.text.tertiary}
                  value={autreDescription}
                  onChangeText={handleAutreDescriptionChange}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  selectionColor={colors.accent.blue}
                  cursorColor={colors.accent.blue}
                  underlineColorAndroid="transparent"
                />
              </View>
            )}
          </View>

          {/* Date Selection */}
          <View style={styles.section}>
            <View style={styles.sectionLabelRow}>
              <MaterialCommunityIcons name="calendar-month" size={18} color={colors.accent.blue} />
              <Text style={styles.sectionLabel}>Date de la course</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setShowDatePicker(true);
              }}
              style={[styles.dateTouchable, !raceDate && styles.dateTouchablePlaceholder]}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="calendar"
                size={22}
                color={raceDate ? colors.text.secondary : colors.text.tertiary}
              />
              <Text style={[styles.dateLabelText, !raceDate && styles.dateLabelPlaceholder]}>
                {dateLabel}
              </Text>
              <MaterialCommunityIcons
                name="chevron-down"
                size={20}
                color={raceDate ? colors.text.secondary : colors.text.tertiary}
              />
            </TouchableOpacity>
            <Text style={styles.dateHint}>
              Nous calculerons votre plan à partir de cette date.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* iOS Date Picker Modal */}
      {Platform.OS === 'ios' && showDatePicker && (
        <Modal transparent animationType="slide">
          <TouchableOpacity
            style={styles.datePickerOverlay}
            activeOpacity={1}
            onPress={() => setShowDatePicker(false)}
          />
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerBar}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.datePickerCancel}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.datePickerDone}>OK</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={getPickerDate()}
              mode="date"
              display="spinner"
              onChange={onDateChange}
              minimumDate={new Date()}
              locale="fr-FR"
            />
          </View>
        </Modal>
      )}

      {/* Android Date Picker */}
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={getPickerDate()}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      <View style={styles.footer}>
        <ContinueButton
          onPress={handleContinue}
          label="Suivant"
          disabled={distancePreset === 'autre' && !autreDescription.trim()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(50, 140, 231, 0.05)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  mainContent: {
    paddingHorizontal: questionnaireTokens.spacing.xxl,
  },
  headlineContainer: {
    paddingTop: questionnaireTokens.spacing.lg,
    paddingBottom: questionnaireTokens.spacing.xxl,
  },
  headline: {
    ...questionnaireTokens.typography.headline,
    color: colors.text.primary,
    marginBottom: questionnaireTokens.spacing.sm,
  },
  headlineHighlight: {
    color: colors.accent.blue,
  },
  subheadline: {
    ...questionnaireTokens.typography.subheadline,
    color: colors.text.secondary,
  },
  section: {
    marginBottom: questionnaireTokens.spacing.xxl,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: questionnaireTokens.spacing.sm,
    marginBottom: questionnaireTokens.spacing.lg,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent.blue,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  distanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: questionnaireTokens.spacing.md,
    marginBottom: questionnaireTokens.spacing.md,
  },
  distanceCardWrapper: {
    width: '47%',
  },
  distanceCard: {
    height: 96,
    backgroundColor: 'rgba(26, 38, 50, 0.5)',
    borderRadius: questionnaireTokens.borderRadius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: questionnaireTokens.spacing.lg,
    justifyContent: 'space-between',
  },
  distanceCardSelected: {
    borderColor: colors.accent.blue,
    borderWidth: 1.5,
  },
  distanceCardLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  distanceCardLabelSelected: {
    color: colors.accent.blue,
  },
  checkWrap: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  distanceCardAutre: {
    width: '100%',
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 38, 50, 0.5)',
    borderRadius: questionnaireTokens.borderRadius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: questionnaireTokens.spacing.lg,
    gap: questionnaireTokens.spacing.md,
  },
  distanceCardAutreSelected: {
    borderColor: colors.accent.blue,
  },
  distanceCardAutreLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  distanceCardAutreLabelSelected: {
    color: colors.accent.blue,
  },
  autreInputWrap: {
    marginTop: questionnaireTokens.spacing.lg,
    paddingVertical: questionnaireTokens.spacing.md,
  },
  autreInputLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: colors.text.tertiary,
    marginBottom: questionnaireTokens.spacing.sm,
  },
  autreTextInput: {
    width: '100%',
    backgroundColor: colors.primary.medium,
    color: colors.text.primary,
    fontSize: 15,
    borderRadius: questionnaireTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingVertical: questionnaireTokens.spacing.lg,
    paddingHorizontal: questionnaireTokens.spacing.lg,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: 'rgba(26, 38, 50, 0.5)',
    borderRadius: questionnaireTokens.borderRadius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: questionnaireTokens.spacing.lg,
    gap: questionnaireTokens.spacing.md,
  },
  dateTouchablePlaceholder: {
    borderStyle: 'dashed',
  },
  dateLabelText: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
  },
  dateLabelPlaceholder: {
    color: colors.text.tertiary,
  },
  dateHint: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: questionnaireTokens.spacing.sm,
    marginLeft: questionnaireTokens.spacing.xs,
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerContainer: {
    backgroundColor: colors.primary.medium,
    borderTopLeftRadius: questionnaireTokens.borderRadius.lg,
    borderTopRightRadius: questionnaireTokens.borderRadius.lg,
    paddingBottom: 24,
  },
  datePickerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  datePickerCancel: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  datePickerDone: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent.blue,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: questionnaireTokens.spacing.xxl,
    paddingTop: questionnaireTokens.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : 32,
    backgroundColor: colors.primary.dark,
  },
});
