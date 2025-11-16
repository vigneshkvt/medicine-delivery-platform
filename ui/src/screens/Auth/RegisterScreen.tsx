import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, TextInput, HelperText, SegmentedButtons, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { registerUser, AuthState } from '../../store/authSlice';

interface Props extends NativeStackScreenProps<any> {}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.auth as AuthState);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'ta'>('en');
  const [role, setRole] = useState<'Customer' | 'Pharmacist'>('Customer');

  const onSubmit = () => {
    if (!email || !password || !firstName || !lastName) {
      return;
    }
    dispatch(registerUser({ email, password, firstName, lastName, preferredLanguage, role }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.form}>
        <SegmentedButtons
          value={role}
          onValueChange={value => setRole(value as 'Customer' | 'Pharmacist')}
          buttons={[
            { value: 'Customer', label: t('auth.customer') },
            { value: 'Pharmacist', label: t('auth.pharmacist') }
          ]}
          style={styles.segment}
        />
        {role === 'Pharmacist' ? (
          <Text style={styles.helper}>{t('auth.pharmacistSignupHint')}</Text>
        ) : null}
        <TextInput label={t('auth.firstName')} value={firstName} onChangeText={setFirstName} style={styles.input} />
        <TextInput label={t('auth.lastName')} value={lastName} onChangeText={setLastName} style={styles.input} />
        <TextInput
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <SegmentedButtons
          value={preferredLanguage}
          onValueChange={value => setPreferredLanguage(value as 'en' | 'ta')}
          buttons={[
            { value: 'en', label: t('common.english') },
            { value: 'ta', label: t('common.tamil') }
          ]}
          style={styles.segment}
        />

        {error && <HelperText type="error">{t(error)}</HelperText>}

        <Button mode="contained" onPress={onSubmit} loading={loading} style={styles.submit}>
          {t('auth.register')}
        </Button>

        <Button onPress={() => navigation.navigate('Login')}>{t('auth.loginInstead')}</Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24
  },
  form: {
    gap: 12
  },
  input: {
    backgroundColor: 'white'
  },
  segment: {
    marginTop: 12
  },
  helper: {
    marginTop: 4,
    color: '#455A64'
  },
  submit: {
    marginTop: 8
  }
});

export default RegisterScreen;
