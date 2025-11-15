import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as PaperProvider, ActivityIndicator } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { store } from './src/store';
import { theme } from './src/theme';
import i18n from './src/localization';
import { useAppDispatch } from './src/store/hooks';
import { hydrateAuth } from './src/store/authSlice';
import { getAccessToken, getSessionMetadata } from './src/utils/storage';

const Bootstrapper: React.FC = () => {
  const dispatch = useAppDispatch();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const bootstrap = async () => {
      try {
        const [token, session] = await Promise.all([getAccessToken(), getSessionMetadata()]);
        if (token && session) {
          dispatch(hydrateAuth({ token, role: session.role, preferredLanguage: session.preferredLanguage }));
          i18n.changeLanguage(session.preferredLanguage).catch(() => undefined);
        }
      } finally {
        setReady(true);
      }
    };

    bootstrap();
  }, [dispatch]);

  if (!ready) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  }

  return <AppNavigator />;
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReduxProvider store={store}>
        <PaperProvider theme={theme}>
          <SafeAreaProvider>
            <StatusBar style="dark" />
            <Bootstrapper />
          </SafeAreaProvider>
        </PaperProvider>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
