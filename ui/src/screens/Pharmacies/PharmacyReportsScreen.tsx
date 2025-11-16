import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { ActivityIndicator, Avatar, Button, Card, Chip, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchManagedPharmacies, PharmacyState, selectPharmacy } from '../../store/pharmacySlice';
import { fetchPharmacyOrders, OrdersState } from '../../store/ordersSlice';

interface ReportMetric {
  id: string;
  label: string;
  value: string;
  helper?: string;
  icon: string;
}

const PharmacyReportsScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const pharmacyState = useAppSelector(state => state.pharmacy as PharmacyState);
  const ordersState = useAppSelector(state => state.orders as OrdersState);

  const activePharmacies = useMemo(
    () => pharmacyState.managed.filter(pharmacy => pharmacy.status === 'Active'),
    [pharmacyState.managed]
  );

  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string | null>(null);

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

  const reportMetrics = useMemo<ReportMetric[]>(() => {
    if (!selectedPharmacyId) {
      return [];
    }
    const orders = ordersState.pharmacyOrders[selectedPharmacyId] ?? [];
    const totalOrders = orders.length;
    const completedOrders = orders.filter(order => order.status === 'Completed').length;
    const cancelledOrders = orders.filter(order => order.status === 'Cancelled').length;
    const pendingVerification = orders.filter(order => !!order.prescriptionFileName && (order.prescriptionStatus ?? 'Pending') !== 'Approved').length;
    const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    return [
      {
        id: 'totalOrders',
        label: t('reports.totalOrders'),
        value: totalOrders.toString(),
        icon: 'clipboard-text-multiple'
      },
      {
        id: 'completedOrders',
        label: t('reports.completedOrders'),
        value: completedOrders.toString(),
        helper: t('reports.completedOrdersHelper'),
        icon: 'check-circle'
      },
      {
        id: 'pendingVerification',
        label: t('reports.pendingVerify'),
        value: pendingVerification.toString(),
        helper: t('reports.pendingVerifyHelper'),
        icon: 'alert-circle'
      },
      {
        id: 'cancelledOrders',
        label: t('reports.cancelledOrders'),
        value: cancelledOrders.toString(),
        icon: 'close-circle'
      },
      {
        id: 'revenue',
        label: t('reports.grossRevenue'),
        value: `₹ ${revenue.toFixed(2)}`,
        helper: t('reports.grossRevenueHelper'),
        icon: 'currency-inr'
      }
    ];
  }, [ordersState.pharmacyOrders, selectedPharmacyId, t]);

  const onRefresh = () => {
    if (selectedPharmacyId) {
      dispatch(fetchPharmacyOrders({ pharmacyId: selectedPharmacyId }));
    }
  };

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

          {ordersState.loading && reportMetrics.length === 0 ? (
            <View style={styles.loader}>
              <ActivityIndicator animating />
            </View>
          ) : (
            <FlatList
              data={reportMetrics}
              keyExtractor={item => item.id}
              contentContainerStyle={reportMetrics.length === 0 ? styles.emptyList : styles.list}
              ListEmptyComponent={() => (
                <View style={styles.empty}>
                  <Text>{t('reports.noData')}</Text>
                </View>
              )}
              renderItem={({ item }) => (
                <Card style={styles.card}>
                  <Card.Title title={item.label} left={props => <Avatar.Icon {...props} icon={item.icon} />} />
                  <Card.Content>
                    <Text variant="headlineSmall">{item.value}</Text>
                    {item.helper && <Text style={styles.helper}>{item.helper}</Text>}
                  </Card.Content>
                </Card>
              )}
              ListFooterComponent={() => (
                <Button mode="text" onPress={onRefresh} style={styles.refreshButton}>
                  {t('reports.refresh')}
                </Button>
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
  pharmacySelector: {
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  pharmacyChip: {
    marginRight: 8
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  empty: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 16
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
  helper: {
    marginTop: 8,
    color: '#546E7A'
  },
  refreshButton: {
    marginTop: 8
  }
});

export default PharmacyReportsScreen;
