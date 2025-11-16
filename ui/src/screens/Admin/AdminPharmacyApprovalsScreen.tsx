import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchPendingPharmacies, AdminState } from '../../store/adminSlice';
import { approvePharmacy, rejectPharmacy } from '../../services/pharmacyService';

const AdminPharmacyApprovalsScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const adminState = useAppSelector(state => state.admin as AdminState);
  const [expandedPharmacyId, setExpandedPharmacyId] = useState<string | null>(null);

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

  const onReject = (pharmacyId: string) => {
    Alert.alert(t('admin.reject'), t('admin.rejectConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('admin.reject'),
        style: 'destructive',
        onPress: async () => {
          try {
            await rejectPharmacy(pharmacyId);
            setExpandedPharmacyId(null);
            dispatch(fetchPendingPharmacies());
          } catch (error) {
            Alert.alert(t('errors.unknown'), t('errors.unknown'));
          }
        }
      }
    ]);
  };

  const toggleExpanded = (pharmacyId: string) => {
    setExpandedPharmacyId(current => (current === pharmacyId ? null : pharmacyId));
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
        renderItem={({ item }) => {
          const isExpanded = expandedPharmacyId === item.id;
          return (
            <Card style={styles.card} onPress={() => toggleExpanded(item.id)}>
              <Card.Title title={item.name} subtitle={`${item.city}, ${item.state}`} />
              <Card.Content>
                <Text>{item.description}</Text>
                <Text style={styles.meta}>{item.contactNumber}</Text>
                <Text style={styles.meta}>{item.email}</Text>
                {isExpanded ? (
                  <View style={styles.details}>
                    <Text style={styles.detailLabel}>{t('pharmacies.addressHeading')}</Text>
                    <Text>{item.addressLine1}</Text>
                    {item.addressLine2 ? <Text>{item.addressLine2}</Text> : null}
                    <Text>
                      {item.city}, {item.state} - {item.postalCode}
                    </Text>
                    <Text style={styles.detailLabel}>{t('pharmacies.contactHeading')}</Text>
                    <Text>{item.contactNumber}</Text>
                    <Text>{item.email}</Text>
                    <Text style={styles.detailLabel}>{t('pharmacies.hoursHeading')}</Text>
                    <Text>
                      {item.openingTime} - {item.closingTime}
                    </Text>
                    <Text style={styles.detailLabel}>{t('pharmacies.latitude')}</Text>
                    <Text>{item.latitude.toFixed(6)}</Text>
                    <Text style={styles.detailLabel}>{t('pharmacies.longitude')}</Text>
                    <Text>{item.longitude.toFixed(6)}</Text>
                  </View>
                ) : null}
              </Card.Content>
              <Card.Actions style={styles.actions}>
                <Button mode="text" onPress={() => toggleExpanded(item.id)}>
                  {isExpanded ? t('common.close') : t('pharmacies.seeAll')}
                </Button>
                {isExpanded ? (
                  <>
                    <Button mode="contained" onPress={() => onApprove(item.id)}>
                      {t('admin.approve')}
                    </Button>
                    <Button mode="outlined" onPress={() => onReject(item.id)} textColor="#B3261E">
                      {t('admin.reject')}
                    </Button>
                  </>
                ) : null}
              </Card.Actions>
            </Card>
          );
        }}
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
  },
  meta: {
    color: '#455A64',
    marginTop: 4
  },
  details: {
    marginTop: 12,
    gap: 4
  },
  detailLabel: {
    marginTop: 8,
    fontWeight: '600'
  },
  actions: {
    justifyContent: 'flex-end'
  }
});

export default AdminPharmacyApprovalsScreen;
