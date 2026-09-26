import { useSignIn, useSignUp } from '@clerk/expo';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { completeMissingSignUpRequirements } from '@/auth/complete-missing-sign-up-requirements';
import {
  resendSignInEmailCode,
  resendSignUpEmailCode,
  signInWithPassword,
  signUpWithPassword,
  verifySignInEmailCode,
  verifySignUpEmailCode,
} from '@/auth/password-auth';

type AuthMode = 'sign-in' | 'sign-up';
type CodePurpose = AuthMode | null;

const supportedAdditionalFields = new Set([
  'first_name',
  'last_name',
  'username',
]);

export default function SignInScreen() {
  const { signIn, fetchStatus: signInFetchStatus } = useSignIn();
  const { signUp, fetchStatus: signUpFetchStatus } = useSignUp();

  const [authMode, setAuthMode] = useState<AuthMode>('sign-in');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [codePurpose, setCodePurpose] = useState<CodePurpose>(null);
  const [needsAdditionalSignUpInfo, setNeedsAdditionalSignUpInfo] =
    useState(false);
  const [needsUnsupportedStep, setNeedsUnsupportedStep] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const isBusy =
    isWorking ||
    signInFetchStatus === 'fetching' ||
    signUpFetchStatus === 'fetching';
  const missingSignUpFields = signUp?.missingFields ?? [];
  const hasUnsupportedSignUpFields =
    missingSignUpFields.length === 0 ||
    missingSignUpFields.some((field) => !supportedAdditionalFields.has(field));
  const showAdditionalSignUpForm =
    needsAdditionalSignUpInfo && !hasUnsupportedSignUpFields;
  const showCodeEntry = codePurpose !== null;
  const showPasswordForm =
    !showCodeEntry && !needsAdditionalSignUpInfo && !needsUnsupportedStep;

  const clearMessages = () => {
    setErrorMessage(null);
    setStatusMessage(null);
  };

  const handleEmailChange = (value: string) => {
    setEmailAddress(value);
    clearMessages();
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    clearMessages();
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
    clearMessages();
  };

  const handleSignUpFieldChange =
    (setValue: (value: string) => void) => (value: string) => {
      setValue(value);
      clearMessages();
    };

  const handlePasswordSubmit = async () => {
    if (isBusy) {
      return;
    }

    setIsWorking(true);
    clearMessages();

    try {
      const result =
        authMode === 'sign-in'
          ? await signInWithPassword(signIn, emailAddress, password)
          : await signUpWithPassword(signUp, emailAddress, password);

      switch (result.status) {
        case 'email-required':
          setErrorMessage('Enter your email address.');
          break;
        case 'password-required':
          setErrorMessage('Enter your password.');
          break;
        case 'code-required':
          setCode('');
          setCodePurpose(authMode);
          setStatusMessage(
            authMode === 'sign-up'
              ? 'Check your email for a verification code.'
              : 'Check your email for a sign-in verification code.',
          );
          break;
        case 'request-failed':
          setErrorMessage(
            authMode === 'sign-in'
              ? 'Could not sign in. Check your email and password, then try again.'
              : (result.userMessage ??
                  'Could not create your account. Check your details and try again.'),
          );
          break;
        case 'signed-in':
          setStatusMessage('Signed in. Opening your diary...');
          break;
        case 'signed-up':
          setStatusMessage('Account created. Opening your diary...');
          break;
        case 'additional-sign-up-info-required':
          setNeedsAdditionalSignUpInfo(true);
          break;
        case 'unsupported-verification':
          setNeedsUnsupportedStep(true);
          break;
        case 'incomplete':
          setErrorMessage(
            'Could not complete authentication. Please try again.',
          );
          break;
        case 'verification-failed':
          setErrorMessage(
            result.userMessage ?? 'Could not verify your account. Try again.',
          );
          break;
      }
    } finally {
      setIsWorking(false);
    }
  };

  const handleVerifyCode = async () => {
    if (isBusy || !codePurpose) {
      return;
    }

    setIsWorking(true);
    clearMessages();

    try {
      const result =
        codePurpose === 'sign-in'
          ? await verifySignInEmailCode(signIn, code)
          : await verifySignUpEmailCode(signUp, code);

      switch (result.status) {
        case 'code-required':
          setErrorMessage('Enter the verification code from your email.');
          break;
        case 'verification-failed':
          setErrorMessage(
            result.userMessage ??
              'That code could not be verified. Check it and try again.',
          );
          break;
        case 'request-failed':
          setErrorMessage(
            codePurpose === 'sign-in'
              ? 'Could not complete sign-in. Please try again.'
              : (result.userMessage ??
                  'Could not finish creating your account. Please try again.'),
          );
          break;
        case 'signed-in':
          setStatusMessage('Signed in. Opening your diary...');
          break;
        case 'signed-up':
          setCodePurpose(null);
          setStatusMessage('Account created. Opening your diary...');
          break;
        case 'additional-sign-up-info-required':
          setCodePurpose(null);
          setNeedsAdditionalSignUpInfo(true);
          break;
        case 'unsupported-verification':
        case 'incomplete':
          setNeedsUnsupportedStep(true);
          break;
        case 'email-required':
        case 'password-required':
          setErrorMessage('Return to the sign-in form and enter your details.');
          break;
      }
    } finally {
      setIsWorking(false);
    }
  };

  const handleResendCode = async () => {
    if (isBusy || !codePurpose) {
      return;
    }

    setIsWorking(true);
    clearMessages();

    try {
      const result =
        codePurpose === 'sign-in'
          ? await resendSignInEmailCode(signIn)
          : await resendSignUpEmailCode(signUp);

      if (result.status === 'code-required') {
        setStatusMessage('A new verification code was sent.');
      } else if (result.status === 'request-failed') {
        setErrorMessage(
          codePurpose === 'sign-in'
            ? 'Could not send another code. Please try again.'
            : (result.userMessage ??
                'Could not send another code. Please try again.'),
        );
      } else {
        setErrorMessage(
          codePurpose === 'sign-in'
            ? 'Could not send another code. Please try again.'
            : 'Could not send another code. Please try again.',
        );
      }
    } finally {
      setIsWorking(false);
    }
  };

  const handleCompleteSignUp = async () => {
    if (isBusy) {
      return;
    }

    setIsWorking(true);
    clearMessages();

    try {
      const result = await completeMissingSignUpRequirements(signUp, {
        firstName,
        lastName,
        username,
      });

      if (result.status === 'fields-required') {
        setErrorMessage('Fill in each required account field.');
      } else if (result.status === 'request-failed') {
        setErrorMessage(
          result.userMessage ??
            'Could not finish creating your account. Please try again.',
        );
      } else if (result.status === 'additional-requirements-remain') {
        setErrorMessage(
          'Clerk still needs more account information. Complete the fields shown and try again.',
        );
      } else if (result.status === 'unsupported-requirements') {
        setNeedsUnsupportedStep(true);
      } else if (result.status === 'signed-up') {
        setNeedsAdditionalSignUpInfo(false);
        setStatusMessage('Account created. Opening your diary...');
      } else {
        setNeedsUnsupportedStep(true);
      }
    } finally {
      setIsWorking(false);
    }
  };

  const resetAttempt = async (clearEmail: boolean) => {
    try {
      const [signInReset, signUpReset] = await Promise.all([
        signIn.reset(),
        signUp.reset(),
      ]);

      if (signInReset.error || signUpReset.error) {
        setErrorMessage('Could not restart authentication. Please try again.');
        return false;
      }

      setPassword('');
      setCode('');
      setCodePurpose(null);
      setFirstName('');
      setLastName('');
      setUsername('');
      setNeedsAdditionalSignUpInfo(false);
      setNeedsUnsupportedStep(false);
      clearMessages();

      if (clearEmail) {
        setEmailAddress('');
      }

      return true;
    } catch {
      setErrorMessage('Could not restart authentication. Please try again.');
      return false;
    }
  };

  const handleModeSwitch = async () => {
    if (isBusy) {
      return;
    }

    setIsWorking(true);
    const didReset = await resetAttempt(false);

    if (didReset) {
      setAuthMode(authMode === 'sign-in' ? 'sign-up' : 'sign-in');
    }

    setIsWorking(false);
  };

  const handleStartOver = async () => {
    if (isBusy) {
      return;
    }

    setIsWorking(true);
    await resetAttempt(true);
    setIsWorking(false);
  };

  const title = showCodeEntry
    ? codePurpose === 'sign-up'
      ? 'Verify your email'
      : "Verify it's you"
    : needsAdditionalSignUpInfo
      ? 'Complete your account'
      : authMode === 'sign-up'
        ? 'Create your Tinta account'
        : 'Sign in to Tinta';
  const description = showCodeEntry
    ? `Enter the code sent to ${emailAddress.trim()}.`
    : needsAdditionalSignUpInfo
      ? 'Add the required details to finish creating your account.'
      : authMode === 'sign-up'
        ? 'Use your email and a password to create your account.'
        : 'Use your email and password to open your diary.';

  return (
    <View className="flex-1 items-center justify-center bg-black p-6">
      <View className="w-full max-w-md">
        <Text className="text-3xl font-semibold text-white">{title}</Text>
        <Text className="mt-3 text-base text-neutral-300">{description}</Text>

        <Text className="mt-8 text-sm font-medium text-neutral-200">
          Email address
        </Text>
        <TextInput
          accessibilityLabel="Email address"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-4 text-base text-white"
          editable={
            !isBusy &&
            !showCodeEntry &&
            !needsAdditionalSignUpInfo &&
            !needsUnsupportedStep
          }
          keyboardType="email-address"
          onChangeText={handleEmailChange}
          placeholder="Email address"
          placeholderTextColor="#a3a3a3"
          textContentType="emailAddress"
          value={emailAddress}
        />

        {showPasswordForm ? (
          <>
            <Text className="mt-6 text-sm font-medium text-neutral-200">
              Password
            </Text>
            <TextInput
              accessibilityLabel="Password"
              autoCapitalize="none"
              autoComplete={
                authMode === 'sign-in' ? 'current-password' : 'new-password'
              }
              autoCorrect={false}
              className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-4 text-base text-white"
              editable={!isBusy}
              onChangeText={handlePasswordChange}
              placeholder="Password"
              placeholderTextColor="#a3a3a3"
              secureTextEntry
              textContentType={
                authMode === 'sign-in' ? 'password' : 'newPassword'
              }
              value={password}
            />
          </>
        ) : null}

        {showCodeEntry ? (
          <>
            <Text className="mt-6 text-sm font-medium text-neutral-200">
              Verification code
            </Text>
            <TextInput
              accessibilityLabel="Verification code"
              autoCapitalize="none"
              autoComplete="one-time-code"
              autoCorrect={false}
              className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-4 text-base text-white"
              editable={!isBusy}
              keyboardType="number-pad"
              onChangeText={handleCodeChange}
              placeholder="Enter verification code"
              placeholderTextColor="#a3a3a3"
              textContentType="oneTimeCode"
              value={code}
            />
          </>
        ) : null}

        {showAdditionalSignUpForm &&
        missingSignUpFields.includes('first_name') ? (
          <>
            <Text className="mt-6 text-sm font-medium text-neutral-200">
              First name
            </Text>
            <TextInput
              accessibilityLabel="First name"
              autoCapitalize="words"
              autoCorrect={false}
              className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-4 text-base text-white"
              editable={!isBusy}
              onChangeText={handleSignUpFieldChange(setFirstName)}
              placeholder="First name"
              placeholderTextColor="#a3a3a3"
              textContentType="givenName"
              value={firstName}
            />
          </>
        ) : null}

        {showAdditionalSignUpForm &&
        missingSignUpFields.includes('last_name') ? (
          <>
            <Text className="mt-6 text-sm font-medium text-neutral-200">
              Last name
            </Text>
            <TextInput
              accessibilityLabel="Last name"
              autoCapitalize="words"
              autoCorrect={false}
              className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-4 text-base text-white"
              editable={!isBusy}
              onChangeText={handleSignUpFieldChange(setLastName)}
              placeholder="Last name"
              placeholderTextColor="#a3a3a3"
              textContentType="familyName"
              value={lastName}
            />
          </>
        ) : null}

        {showAdditionalSignUpForm &&
        missingSignUpFields.includes('username') ? (
          <>
            <Text className="mt-6 text-sm font-medium text-neutral-200">
              Username
            </Text>
            <TextInput
              accessibilityLabel="Username"
              autoCapitalize="none"
              autoCorrect={false}
              className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-4 text-base text-white"
              editable={!isBusy}
              onChangeText={handleSignUpFieldChange(setUsername)}
              placeholder="Username"
              placeholderTextColor="#a3a3a3"
              textContentType="username"
              value={username}
            />
          </>
        ) : null}

        {showAdditionalSignUpForm ? (
          <Pressable
            accessibilityRole="button"
            className={`mt-6 w-full items-center rounded-xl bg-violet-600 px-5 py-4 ${
              isBusy ? 'opacity-60' : ''
            }`}
            disabled={isBusy}
            onPress={() => void handleCompleteSignUp()}
          >
            <Text className="font-semibold text-white">
              {isBusy ? 'Creating account...' : 'Continue'}
            </Text>
          </Pressable>
        ) : null}

        {needsAdditionalSignUpInfo && hasUnsupportedSignUpFields ? (
          <Text className="mt-4 text-sm text-amber-300">
            Your account requires another detail or verification step that this
            screen does not support yet.
          </Text>
        ) : null}

        {needsUnsupportedStep ? (
          <Text className="mt-4 text-sm text-amber-300">
            This account requires a verification step that this screen does not
            support yet.
          </Text>
        ) : null}

        {errorMessage ? (
          <Text accessibilityRole="alert" className="mt-3 text-sm text-red-400">
            {errorMessage}
          </Text>
        ) : null}

        {statusMessage ? (
          <Text className="mt-3 text-sm text-emerald-400">{statusMessage}</Text>
        ) : null}

        {showPasswordForm ? (
          <Pressable
            accessibilityRole="button"
            className={`mt-6 w-full items-center rounded-xl bg-violet-600 px-5 py-4 ${
              isBusy ? 'opacity-60' : ''
            }`}
            disabled={isBusy}
            onPress={() => void handlePasswordSubmit()}
          >
            <Text className="font-semibold text-white">
              {isBusy
                ? authMode === 'sign-in'
                  ? 'Signing in...'
                  : 'Creating account...'
                : authMode === 'sign-in'
                  ? 'Sign in'
                  : 'Create account'}
            </Text>
          </Pressable>
        ) : null}

        {showCodeEntry ? (
          <>
            <Pressable
              accessibilityRole="button"
              className={`mt-6 w-full items-center rounded-xl bg-violet-600 px-5 py-4 ${
                isBusy || !code.trim() ? 'opacity-60' : ''
              }`}
              disabled={isBusy || !code.trim()}
              onPress={() => void handleVerifyCode()}
            >
              <Text className="font-semibold text-white">
                {isBusy ? 'Verifying code...' : 'Verify code'}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              className="mt-3 w-full items-center rounded-xl border border-neutral-700 px-5 py-4"
              disabled={isBusy}
              onPress={() => void handleResendCode()}
            >
              <Text className="font-semibold text-neutral-200">
                Send another code
              </Text>
            </Pressable>
          </>
        ) : null}

        {showPasswordForm ? (
          <Pressable
            accessibilityRole="button"
            className="mt-3 w-full items-center px-5 py-3"
            disabled={isBusy}
            onPress={() => void handleModeSwitch()}
          >
            <Text className="font-semibold text-neutral-300">
              {authMode === 'sign-in'
                ? 'Create an account'
                : 'Already have an account? Sign in'}
            </Text>
          </Pressable>
        ) : null}

        {showCodeEntry || needsAdditionalSignUpInfo || needsUnsupportedStep ? (
          <Pressable
            accessibilityRole="button"
            className="mt-3 w-full items-center px-5 py-3"
            disabled={isBusy}
            onPress={() => void handleStartOver()}
          >
            <Text className="font-semibold text-neutral-300">Start over</Text>
          </Pressable>
        ) : null}

        <View nativeID="clerk-captcha" />
      </View>
    </View>
  );
}
