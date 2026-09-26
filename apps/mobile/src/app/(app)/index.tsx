import { useAuth } from '@clerk/expo';
import * as Device from 'expo-device';
import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchCurrentUser } from '@/api/current-user';
import { AnimatedIcon } from '@/components/animated-icon';
import { HintRow } from '@/components/hint-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

type ApiConnectionState =
  | { status: 'checking' }
  | { status: 'connected' }
  | { status: 'error'; message: string };

function getDevMenuHint() {
  if (Platform.OS === 'web') {
    return <ThemedText type="small">use browser devtools</ThemedText>;
  }

  if (Device.isDevice) {
    return (
      <ThemedText type="small">
        shake device or press <ThemedText type="code">m</ThemedText> in terminal
      </ThemedText>
    );
  }

  const shortcut = Platform.OS === 'android' ? 'cmd+m (or ctrl+m)' : 'cmd+d';

  return (
    <ThemedText type="small">
      press <ThemedText type="code">{shortcut}</ThemedText>
    </ThemedText>
  );
}

export default function HomeScreen() {
  const { getToken, isLoaded, isSignedIn, sessionId } = useAuth();
  const getTokenRef = useRef(getToken);
  const [apiConnection, setApiConnection] = useState<ApiConnectionState>({
    status: 'checking',
  });

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  useEffect(() => {
    let isCurrent = true;

    if (!isLoaded || !isSignedIn || !sessionId) {
      setApiConnection({ status: 'checking' });

      return () => {
        isCurrent = false;
      };
    }

    setApiConnection({ status: 'checking' });

    void fetchCurrentUser({
      apiBaseUrl: process.env.EXPO_PUBLIC_API_URL,
      getToken: () => getTokenRef.current(),
    })
      .then(() => {
        if (isCurrent) {
          setApiConnection({ status: 'connected' });
        }
      })
      .catch((error: unknown) => {
        if (!isCurrent) {
          return;
        }

        setApiConnection({
          status: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Could not verify your session with the API.',
        });
      });

    return () => {
      isCurrent = false;
    };
  }, [isLoaded, isSignedIn, sessionId]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <AnimatedIcon />
          <ThemedText type="title" style={styles.title}>
            Welcome to Tinta
          </ThemedText>
        </ThemedView>

        <ThemedText type="code" style={styles.code}>
          get started
        </ThemedText>

        <View className="self-stretch rounded-xl bg-violet-700 px-5 py-4">
          <Text className="text-base font-semibold text-white">
            {apiConnection.status === 'connected'
              ? 'API session verified'
              : 'API connection'}
          </Text>
          <Text className="mt-1 text-white">
            {apiConnection.status === 'checking'
              ? 'Checking your signed-in session with the API...'
              : apiConnection.status === 'connected'
                ? 'The API confirmed your Clerk session.'
                : apiConnection.message}
          </Text>
        </View>

        <ThemedView type="backgroundElement" style={styles.stepContainer}>
          <HintRow
            title="Try editing"
            hint={<ThemedText type="code">src/app/(app)/index.tsx</ThemedText>}
          />
          <HintRow title="Dev tools" hint={getDevMenuHint()} />
          <HintRow
            title="Fresh start"
            hint={<ThemedText type="code">npm run reset-project</ThemedText>}
          />
        </ThemedView>

        {Platform.OS === 'web' && <WebBadge />}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    textAlign: 'center',
  },
  code: {
    textTransform: 'uppercase',
  },
  stepContainer: {
    gap: Spacing.three,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
});
