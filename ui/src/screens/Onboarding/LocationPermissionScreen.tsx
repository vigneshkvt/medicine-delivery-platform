import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, HelperText } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { resolveCurrentLocation, LocationState } from '../../store/locationSlice';

interface Props extends NativeStackScreenProps<any> {}

const LocationPermissionScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const locationState = useAppSelector(state => state.location as LocationState);
  const [requesting, setRequesting] = React.useState(false);

  const handleEnableLocation = async () => {
    if (requesting) {
      return;
    }

    setRequesting(true);
    try {
      await dispatch(resolveCurrentLocation()).unwrap();
    } catch (error) {
      // handled via slice state
    } finally {
      setRequesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium">{t('onboarding.locationPermissionTitle')}</Text>
        <Text variant="bodyMedium" style={styles.description}>
          {t('onboarding.locationPermissionBody')}
        </Text>

        {locationState.error && <HelperText type="error">{t(locationState.error)}</HelperText>}
        {locationState.permission === 'denied' && !locationState.error && (
          <HelperText type="error">{t('onboarding.permissionDenied')}</HelperText>
        )}

        <Button mode="contained" onPress={handleEnableLocation} loading={!!requesting} style={styles.primaryAction}>
          {t('onboarding.enableLocation')}
        </Button>

        <Button mode="text" onPress={() => navigation.navigate('ManualLocation')}>
          {t('onboarding.chooseManually')}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24
  },
  content: {
    gap: 16
  },
  description: {
    color: '#455A64'
  },
  primaryAction: {
    marginTop: 16
  }
});

export default LocationPermissionScreen;
