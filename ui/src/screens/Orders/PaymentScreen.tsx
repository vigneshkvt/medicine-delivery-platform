import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Dialog, HelperText, List, Portal, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  CartState,
  calculateTotals,
  placeOrder,
  setPaymentMethod,
  setPharmacy as setCartPharmacy,
  setPrescription
} from '../../store/cartSlice';
import { LocationState } from '../../store/locationSlice';
import { fetchNearbyPharmacies, PharmacyState, selectPharmacy } from '../../store/pharmacySlice';

const PaymentScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const cart = useAppSelector(state => state.cart as CartState);
  const locationState = useAppSelector(state => state.location as LocationState);
  const pharmacyState = useAppSelector(state => state.pharmacy as PharmacyState);

  const [deliveryLine1, setDeliveryLine1] = useState('');
  const [deliveryLine2, setDeliveryLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [pharmacyDialogVisible, setPharmacyDialogVisible] = useState(false);

  const totals = useMemo(() => calculateTotals(cart), [cart]);
  const requiresPrescription = useMemo(() => cart.items.some(item => item.requiresPrescription), [cart.items]);

  const selectedPharmacy = useMemo(() => {
    if (!cart.pharmacyId) {
      return null;
    }

    return (
      pharmacyState.nearby.find(p => p.id === cart.pharmacyId) ??
      pharmacyState.managed.find(p => p.id === cart.pharmacyId) ??
      null
    );
  }, [cart.pharmacyId, pharmacyState.managed, pharmacyState.nearby]);

  useEffect(() => {
    if (
      locationState.selectedLocation &&
      pharmacyState.nearby.length === 0 &&
      !pharmacyState.loading
    ) {
      dispatch(
        fetchNearbyPharmacies({
          latitude: locationState.selectedLocation.latitude,
          longitude: locationState.selectedLocation.longitude,
          radiusInKm: 5
        })
      );
    }
  }, [dispatch, locationState.selectedLocation, pharmacyState.loading, pharmacyState.nearby.length]);

  const onPickPrescription = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      dispatch(
        setPrescription({
          uri: asset.uri,
          name: asset.fileName ?? 'prescription.jpg',
          type: asset.mimeType ?? 'image/jpeg'
        })
      );
    }
  };

  const onPlaceOrder = () => {
    if (!cart.pharmacyId) {
      Alert.alert(t('cart.selectPharmacyTitle'), t('cart.selectPharmacyPrompt'));
      return;
    }

    if (!deliveryLine1 || !city || !stateName || !country || !postalCode) {
      Alert.alert(t('errors.unknown'), t('errors.invalidAddress'));
      return;
    }

    if (requiresPrescription && !cart.prescription) {
      Alert.alert(t('cart.prescriptionRequiredTitle'), t('cart.prescriptionRequiredMessage'));
      return;
    }

    const latitude = locationState.selectedLocation?.latitude ?? 0;
    const longitude = locationState.selectedLocation?.longitude ?? 0;

    dispatch(
      placeOrder({
        pharmacyId: cart.pharmacyId,
        deliveryLine1,
        deliveryLine2,
        city,
        state: stateName,
        country,
        postalCode,
        latitude,
        longitude
      })
    );
  };

  if (cart.items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text>{t('cart.empty')}</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium">{t('payment.summaryTitle')}</Text>
            <Text variant="bodyMedium">{t('payment.totalItems', { count: cart.items.length })}</Text>
            <Text variant="titleLarge" style={styles.total}>{totals.formattedTotal}</Text>
          </Card.Content>
        </Card>

        <Card style={styles.pharmacyCard}>
          <Card.Content>
            <View style={styles.pharmacyHeader}>
              <Text variant="titleMedium">{t('cart.selectedPharmacy')}</Text>
              <Button onPress={() => setPharmacyDialogVisible(true)}>
                {selectedPharmacy ? t('cart.changePharmacy') : t('cart.choosePharmacy')}
              </Button>
            </View>
            {selectedPharmacy ? (
              <View style={styles.pharmacyDetails}>
                <Text>{selectedPharmacy.name}</Text>
                <Text>{selectedPharmacy.addressLine1}</Text>
                {selectedPharmacy.addressLine2 ? <Text>{selectedPharmacy.addressLine2}</Text> : null}
                <Text>
                  {selectedPharmacy.city}, {selectedPharmacy.state} - {selectedPharmacy.postalCode}
                </Text>
                <Text>{selectedPharmacy.contactNumber}</Text>
              </View>
            ) : (
              <Text style={styles.noPharmacy}>{t('cart.noPharmacySelected')}</Text>
            )}
            {pharmacyState.loading && (
              <View style={styles.loaderRow}>
                <ActivityIndicator animating size="small" />
                <Text>{t('cart.loadingPharmacies')}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        <SegmentedButtons
          value={cart.paymentMethod}
          onValueChange={value => dispatch(setPaymentMethod(value as 'CashOnDelivery' | 'Online'))}
          buttons={[
            { value: 'CashOnDelivery', label: t('cart.cod') },
            { value: 'Online', label: t('cart.onlineInactive'), disabled: true }
          ]}
          style={styles.segment}
        />

        <Button mode="outlined" onPress={onPickPrescription}>
          {cart.prescription ? cart.prescription.name : t('cart.uploadPrescription')}
        </Button>
        {requiresPrescription && !cart.prescription && (
          <HelperText type="error">{t('cart.prescriptionRequiredHelper')}</HelperText>
        )}

        <TextInput label={t('cart.addressLine1')} value={deliveryLine1} onChangeText={setDeliveryLine1} style={styles.input} />
        <TextInput label={t('cart.addressLine2')} value={deliveryLine2} onChangeText={setDeliveryLine2} style={styles.input} />
        <TextInput label={t('cart.city')} value={city} onChangeText={setCity} style={styles.input} />
        <TextInput label={t('cart.state')} value={stateName} onChangeText={setStateName} style={styles.input} />
        <TextInput label={t('cart.country')} value={country} onChangeText={setCountry} style={styles.input} />
        <TextInput label={t('cart.postalCode')} value={postalCode} onChangeText={setPostalCode} style={styles.input} />

        {cart.error && <HelperText type="error">{t(cart.error)}</HelperText>}
        {cart.lastOrder && <HelperText type="info">{t('cart.success')}</HelperText>}

        <Button
          mode="contained"
          onPress={onPlaceOrder}
          loading={!!cart.placingOrder}
          disabled={cart.items.length === 0}
        >
          {t('payment.proceed')}
        </Button>
      </ScrollView>

      <Portal>
        <Dialog visible={pharmacyDialogVisible} onDismiss={() => setPharmacyDialogVisible(false)}>
          <Dialog.Title>{t('cart.choosePharmacyTitle')}</Dialog.Title>
          <Dialog.Content>
            {pharmacyState.nearby.length === 0 && !pharmacyState.loading ? (
              <Text>{t('cart.noNearbyPharmacies')}</Text>
            ) : (
              <FlatList
                data={pharmacyState.nearby}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <List.Item
                    title={item.name}
                    description={`${item.city}, ${item.state}`}
                    right={props => (cart.pharmacyId === item.id ? <List.Icon {...props} icon="check" /> : null)}
                    onPress={() => {
                      dispatch(setCartPharmacy(item.id));
                      dispatch(selectPharmacy(item.id));
                      setPharmacyDialogVisible(false);
                    }}
                  />
                )}
              />
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPharmacyDialogVisible(false)}>{t('common.close')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#F4F6F6'
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 32
  },
  summaryCard: {
    marginBottom: 8
  },
  total: {
    marginTop: 4
  },
  pharmacyCard: {
    marginBottom: 8
  },
  pharmacyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  pharmacyDetails: {
    marginTop: 8,
    gap: 2
  },
  noPharmacy: {
    marginTop: 8,
    color: '#546E7A'
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8
  },
  segment: {
    marginTop: 8
  },
  input: {
    backgroundColor: 'white'
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default PaymentScreen;
