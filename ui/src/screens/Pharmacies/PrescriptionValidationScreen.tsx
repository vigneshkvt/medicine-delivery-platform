import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, Snackbar, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchManagedPharmacies, PharmacyState, selectPharmacy } from '../../store/pharmacySlice';
import { fetchPharmacyOrders, OrdersState, submitPrescriptionReview } from '../../store/ordersSlice';

const PrescriptionValidationScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const pharmacyState = useAppSelector(state => state.pharmacy as PharmacyState);
  const ordersState = useAppSelector(state => state.orders as OrdersState);

  const activePharmacies = useMemo(
    () => pharmacyState.managed.filter(pharmacy => pharmacy.status === 'Active'),
    [pharmacyState.managed]
  );

  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchManagedPharmacies());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedPharmacyId && activePharmacies.length > 0) {
      const first = activePharmacies[0];
      setSelectedPharmacyId(first.id);
      dispatch(selectPharmacy(first.id));
    }
  }, [dispatch, activePharmacies, selectedPharmacyId]);

  useEffect(() => {
    if (selectedPharmacyId) {
      dispatch(fetchPharmacyOrders({ pharmacyId: selectedPharmacyId }));
    }
  }, [dispatch, selectedPharmacyId]);

  useFocusEffect(
    useCallback(() => {
      if (!selectedPharmacyId) {
        return undefined;
      }
      dispatch(fetchPharmacyOrders({ pharmacyId: selectedPharmacyId }));
      const intervalId = setInterval(() => {
        dispatch(fetchPharmacyOrders({ pharmacyId: selectedPharmacyId }));
      }, 15000);
      return () => clearInterval(intervalId);
    }, [dispatch, selectedPharmacyId])
  );

  const showSnackbar = (key: string | null) => {
    if (!key) {
      setSnackbarMessage(null);
      return;
    }
    setSnackbarMessage(key);
  };

  const handleReview = async (orderId: string, status: 'Approved' | 'Rejected') => {
    if (!selectedPharmacyId) {
      return;
    }
    try {
      await dispatch(submitPrescriptionReview({ orderId, pharmacyId: selectedPharmacyId, status })).unwrap();
      showSnackbar('orders.prescriptionUpdateConfirmation');
    } catch (error) {
      showSnackbar('errors.unknown');
    }
  };

  const pendingReviews = useMemo(() => {
    if (!selectedPharmacyId) {
      return [];
    }

    const orders = ordersState.pharmacyOrders[selectedPharmacyId] ?? [];
    return orders.filter(order => !!order.prescriptionFileName && (order.prescriptionStatus ?? 'Pending') !== 'Approved');
  }, [ordersState.pharmacyOrders, selectedPharmacyId]);

  return (
    <View style={styles.container}>
      {activePharmacies.length === 0 ? (
        <View style={styles.empty}> 
          <Text>{t('pharmacies.noManagedPharmacy')}</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={activePharmacies}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            style={styles.pharmacySelector}
            renderItem={({ item }) => (
              <Chip
                style={styles.pharmacyChip}
                selected={item.id === selectedPharmacyId}
                onPress={() => {
                  setSelectedPharmacyId(item.id);
                  dispatch(selectPharmacy(item.id));
                }}
              >
                {item.name}
              </Chip>
            )}
          />

          {ordersState.loading && pendingReviews.length === 0 ? (
            <View style={styles.loader}>
              <ActivityIndicator animating />
            </View>
          ) : (
            <FlatList
              data={pendingReviews}
              keyExtractor={item => item.orderId}
              contentContainerStyle={pendingReviews.length === 0 ? styles.emptyList : styles.list}
              ListEmptyComponent={() => (
                <View style={styles.empty}> 
                  <Text>{t('pharmacies.noPendingValidations')}</Text>
                </View>
              )}
              renderItem={({ item }) => (
                <Card style={styles.card}>
                  <Card.Title title={`#${item.orderNumber}`} subtitle={item.customerEmail} />
                  <Card.Content>
                    <Text>{t('pharmacies.prescriptionUploaded')}</Text>
                    <View style={styles.chipRow}>
                      <Chip icon="file-outline">{item.prescriptionFileName}</Chip>
                      <Chip icon="clipboard-check-outline">{t(`orders.status.${(item.prescriptionStatus ?? 'Pending').toLowerCase()}`, { defaultValue: item.prescriptionStatus ?? 'Pending' })}</Chip>
                    </View>
                    <View style={styles.items}>
                      {item.items.map(orderItem => (
                        <Text key={orderItem.medicineId} variant="bodySmall">
                          {orderItem.medicineName} x {orderItem.quantity}
                        </Text>
                      ))}
                    </View>
                  </Card.Content>
                  <Card.Actions>
                    <Button
                      mode="contained"
                      onPress={() => handleReview(item.orderId, 'Approved')}
                    >
                      {t('pharmacies.approvePrescription')}
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => handleReview(item.orderId, 'Rejected')}
                    >
                      {t('pharmacies.rejectPrescription')}
                    </Button>
                  </Card.Actions>
                </Card>
              )}
            />
          )}
          <Snackbar
            visible={!!snackbarMessage}
            onDismiss={() => showSnackbar(null)}
            duration={3000}
          >
            {snackbarMessage ? t(snackbarMessage) : ''}
          </Snackbar>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  pharmacySelector: {
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  pharmacyChip: {
    marginRight: 8
  },
  empty: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 16
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  list: {
    padding: 16,
    gap: 12
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center'
  },
  card: {
    marginBottom: 12
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8
  },
  items: {
    marginTop: 8,
    gap: 4
  }
});

export default PrescriptionValidationScreen;
