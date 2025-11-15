import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Text, ActivityIndicator, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { resolveCurrentLocation, LocationState } from '../../store/locationSlice';
import { fetchNearbyPharmacies, selectPharmacy, PharmacyState } from '../../store/pharmacySlice';

interface Props extends NativeStackScreenProps<any> {}

const PharmacyListScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { selectedLocation, loading: locationLoading } = useAppSelector(state => state.location as LocationState);
  const pharmacyState = useAppSelector(state => state.pharmacy as PharmacyState);

  useEffect(() => {
    if (!selectedLocation) {
      dispatch(resolveCurrentLocation());
    }
  }, [dispatch, selectedLocation]);

  useEffect(() => {
    if (selectedLocation) {
      dispatch(
        fetchNearbyPharmacies({
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          radiusInKm: 5
        })
      );
    }
  }, [dispatch, selectedLocation]);

  const onSelectPharmacy = (pharmacyId: string, name: string) => {
    dispatch(selectPharmacy(pharmacyId));
    navigation.navigate('PharmacyDetail', { pharmacyId, name });
  };

  const isLoading = locationLoading || pharmacyState.loading;

  return (
    <View style={styles.container}>
      {isLoading && pharmacyState.nearby.length === 0 ? (
        <View style={styles.loader}>
          <ActivityIndicator animating size="large" />
          <Text>{t('common.loading')}</Text>
        </View>
      ) : (
        <FlatList
          data={pharmacyState.nearby}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => {
                if (selectedLocation) {
                  dispatch(
                    fetchNearbyPharmacies({
                      latitude: selectedLocation.latitude,
                      longitude: selectedLocation.longitude,
                      radiusInKm: 5
                    })
                  );
                }
              }}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Text>{t('pharmacies.noResults')}</Text>
              <Button mode="outlined" onPress={() => dispatch(resolveCurrentLocation())}>
                {t('onboarding.enableLocation')}
              </Button>
            </View>
          )}
          renderItem={({ item }) => (
            <Card style={styles.card} onPress={() => onSelectPharmacy(item.id, item.name)}>
              <Card.Title title={item.name} subtitle={`${item.city}, ${item.state}`} />
              <Card.Content>
                <Text variant="bodyMedium">{item.description}</Text>
                <Text variant="bodySmall" style={styles.meta}>
                  {t('pharmacies.rating', { rating: item.rating.toFixed(1) })} • {t('pharmacies.orderCount', { count: item.reviewCount })}
                </Text>
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    gap: 12,
    marginTop: 32
  },
  card: {
    marginBottom: 12
  },
  meta: {
    marginTop: 8,
    color: '#455A64'
  }
});

export default PharmacyListScreen;
