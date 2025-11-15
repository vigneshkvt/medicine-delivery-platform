import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, Button, ActivityIndicator, Chip } from 'react-native-paper';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchInventory, CatalogState } from '../../store/catalogSlice';
import { addItem, setPharmacy } from '../../store/cartSlice';
import { PharmacyState } from '../../store/pharmacySlice';

interface RouteParams {
  pharmacyId: string;
  name?: string;
}

const PharmacyDetailScreen: React.FC = () => {
  const { params } = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const catalog = useAppSelector(state => state.catalog as CatalogState);
  const pharmacyState = useAppSelector(state => state.pharmacy as PharmacyState);

  useEffect(() => {
    if (params?.pharmacyId) {
      dispatch(setPharmacy(params.pharmacyId));
      dispatch(fetchInventory(params.pharmacyId));
    }
  }, [dispatch, params?.pharmacyId]);

  const selectedPharmacy = pharmacyState.nearby.find(p => p.id === params?.pharmacyId) ?? pharmacyState.managed.find(p => p.id === params?.pharmacyId) ?? null;

  return (
    <View style={styles.container}>
      {selectedPharmacy && (
        <Card style={styles.headerCard}>
          <Card.Title title={selectedPharmacy.name} subtitle={`${selectedPharmacy.city}, ${selectedPharmacy.state}`} />
          <Card.Content>
            <Text>{selectedPharmacy.description}</Text>
            <Text style={styles.meta}>{t('pharmacies.rating', { rating: selectedPharmacy.rating.toFixed(1) })}</Text>
          </Card.Content>
        </Card>
      )}

      {catalog.loading ? (
        <View style={styles.loader}>
          <ActivityIndicator animating />
        </View>
      ) : (
        <FlatList
          data={catalog.items}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Card style={styles.itemCard}>
              <Card.Title title={item.name} subtitle={item.category} />
              <Card.Content>
                <Text>{item.description}</Text>
                <View style={styles.tags}>
                  <Chip icon="pill">{item.sku}</Chip>
                  {item.requiresPrescription && <Chip icon="file-document-outline">{t('pharmacies.requiresPrescription')}</Chip>}
                  <Chip>{`${item.currency} ${item.price.toFixed(2)}`}</Chip>
                </View>
                <Text variant="bodySmall">{t('pharmacies.inventory')}: {item.stockQuantity}</Text>
              </Card.Content>
              <Card.Actions>
                <Button
                  mode="contained-tonal"
                  onPress={() =>
                    dispatch(
                      addItem({
                        medicineId: item.id,
                        name: item.name,
                        price: item.price,
                        currency: item.currency,
                        requiresPrescription: item.requiresPrescription
                      })
                    )
                  }
                >
                  {t('pharmacies.addToCart')}
                </Button>
              </Card.Actions>
            </Card>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    justifyContent: 'center'
  },
  itemCard: {
    marginBottom: 12
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8
  }
});

export default PharmacyDetailScreen;
