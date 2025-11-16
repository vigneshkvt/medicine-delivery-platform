import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, ActivityIndicator, Button, Menu, Chip, Snackbar } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchManagedPharmacies, PharmacyState, selectPharmacy } from '../../store/pharmacySlice';
import { fetchPharmacyOrders, changeOrderStatus, submitPrescriptionReview, OrdersState } from '../../store/ordersSlice';

const statusOptions = ['Approved', 'Preparing', 'ReadyForDelivery', 'OutForDelivery', 'Completed', 'Cancelled', 'Rejected'];
const prescriptionStatuses = ['Approved', 'Rejected'];

const statusKey = (status: string) => status.charAt(0).toLowerCase() + status.slice(1);

const PharmacyOrdersScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const pharmacyState = useAppSelector(state => state.pharmacy as PharmacyState);
  const ordersState = useAppSelector(state => state.orders as OrdersState);

  const activePharmacies = useMemo(
    () => pharmacyState.managed.filter(pharmacy => pharmacy.status === 'Active'),
    [pharmacyState.managed]
  );

  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string | null>(null);
  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);
  const [openPrescriptionMenu, setOpenPrescriptionMenu] = useState<string | null>(null);
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
  }, [activePharmacies, selectedPharmacyId, dispatch]);

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

  const handleStatusChange = async (orderId: string, status: string) => {
    if (!selectedPharmacyId) {
      return;
    }
    try {
      await dispatch(changeOrderStatus({ orderId, pharmacyId: selectedPharmacyId, status })).unwrap();
      showSnackbar('orders.statusUpdateConfirmation');
    } catch (error) {
      showSnackbar('errors.unknown');
    }
  };

  const handlePrescriptionReview = async (orderId: string, status: string) => {
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

  const orders = selectedPharmacyId ? ordersState.pharmacyOrders[selectedPharmacyId] ?? [] : [];

  return (
    <View style={styles.container}>
      {activePharmacies.length === 0 ? (
        <View style={styles.empty}>
          <Text>{t('pharmacies.noResults')}</Text>
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

          {ordersState.loading && orders.length === 0 ? (
            <View style={styles.loader}>
              <ActivityIndicator animating />
            </View>
          ) : (
            <FlatList
              data={orders}
              keyExtractor={item => item.orderId}
              contentContainerStyle={styles.orderList}
              ListEmptyComponent={() => (
                <View style={styles.empty}>
                  <Text>{t('orders.noOrders')}</Text>
                </View>
              )}
              renderItem={({ item }) => (
                <Card style={styles.card}>
                  <Card.Title title={`#${item.orderNumber}`} subtitle={item.customerEmail} />
                  <Card.Content>
                    <Text variant="bodySmall">{t(`orders.status.${statusKey(item.status)}`, { defaultValue: item.status })}</Text>
                    <Text variant="bodyMedium">
                      {item.currency} {item.totalAmount.toFixed(2)}
                    </Text>
                    <View style={styles.itemList}>
                      {item.items.map(orderItem => (
                        <Text key={orderItem.medicineId} variant="bodySmall">
                          {orderItem.medicineName} x {orderItem.quantity}
                        </Text>
                      ))}
                    </View>
                  </Card.Content>
                  <Card.Actions>
                    <Menu
                      visible={openMenuFor === item.orderId}
                      onDismiss={() => setOpenMenuFor(null)}
                      anchor={
                        <Button onPress={() => setOpenMenuFor(item.orderId)}>
                          {t(`orders.status.${statusKey(item.status)}`, { defaultValue: item.status })}
                        </Button>
                      }
                    >
                      {statusOptions.map(status => (
                        <Menu.Item
                          key={status}
                          onPress={() => {
                            setOpenMenuFor(null);
                            handleStatusChange(item.orderId, status);
                          }}
                          title={t(`orders.status.${statusKey(status)}`, { defaultValue: status })}
                        />
                      ))}
                    </Menu>
                    {item.prescriptionFileName && (
                      <Menu
                        visible={openPrescriptionMenu === item.orderId}
                        onDismiss={() => setOpenPrescriptionMenu(null)}
                        anchor={<Button onPress={() => setOpenPrescriptionMenu(item.orderId)}>{t('pharmacies.requiresPrescription')}</Button>}
                      >
                        {prescriptionStatuses.map(status => (
                          <Menu.Item
                            key={status}
                            onPress={() => {
                              setOpenPrescriptionMenu(null);
                              handlePrescriptionReview(item.orderId, status);
                            }}
                            title={t(`orders.status.${statusKey(status)}`, { defaultValue: status })}
                          />
                        ))}
                      </Menu>
                    )}
                    <Button
                      mode="text"
                      onPress={() => handleStatusChange(item.orderId, 'Rejected')}
                      textColor="#B3261E"
                    >
                      {t('orders.rejectOrder')}
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
  empty: {
    alignItems: 'center',
    marginTop: 32
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pharmacySelector: {
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  pharmacyChip: {
    marginRight: 8
  },
  orderList: {
    padding: 16,
    gap: 12
  },
  card: {
    marginBottom: 12
  },
  itemList: {
    marginTop: 8,
    gap: 4
  }
});

export default PharmacyOrdersScreen;
