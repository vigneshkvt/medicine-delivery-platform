import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, ActivityIndicator, Chip } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchManagedPharmacies, PharmacyState, selectPharmacy } from '../../store/pharmacySlice';
import { fetchInventory, CatalogState } from '../../store/catalogSlice';

const PharmacyInventoryScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const pharmacyState = useAppSelector(state => state.pharmacy as PharmacyState);
  const catalogState = useAppSelector(state => state.catalog as CatalogState);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchManagedPharmacies());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedPharmacyId && pharmacyState.managed.length > 0) {
      const first = pharmacyState.managed[0];
      setSelectedPharmacyId(first.id);
      dispatch(selectPharmacy(first.id));
    }
  }, [dispatch, pharmacyState.managed, selectedPharmacyId]);

  useEffect(() => {
    if (selectedPharmacyId) {
      dispatch(fetchInventory(selectedPharmacyId));
    }
  }, [dispatch, selectedPharmacyId]);

  if (pharmacyState.managed.length === 0) {
    return (
      <View style={styles.empty}>
        <Text>{t('pharmacies.noResults')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={pharmacyState.managed}
        horizontal
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
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

      {catalogState.loading ? (
        <View style={styles.loader}>
          <ActivityIndicator animating />
        </View>
      ) : (
        <FlatList
          data={catalogState.items}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Title title={item.name} subtitle={item.category} />
              <Card.Content>
                <Text>{item.description}</Text>
                <View style={styles.tags}>
                  <Chip>{item.sku}</Chip>
                  <Chip>{`${item.currency} ${item.price.toFixed(2)}`}</Chip>
                  <Chip>{t('pharmacies.inventory')}: {item.stockQuantity}</Chip>
                </View>
              </Card.Content>
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
    padding: 16
  },
  list: {
    gap: 12
  },
  card: {
    marginBottom: 12
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pharmacySelector: {
    paddingHorizontal: 16,
    paddingBottom: 12
  },
  pharmacyChip: {
    marginRight: 8
  }
});

export default PharmacyInventoryScreen;
