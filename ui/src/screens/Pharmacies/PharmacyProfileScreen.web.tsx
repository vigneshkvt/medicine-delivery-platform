import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, HelperText, Text, TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchManagedPharmacies, PharmacyState, submitPharmacyProfile } from '../../store/pharmacySlice';

const PharmacyProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const pharmacyState = useAppSelector(state => state.pharmacy as PharmacyState);

  const managedPharmacy = useMemo(() => pharmacyState.managed[0] ?? null, [pharmacyState.managed]);
  const awaitingApproval = managedPharmacy ? managedPharmacy.status !== 'Active' : false;

  const [tenantName, setTenantName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [pharmacyName, setPharmacyName] = useState('');
  const [description, setDescription] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [country, setCountry] = useState('India');
  const [postalCode, setPostalCode] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    dispatch(fetchManagedPharmacies());
  }, [dispatch]);

  useEffect(() => {
    if (!managedPharmacy) {
      return;
    }

    setTenantName(managedPharmacy.name);
    setLegalName(managedPharmacy.description ?? managedPharmacy.name);
    setPharmacyName(managedPharmacy.name);
    setDescription(managedPharmacy.description ?? '');
    setLine1(managedPharmacy.addressLine1);
    setLine2(managedPharmacy.addressLine2 ?? '');
    setCity(managedPharmacy.city);
    setStateName(managedPharmacy.state);
    setCountry(managedPharmacy.country);
    setPostalCode(managedPharmacy.postalCode);
    setLatitude(String(managedPharmacy.latitude));
    setLongitude(String(managedPharmacy.longitude));
    setContactNumber(managedPharmacy.contactNumber);
    setEmail(managedPharmacy.email);
    setTaxId('');
  }, [managedPharmacy]);

  const onSubmit = () => {
    const lat = Number(latitude);
    const lon = Number(longitude);

    if (!tenantName || !legalName || !pharmacyName || !line1 || !city || !stateName || !country || !postalCode || !contactNumber || !email || Number.isNaN(lat) || Number.isNaN(lon)) {
      Alert.alert(t('errors.unknown'), t('pharmacies.profileIncomplete'));
      return;
    }

    dispatch(
      submitPharmacyProfile({
        tenantName,
        legalName,
        taxRegistrationNumber: taxId,
        pharmacyName,
        description: description || undefined,
        line1,
        line2: line2 || undefined,
        city,
        state: stateName,
        country,
        postalCode,
        latitude: lat,
        longitude: lon,
        contactNumber,
        email
      })
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {managedPharmacy ? (
        <Card style={styles.summaryCard}>
          <Card.Title title={managedPharmacy.name} subtitle={managedPharmacy.city} />
          <Card.Content>
            <Text>{managedPharmacy.addressLine1}</Text>
            {managedPharmacy.addressLine2 ? <Text>{managedPharmacy.addressLine2}</Text> : null}
            <Text>
              {managedPharmacy.city}, {managedPharmacy.state} - {managedPharmacy.postalCode}
            </Text>
            <Text>{managedPharmacy.contactNumber}</Text>
            <Text>{managedPharmacy.email}</Text>
            <HelperText type="info">
              {awaitingApproval ? t('pharmacies.pendingApproval') : t('pharmacies.profileExists')}
            </HelperText>
          </Card.Content>
        </Card>
      ) : (
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text>{t('pharmacies.profileIntro')}</Text>
          </Card.Content>
        </Card>
      )}

      <View style={styles.form}>
        <TextInput label={t('pharmacies.tenantName')} value={tenantName} onChangeText={setTenantName} style={styles.input} />
        <TextInput label={t('pharmacies.legalName')} value={legalName} onChangeText={setLegalName} style={styles.input} />
        <TextInput label={t('pharmacies.taxId')} value={taxId} onChangeText={setTaxId} style={styles.input} />
        <TextInput label={t('pharmacies.pharmacyName')} value={pharmacyName} onChangeText={setPharmacyName} style={styles.input} />
        <TextInput label={t('pharmacies.description')} value={description} onChangeText={setDescription} style={styles.input} multiline />
        <TextInput label={t('pharmacies.addressLine1')} value={line1} onChangeText={setLine1} style={styles.input} />
        <TextInput label={t('pharmacies.addressLine2')} value={line2} onChangeText={setLine2} style={styles.input} />
        <TextInput label={t('pharmacies.city')} value={city} onChangeText={setCity} style={styles.input} />
        <TextInput label={t('pharmacies.state')} value={stateName} onChangeText={setStateName} style={styles.input} />
        <TextInput label={t('pharmacies.country')} value={country} onChangeText={setCountry} style={styles.input} />
        <TextInput label={t('pharmacies.postalCode')} value={postalCode} onChangeText={setPostalCode} style={styles.input} />
        <HelperText type="info">{t('pharmacies.mapNotSupported')}</HelperText>
        <TextInput
          label={t('pharmacies.latitude')}
          value={latitude}
          onChangeText={setLatitude}
          style={styles.input}
          keyboardType="decimal-pad"
          right={<TextInput.Affix text="°" />}
        />
        <TextInput
          label={t('pharmacies.longitude')}
          value={longitude}
          onChangeText={setLongitude}
          style={styles.input}
          keyboardType="decimal-pad"
          right={<TextInput.Affix text="°" />}
        />
        <TextInput label={t('pharmacies.contactNumber')} value={contactNumber} onChangeText={setContactNumber} style={styles.input} keyboardType="phone-pad" />
        <TextInput label={t('pharmacies.email')} value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />

        {pharmacyState.onboarding.error && <HelperText type="error">{t(pharmacyState.onboarding.error)}</HelperText>}
        {pharmacyState.onboarding.lastPharmacyId && <HelperText type="info">{t('pharmacies.profileSaved')}</HelperText>}

        <Button
          mode="contained"
          onPress={onSubmit}
          loading={pharmacyState.onboarding.submitting}
          disabled={pharmacyState.onboarding.submitting}
        >
          {managedPharmacy ? t('pharmacies.updateProfile') : t('pharmacies.submitProfile')}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16
  },
  summaryCard: {
    marginBottom: 12
  },
  infoCard: {
    marginBottom: 12
  },
  form: {
    gap: 12
  },
  input: {
    backgroundColor: 'white'
  }
});

export default PharmacyProfileScreen;
