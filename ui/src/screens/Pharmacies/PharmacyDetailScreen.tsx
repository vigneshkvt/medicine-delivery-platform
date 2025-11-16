import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, Divider } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setPharmacy } from '../../store/cartSlice';
import { PharmacyState } from '../../store/pharmacySlice';

interface RouteParams {
  pharmacyId: string;
  name?: string;
}

const PharmacyDetailScreen: React.FC = () => {
  const { params } = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const pharmacyState = useAppSelector(state => state.pharmacy as PharmacyState);

  const formatTime = (raw?: string | null) => {
    if (!raw) {
      return '09:00';
    }

    const segments = raw.split(':');
    if (segments.length >= 2) {
      const hours = (segments[0] ?? '09').padStart(2, '0');
      const minutes = (segments[1] ?? '00').padStart(2, '0');
      return `${hours}:${minutes}`;
    }

    return raw;
  };

  useEffect(() => {
    if (params?.pharmacyId) {
      dispatch(setPharmacy(params.pharmacyId));
    }
  }, [dispatch, params?.pharmacyId]);

  const selectedPharmacy = pharmacyState.nearby.find(p => p.id === params?.pharmacyId) ?? pharmacyState.managed.find(p => p.id === params?.pharmacyId) ?? null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {selectedPharmacy ? (
        <>
          <Card style={styles.headerCard}>
            <Card.Title title={selectedPharmacy.name} subtitle={`${selectedPharmacy.city}, ${selectedPharmacy.state}`} />
            <Card.Content>
              <Text>{selectedPharmacy.description}</Text>
              <Text style={styles.meta}>{t('pharmacies.rating', { rating: selectedPharmacy.rating.toFixed(1) })}</Text>
              <Text style={styles.meta}>{t('pharmacies.orderCount', { count: selectedPharmacy.reviewCount })}</Text>
            </Card.Content>
          </Card>

          <Card style={styles.infoCard}>
            <Card.Title title={t('pharmacies.contactHeading')} />
            <Card.Content>
              <Text>{selectedPharmacy.contactNumber}</Text>
              <Text>{selectedPharmacy.email}</Text>
            </Card.Content>
          </Card>

          <Card style={styles.infoCard}>
            <Card.Title title={t('pharmacies.addressHeading')} />
            <Card.Content>
              <Text>{selectedPharmacy.addressLine1}</Text>
              {selectedPharmacy.addressLine2 ? <Text>{selectedPharmacy.addressLine2}</Text> : null}
              <Text>{`${selectedPharmacy.city}, ${selectedPharmacy.state} ${selectedPharmacy.postalCode}`}</Text>
              <Text>{selectedPharmacy.country}</Text>
            </Card.Content>
          </Card>

          <Card style={styles.infoCard}>
            <Card.Title title={t('pharmacies.hoursHeading')} />
            <Card.Content>
              <Text>{`${formatTime(selectedPharmacy.openingTime)} - ${formatTime(selectedPharmacy.closingTime)}`}</Text>
            </Card.Content>
            <Divider />
            <Card.Content style={styles.notice}>
              <Text>{t('pharmacies.sharedInventoryNotice')}</Text>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => {
                  const tabNavigator = navigation.getParent?.();
                  if (tabNavigator) {
                    tabNavigator.navigate('Cart');
                    navigation.popToTop?.();
                  } else {
                    navigation.navigate('Cart');
                  }
                }}
              >
                {t('pharmacies.goToCart')}
              </Button>
            </Card.Actions>
          </Card>
        </>
      ) : (
        <View style={styles.loader}>
          <Text>{t('pharmacies.noResults')}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12
  },
  headerCard: {
    marginBottom: 12
  },
  meta: {
    marginTop: 4,
    color: '#455A64'
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32
  },
  infoCard: {
    marginBottom: 12
  },
  notice: {
    marginTop: 12
  }
});

export default PharmacyDetailScreen;
