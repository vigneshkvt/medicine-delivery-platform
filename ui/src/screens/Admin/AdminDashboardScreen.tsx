import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, ActivityIndicator, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAdminDashboard, AdminState } from '../../store/adminSlice';

const AdminDashboardScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const adminState = useAppSelector(state => state.admin as AdminState);

  useEffect(() => {
    dispatch(fetchAdminDashboard());
  }, [dispatch]);

  if (adminState.loading && !adminState.dashboard) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator animating />
      </View>
    );
  }

  const dashboard = adminState.dashboard;

  return (
    <View style={styles.container}>
      <Button mode="outlined" onPress={() => dispatch(fetchAdminDashboard())}>
        {t('common.retry')}
      </Button>
      {dashboard && (
        <View style={styles.grid}>
          <Card style={styles.card}>
            <Card.Title title={t('admin.totalOrders')} />
            <Card.Content>
              <Text variant="headlineMedium">{dashboard.totalOrders}</Text>
            </Card.Content>
          </Card>
          <Card style={styles.card}>
            <Card.Title title={t('admin.totalRevenue')} />
            <Card.Content>
              <Text variant="headlineMedium">{dashboard.totalOrderValue.toFixed(2)}</Text>
            </Card.Content>
          </Card>
          <Card style={styles.card}>
            <Card.Title title={t('admin.pendingPharmacies')} />
            <Card.Content>
              <Text variant="headlineMedium">{dashboard.pendingPharmacies}</Text>
            </Card.Content>
          </Card>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  grid: {
    gap: 12
  },
  card: {
    marginBottom: 12
  }
});

export default AdminDashboardScreen;
