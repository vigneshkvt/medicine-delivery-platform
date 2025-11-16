import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, HelperText, IconButton, Modal, Portal, Text, TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import MapView, { MapPressEvent, Marker, MarkerDragStartEndEvent } from 'react-native-maps';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchManagedPharmacies, PharmacyState, submitPharmacyProfile } from '../../store/pharmacySlice';

const FALLBACK_COORDINATE = { latitude: 13.0827, longitude: 80.2707 };

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
  const [mapVisible, setMapVisible] = useState(false);
  const [mapCoordinate, setMapCoordinate] = useState<{ latitude: number; longitude: number } | null>(null);
  const mapRef = useRef<MapView | null>(null);

  const formatCoordinate = (value: number) => (Number.isFinite(value) ? value.toFixed(6) : '');

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
    setLatitude(formatCoordinate(managedPharmacy.latitude));
    setLongitude(formatCoordinate(managedPharmacy.longitude));
    setContactNumber(managedPharmacy.contactNumber);
    setEmail(managedPharmacy.email);
    setTaxId('');
  }, [managedPharmacy]);

  const resolveExistingCoordinate = () => {
    const lat = Number(latitude);
    const lon = Number(longitude);
    if (latitude && longitude && Number.isFinite(lat) && Number.isFinite(lon)) {
      return { latitude: lat, longitude: lon };
    }

    if (managedPharmacy) {
      return { latitude: managedPharmacy.latitude, longitude: managedPharmacy.longitude };
    }

    return FALLBACK_COORDINATE;
  };

  const openLocationPicker = () => {
    const current = resolveExistingCoordinate();
    setMapCoordinate({ ...current });
    setMapVisible(true);
  };

  const animateToCoordinate = (coordinate: { latitude: number; longitude: number }) => {
    mapRef.current?.animateToRegion(
      {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      },
      200
    );
  };

  const handleMapInteraction = (coordinate: { latitude: number; longitude: number }) => {
    setMapCoordinate(coordinate);
    animateToCoordinate(coordinate);
  };

  const handleMapPress = (event: MapPressEvent) => {
    handleMapInteraction(event.nativeEvent.coordinate);
  };

  const handleMarkerDragEnd = (event: MarkerDragStartEndEvent) => {
    handleMapInteraction(event.nativeEvent.coordinate);
  };

  const confirmMapSelection = () => {
    if (!mapCoordinate) {
      return;
    }
    setLatitude(formatCoordinate(mapCoordinate.latitude));
    setLongitude(formatCoordinate(mapCoordinate.longitude));
    setMapVisible(false);
  };

  useEffect(() => {
    if (!mapVisible || !mapCoordinate) {
      return;
    }

    const timeout = setTimeout(() => {
      animateToCoordinate(mapCoordinate);
    }, 200);

    return () => clearTimeout(timeout);
  }, [mapVisible, mapCoordinate]);

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
        <Button mode="outlined" icon="map-marker" onPress={openLocationPicker} style={styles.mapButton}>
          {t('pharmacies.selectOnMap')}
        </Button>
        <HelperText type="info">{t('pharmacies.mapInstructions')}</HelperText>
        <TextInput
          label={t('pharmacies.latitude')}
          value={latitude}
          style={styles.input}
          editable={false}
          right={<TextInput.Affix text="°" />}
        />
        <TextInput
          label={t('pharmacies.longitude')}
          value={longitude}
          style={styles.input}
          editable={false}
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

      <Portal>
        <Modal visible={mapVisible} onDismiss={() => setMapVisible(false)} contentContainerStyle={styles.mapModal}>
          <View style={styles.mapHeader}>
            <Text variant="titleMedium">{t('pharmacies.selectOnMap')}</Text>
            <IconButton icon="close" onPress={() => setMapVisible(false)} accessibilityLabel={t('common.close')} />
          </View>
          <View style={styles.mapWrapper}>
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                latitude: (mapCoordinate ?? resolveExistingCoordinate()).latitude,
                longitude: (mapCoordinate ?? resolveExistingCoordinate()).longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01
              }}
              onPress={handleMapPress}
            >
              {mapCoordinate ? <Marker coordinate={mapCoordinate} draggable onDragEnd={handleMarkerDragEnd} /> : null}
            </MapView>
          </View>
          <View style={styles.mapActions}>
            <Text style={styles.mapHint}>{t('pharmacies.mapInstructions')}</Text>
            <Button mode="contained" onPress={confirmMapSelection} disabled={!mapCoordinate}>
              {t('pharmacies.useThisLocation')}
            </Button>
          </View>
        </Modal>
      </Portal>
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
  },
  mapButton: {
    alignSelf: 'flex-start'
  },
  mapModal: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    gap: 12
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  mapWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%'
  },
  map: {
    height: 260,
    width: '100%'
  },
  mapActions: {
    gap: 12,
    alignItems: 'flex-start'
  },
  mapHint: {
    color: '#455A64'
  }
});

export default PharmacyProfileScreen;
