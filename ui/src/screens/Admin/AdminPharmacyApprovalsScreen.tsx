import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchPendingPharmacies, AdminState } from '../../store/adminSlice';
import { approvePharmacy } from '../../services/pharmacyService';

const AdminPharmacyApprovalsScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const adminState = useAppSelector(state => state.admin as AdminState);

  useEffect(() => {
    dispatch(fetchPendingPharmacies());
  }, [dispatch]);

  const onApprove = async (pharmacyId: string) => {
    try {
      await approvePharmacy(pharmacyId);
      dispatch(fetchPendingPharmacies());
    } catch (error) {
      Alert.alert(t('errors.unknown'), t('errors.unknown'));
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={adminState.pendingPharmacies}
        keyExtractor={item => item.id}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text>{t('pharmacies.noResults')}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Title title={item.name} subtitle={`${item.city}, ${item.state}`} />
            <Card.Content>
              <Text>{item.description}</Text>
              <Text>{item.contactNumber}</Text>
            </Card.Content>
            <Card.Actions>
              <Button mode="contained" onPress={() => onApprove(item.id)}>
                {t('admin.approve')}
              </Button>
            </Card.Actions>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  empty: {
    alignItems: 'center',
    marginTop: 24
  },
  card: {
    marginBottom: 12
  }
});

export default AdminPharmacyApprovalsScreen;
