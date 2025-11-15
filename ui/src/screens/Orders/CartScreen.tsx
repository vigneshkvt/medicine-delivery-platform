import React, { useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Text, IconButton, Button, TextInput, HelperText, SegmentedButtons } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { calculateTotals, CartState, updateQuantity, removeItem, setPrescription, setPaymentMethod, placeOrder } from '../../store/cartSlice';
import { LocationState } from '../../store/locationSlice';

const CartScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const cart = useAppSelector(state => state.cart as CartState);
  const locationState = useAppSelector(state => state.location as LocationState);

  const [deliveryLine1, setDeliveryLine1] = useState('');
  const [deliveryLine2, setDeliveryLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const totals = useMemo(() => calculateTotals(cart), [cart]);

  const onPickPrescription = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false });
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
      Alert.alert(t('errors.unknown'), t('pharmacies.noResults'));
      return;
    }

    if (!deliveryLine1 || !city || !stateName || !country || !postalCode) {
      Alert.alert(t('errors.unknown'), t('errors.invalidAddress'));
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

  return (
    <View style={styles.container}>
      <FlatList
        data={cart.items}
        keyExtractor={item => item.medicineId}
        ListEmptyComponent={() => (
          <View style={styles.empty}> 
            <Text>{t('cart.empty')}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Title title={item.name} subtitle={`${item.currency} ${item.price.toFixed(2)}`} />
            <Card.Content>
              <View style={styles.row}>
                <IconButton icon="minus" onPress={() => dispatch(updateQuantity({ medicineId: item.medicineId, quantity: item.quantity - 1 }))} />
                <Text style={styles.quantity}>{item.quantity}</Text>
                <IconButton icon="plus" onPress={() => dispatch(updateQuantity({ medicineId: item.medicineId, quantity: item.quantity + 1 }))} />
                <IconButton icon="delete" onPress={() => dispatch(removeItem(item.medicineId))} />
              </View>
            </Card.Content>
          </Card>
        )}
      />

      <View style={styles.summary}>
        <Text variant="titleMedium">{totals.formattedSubtotal}</Text>
        <Text variant="bodySmall">{t('cart.delivery')}: {totals.formattedDelivery}</Text>
        <Text variant="titleLarge">{totals.formattedTotal}</Text>

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

        <TextInput label={t('cart.addressLine1')} value={deliveryLine1} onChangeText={setDeliveryLine1} style={styles.input} />
        <TextInput label={t('cart.addressLine2')} value={deliveryLine2} onChangeText={setDeliveryLine2} style={styles.input} />
        <TextInput label={t('cart.city')} value={city} onChangeText={setCity} style={styles.input} />
        <TextInput label={t('cart.state')} value={stateName} onChangeText={setStateName} style={styles.input} />
        <TextInput label={t('cart.country')} value={country} onChangeText={setCountry} style={styles.input} />
        <TextInput label={t('cart.postalCode')} value={postalCode} onChangeText={setPostalCode} style={styles.input} />

        {cart.error && <HelperText type="error">{t(cart.error)}</HelperText>}
        {cart.lastOrder && <HelperText type="info">{t('cart.success')}</HelperText>}

        <Button mode="contained" onPress={onPlaceOrder} loading={!!cart.placingOrder} disabled={cart.items.length === 0}>
          {t('cart.placeOrder')}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  card: {
    marginBottom: 12
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  quantity: {
    fontSize: 16,
    fontWeight: '700'
  },
  summary: {
    gap: 12,
    marginTop: 12
  },
  empty: {
    alignItems: 'center',
    padding: 24
  },
  segment: {
    marginTop: 8
  },
  input: {
    backgroundColor: 'white'
  }
});

export default CartScreen;
