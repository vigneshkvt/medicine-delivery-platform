import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchMyOrders, OrdersState } from '../../store/ordersSlice';

const OrderHistoryScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const ordersState = useAppSelector(state => state.orders as OrdersState);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchMyOrders());
    }, [dispatch])
  );

  if (ordersState.loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator animating />
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={ordersState.myOrders}
      keyExtractor={item => item.orderId}
      ListEmptyComponent={() => (
        <View style={styles.empty}>
          <Text>{t('orders.noOrders')}</Text>
        </View>
      )}
      renderItem={({ item }) => (
        <Card style={styles.card}>
          <Card.Title title={item.pharmacyName} subtitle={new Date(item.createdAtUtc).toLocaleString()} />
          <Card.Content>
            <Text variant="bodySmall">{item.status}</Text>
            <Text variant="bodyMedium">
              {item.currency} {item.totalAmount.toFixed(2)}
            </Text>
            <Text variant="bodySmall" style={styles.itemsHeading}>
              {t('pharmacies.inventory')}
            </Text>
            {item.items.map(orderItem => (
              <Text key={orderItem.medicineId} variant="bodySmall">
                {orderItem.medicineName} x {orderItem.quantity}
              </Text>
            ))}
          </Card.Content>
        </Card>
      )}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
    gap: 12
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  empty: {
    alignItems: 'center',
    marginTop: 24
  },
  card: {
    marginBottom: 12
  },
  itemsHeading: {
    marginTop: 8,
    fontWeight: '600'
  }
});

export default OrderHistoryScreen;
