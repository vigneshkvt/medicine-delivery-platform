import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, SegmentedButtons, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import i18n from '../../localization';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout, AuthState } from '../../store/authSlice';

const SettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const auth = useAppSelector(state => state.auth as AuthState);
  const [language, setLanguage] = useState<'en' | 'ta'>(auth.preferredLanguage);

  const onLanguageChange = (value: string) => {
    const lang = value as 'en' | 'ta';
    setLanguage(lang);
    i18n.changeLanguage(lang).catch(() => undefined);
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">{t('common.language')}</Text>
      <SegmentedButtons
        value={language}
        onValueChange={onLanguageChange}
        buttons={[
          { value: 'en', label: t('common.english') },
          { value: 'ta', label: t('common.tamil') }
        ]}
      />

      <View style={styles.section}>
        <Text variant="titleMedium">Role: {auth.role ?? 'Guest'}</Text>
      </View>

      <Button mode="outlined" onPress={() => dispatch(logout())}>
        {t('common.logout')}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16
  },
  section: {
    marginTop: 24
  }
});

export default SettingsScreen;
