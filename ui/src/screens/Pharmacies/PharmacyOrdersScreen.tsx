import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, ActivityIndicator, Button, Menu, Chip } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchManagedPharmacies, PharmacyState, selectPharmacy } from '../../store/pharmacySlice';
import { fetchPharmacyOrders, changeOrderStatus, submitPrescriptionReview, OrdersState } from '../../store/ordersSlice';

const statusOptions = ['Approved', 'Preparing', 'ReadyForDelivery', 'OutForDelivery', 'Completed', 'Cancelled'];
const prescriptionStatuses = ['Approved', 'Rejected'];

const statusKey = (status: string) => status.charAt(0).toLowerCase() + status.slice(1);

const PharmacyOrdersScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const pharmacyState = useAppSelector(state => state.pharmacy as PharmacyState);
  const ordersState = useAppSelector(state => state.orders as OrdersState);

  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string | null>(null);
  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);
  const [openPrescriptionMenu, setOpenPrescriptionMenu] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchManagedPharmacies());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedPharmacyId && pharmacyState.managed.length > 0) {
      const first = pharmacyState.managed[0];
      setSelectedPharmacyId(first.id);
      dispatch(selectPharmacy(first.id));
    }
  }, [pharmacyState.managed, selectedPharmacyId, dispatch]);

  useEffect(() => {
    if (selectedPharmacyId) {
      dispatch(fetchPharmacyOrders({ pharmacyId: selectedPharmacyId }));
    }
  }, [dispatch, selectedPharmacyId]);

  const orders = selectedPharmacyId ? ordersState.pharmacyOrders[selectedPharmacyId] ?? [] : [];

  return (
    <View style={styles.container}>
      {pharmacyState.managed.length === 0 ? (
        <View style={styles.empty}>
          <Text>{t('pharmacies.noResults')}</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={pharmacyState.managed}
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
                            if (selectedPharmacyId) {
                              dispatch(changeOrderStatus({ orderId: item.orderId, pharmacyId: selectedPharmacyId, status }));
                            }
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
                              if (selectedPharmacyId) {
                                dispatch(submitPrescriptionReview({ orderId: item.orderId, pharmacyId: selectedPharmacyId, status }));
                              }
                            }}
                            title={t(`orders.status.${statusKey(status)}`, { defaultValue: status })}
                          />
                        ))}
                      </Menu>
                    )}
                  </Card.Actions>
                </Card>
              )}
            />
          )}
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
