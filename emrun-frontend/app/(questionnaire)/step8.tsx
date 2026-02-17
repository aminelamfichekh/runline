/**
 * Step 8: Lieux d'Entraînement
 * Polished UI with shared components and smooth animations
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
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
  { value: 'autre', icon: 'map-marker-plus', title: 'Autre', subtitle: 'Précisez le lieu' },
];

interface LocationCardProps {
  location: LocationOption;
  isSelected: boolean;
  onToggle: (value: LocationValue) => void;
  index: number;
}

function LocationCard({ location, isSelected, onToggle, index }: LocationCardProps) {
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
      toValue: 0.98,
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
    onToggle(location.value);
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          { scale: scaleAnim },
          {
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [15, 0],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[styles.locationCard, isSelected && styles.locationCardSelected]}
      >
        <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
          <MaterialCommunityIcons
            name={location.icon as any}
            size={22}
            color={isSelected ? colors.accent.blue : colors.text.secondary}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.locationTitle, isSelected && styles.locationTitleSelected]}>
            {location.title}
          </Text>
          <Text style={styles.locationSubtitle}>{location.subtitle}</Text>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && (
            <MaterialCommunityIcons name="check" size={14} color={colors.text.primary} />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function Step8Screen() {
  const router = useRouter();
  const { form, saveNow } = useQuestionnaireForm();
  const { setValue, watch } = form;
  const scrollViewRef = useRef<ScrollView>(null);

  const primaryGoal = watch('primary_goal') as string | undefined;
  const { currentStep, totalSteps } = getStepProgress('step8', primaryGoal);

  const [selectedLocations, setSelectedLocations] = useState<LocationValue[]>(
    (watch('training_locations') as LocationValue[]) || []
  );

  const savedOtherLocation = watch('other_training_location') as string | undefined;
  const [otherLocationText, setOtherLocationText] = useState(savedOtherLocation || '');

  // Entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, []);

  const toggleLocation = (location: LocationValue) => {
    // Animate layout change smoothly
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setSelectedLocations((prev) => {
      const isRemoving = prev.includes(location);
      if (isRemoving) {
        return prev.filter((l) => l !== location);
      } else {
        // If selecting "autre", scroll down to show the input
        if (location === 'autre') {
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
        return [...prev, location];
      }
    });
  };

  const handleContinue = async () => {
    setValue('training_locations', selectedLocations);
    if (selectedLocations.includes('autre') && otherLocationText.trim()) {
      setValue('other_training_location', otherLocationText.trim());
    } else {
      setValue('other_training_location', undefined);
    }
    // Save data immediately before navigation to ensure it's persisted
    await saveNow();
    router.push('/(questionnaire)/step9');
  };

  const showOtherInput = selectedLocations.includes('autre');

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient} />

      <QuestionnaireHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        backRoute="/(questionnaire)/step7"
      />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
          <View style={styles.headlineContainer}>
            <Text style={styles.headline}>
              Vos <Text style={styles.headlineHighlight}>lieux de pratique</Text>
            </Text>
            <Text style={styles.subheadline}>
              Sélectionnez tous les terrains sur lesquels vous avez l'habitude de courir.
            </Text>
          </View>

          <View style={styles.locationsContainer}>
            {LOCATIONS.map((location, index) => (
              <LocationCard
                key={location.value}
                location={location}
                isSelected={selectedLocations.includes(location.value)}
                onToggle={toggleLocation}
                index={index}
              />
            ))}
          </View>

          {/* Other location text input */}
          {showOtherInput && (
            <View style={styles.otherInputContainer}>
              <Text style={styles.otherInputLabel}>Précisez le lieu</Text>
              <TextInput
                style={styles.otherInput}
                placeholder="Ex: Plage, forêt, montagne..."
                placeholderTextColor={colors.text.tertiary}
                value={otherLocationText}
                onChangeText={setOtherLocationText}
                selectionColor={colors.accent.blue}
                cursorColor={colors.accent.blue}
                underlineColorAndroid="transparent"
              />
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <ContinueButton
          onPress={handleContinue}
          disabled={
            selectedLocations.length === 0 ||
            (selectedLocations.includes('autre') && !otherLocationText.trim())
          }
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
  locationsContainer: {
    gap: questionnaireTokens.spacing.md,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: questionnaireTokens.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(26, 38, 50, 0.5)',
    paddingVertical: questionnaireTokens.spacing.lg,
    paddingHorizontal: questionnaireTokens.spacing.lg,
  },
  locationCardSelected: {
    borderColor: colors.accent.blue,
    borderWidth: 1.5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: questionnaireTokens.spacing.md,
  },
  iconContainerSelected: {
    backgroundColor: 'rgba(50, 140, 231, 0.2)',
  },
  textContainer: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
  },
  locationTitleSelected: {
    color: colors.accent.blue,
  },
  locationSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
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
  otherInputContainer: {
    marginTop: questionnaireTokens.spacing.lg,
    gap: questionnaireTokens.spacing.sm,
  },
  otherInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginLeft: questionnaireTokens.spacing.xs,
  },
  otherInput: {
    width: '100%',
    backgroundColor: 'rgba(26, 38, 50, 0.5)',
    color: colors.text.primary,
    fontSize: 15,
    borderRadius: questionnaireTokens.borderRadius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: questionnaireTokens.spacing.lg,
    paddingHorizontal: questionnaireTokens.spacing.lg,
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
