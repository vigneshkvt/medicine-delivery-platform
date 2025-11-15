import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Button, List, TextInput, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { searchLocations, LocationSearchResult } from '../../services/geocodingService';
import { useAppDispatch } from '../../store/hooks';
import { setManualLocation } from '../../store/locationSlice';

interface Props extends NativeStackScreenProps<any> {}

const ManualLocationScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<LocationSearchResult[]>(() => searchLocations(''));
  const [selected, setSelected] = React.useState<LocationSearchResult | null>(null);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setResults(searchLocations(query));
    }, 200);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleConfirm = () => {
    if (!selected) {
      return;
    }
    dispatch(setManualLocation({ label: selected.label, latitude: selected.latitude, longitude: selected.longitude }));
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        {t('onboarding.selectCityTitle')}
      </Text>
      <TextInput
        mode="outlined"
        placeholder={t('onboarding.searchPlaceholder')}
        value={query}
        onChangeText={setQuery}
        style={styles.search}
      />

      <FlatList
        data={results}
        keyExtractor={item => `${item.label}`}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text>{t('onboarding.noResults')}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <List.Item
            title={item.label}
            onPress={() => setSelected(item)}
            right={props => (selected?.label === item.label ? <List.Icon {...props} icon="check" /> : null)}
          />
        )}
      />

      <Button mode="contained" onPress={handleConfirm} disabled={!selected}>
        {t('onboarding.confirmLocation')}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16
  },
  title: {
    marginTop: 8
  },
  search: {
    backgroundColor: 'white'
  },
  empty: {
    alignItems: 'center',
    marginTop: 24
  }
});

export default ManualLocationScreen;
