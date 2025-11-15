import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, TextInput, Text, HelperText } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginUser, AuthState } from '../../store/authSlice';

interface Props extends NativeStackScreenProps<any> {}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.auth as AuthState);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = () => {
    if (!email || !password) {
      return;
    }
    dispatch(loginUser({ email, password }));
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('auth.welcome')}</Text>
        <Text style={styles.subtitle}>{t('auth.subtitle')}</Text>

        <TextInput
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />

        {error && <HelperText type="error">{t(error)}</HelperText>}

        <Button mode="contained" onPress={onSubmit} loading={!!loading} style={styles.submit}>
          {t('auth.login')}
        </Button>

        <Button onPress={() => navigation.navigate('Register')}>
          {t('auth.createAccount')}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24
  },
  content: {
    gap: 12
  },
  title: {
    fontSize: 28,
    fontWeight: '700'
  },
  subtitle: {
    fontSize: 16,
    color: '#616161'
  },
  input: {
    backgroundColor: 'white'
  },
  submit: {
    marginTop: 8
  }
});

export default LoginScreen;
