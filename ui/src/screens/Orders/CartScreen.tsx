import React, { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Card, IconButton, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useNavigation } from '@react-navigation/native';
import { CartState, calculateTotals, removeItem, updateQuantity } from '../../store/cartSlice';

const CartScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const cart = useAppSelector(state => state.cart as CartState);

  const totals = useMemo(() => calculateTotals(cart), [cart]);

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
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>{t('cart.summaryTitle')}</Text>
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium">{t('cart.subtotalLabel')}</Text>
              <Text variant="bodyMedium" style={styles.valueText}>{totals.formattedSubtotal}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium">{t('cart.delivery')}</Text>
              <Text variant="bodyMedium" style={styles.valueText}>{totals.formattedDelivery}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text variant="titleMedium">{t('cart.totalLabel')}</Text>
              <Text variant="titleMedium" style={styles.totalText}>{totals.formattedTotal}</Text>
            </View>
          </Card.Content>
        </Card>
        <Button
          mode="contained"
          disabled={cart.items.length === 0}
          onPress={() => {
            let current: any = navigation;
            while (current) {
              const routeNames = current.getState?.()?.routeNames;
              if (Array.isArray(routeNames) && routeNames.includes('Payment')) {
                current.navigate('Payment');
                return;
              }
              current = current.getParent?.();
            }
            navigation.navigate('App', { screen: 'Payment' });
          }}
        >
          {t('cart.proceedToPayment')}
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
  summaryCard: {
    paddingVertical: 4
  },
  summaryTitle: {
    marginBottom: 8
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 4
  },
  valueText: {
    fontWeight: '600'
  },
  empty: {
    alignItems: 'center',
    padding: 24
  },
  totalText: {
    fontWeight: '700'
  }
});

export default CartScreen;
