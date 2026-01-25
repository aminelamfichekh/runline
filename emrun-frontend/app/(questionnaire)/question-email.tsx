/**
 * Question 1: Email
 * Première question - crée la session au premier champ rempli
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { SingleQuestionScreen } from '@/components/questionnaire/SingleQuestionScreen';
import { TextInputField } from '@/components/forms/TextInputField';
import { autosaveService } from '@/lib/services/AutosaveService';
import { getQuestionById, getNextQuestionId, getPreviousQuestionId } from '@/lib/questionnaire/questions';

const QUESTION_ID = 1;

export default function QuestionEmailScreen() {
  const router = useRouter();
  const { form, currentQuestion, setCurrentQuestion, totalQuestions } = useQuestionnaireForm();
  const { setValue, watch, formState: { errors } } = form;
  const [isInitialized, setIsInitialized] = useState(false);

  const email = watch('email');
  const question = getQuestionById(QUESTION_ID);

  // Initialize autosave service
  useEffect(() => {
    const init = async () => {
      await autosaveService.initialize();
      setIsInitialized(true);
    };
    init();
  }, []);

  // Handle email change - create session on first field filled
  const handleEmailChange = async (text: string) => {
    setValue('email', text, { shouldValidate: true });
    
    // Create session on first field filled (email)
    if (text && text.trim() && !autosaveService.getSessionUuid()) {
      try {
        await autosaveService.ensureSession({ email: text });
      } catch (error) {
        console.error('Failed to create session:', error);
      }
    }

    // Autosave with debounce
    if (isInitialized) {
      const currentData = form.getValues();
      await autosaveService.save(currentData);
    }
  };

  const handleNext = () => {
    const currentData = form.getValues();
    const nextId = getNextQuestionId(QUESTION_ID, currentData);
    
    if (nextId) {
      setCurrentQuestion(nextId);
      // Navigate to next question screen
      router.push(`/(questionnaire)/question-${getQuestionById(nextId)?.key}`);
    }
  };

  const handlePrevious = () => {
    const currentData = form.getValues();
    const prevId = getPreviousQuestionId(QUESTION_ID, currentData);
    
    if (prevId) {
      setCurrentQuestion(prevId);
      router.push(`/(questionnaire)/question-${getQuestionById(prevId)?.key}`);
    } else {
      router.push('/');
    }
  };

  if (!question) {
    return null;
  }

  const isValid = !!email && !errors.email;

  return (
    <SingleQuestionScreen
      questionNumber={currentQuestion || QUESTION_ID}
      totalQuestions={totalQuestions}
      title={question.title}
      subtitle={question.subtitle}
      onNext={handleNext}
      onPrevious={handlePrevious}
      isValid={isValid}
      isOptional={!question.required}
    >
      <TextInputField
        label="Email"
        value={email}
        onChangeText={handleEmailChange}
        error={errors.email?.message}
        required={question.required}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        placeholder="exemple@email.com"
      />
    </SingleQuestionScreen>
  );
}



