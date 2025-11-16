import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Searchbar,
  Card,
  Text,
  ActivityIndicator,
  Button,
  Chip,
  Portal,
  Dialog,
  HelperText,
  IconButton,
  TextInput,
  Snackbar,
  Surface
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { performMedicineSearch, MedicineSearchState } from '../../store/medicineSearchSlice';
import { addItem, updateQuantity, removeItem, CartState } from '../../store/cartSlice';
import { useNavigation } from '@react-navigation/native';
import { MedicineSearchResult } from '../../services/medicineCatalogService';
import { formatCurrency } from '../../utils/formatters';
import { fetchInventory, CatalogState } from '../../store/catalogSlice';
import { MedicineItem } from '../../services/pharmacyService';

const MedicineSearchScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { results, loading, error, query } = useAppSelector(state => state.medicineSearch as MedicineSearchState);
  const catalogState = useAppSelector(state => state.catalog as CatalogState);

  const [searchValue, setSearchValue] = useState(query);
  const [selectedItem, setSelectedItem] = useState<MedicineSearchResult | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectingQuantity, setSelectingQuantity] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const navigation = useNavigation<any>();
  const cartState = useAppSelector(state => state.cart as CartState);
  const [lastFetchedPharmacy, setLastFetchedPharmacy] = useState<string | null>(null);
  const cartItemCount = useMemo(() => cartState.items.reduce((sum, item) => sum + item.quantity, 0), [cartState.items]);
  const hasCartItems = cartItemCount > 0;
  const cartSubtotal = useMemo(() => cartState.items.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartState.items]);
  const cartPrimaryText = useMemo(() => {
    if (!hasCartItems) {
      return '';
    }
    return t('search.cartSummaryCount', { count: cartItemCount });
  }, [cartItemCount, hasCartItems, t]);
  const cartSecondaryText = useMemo(() => {
    if (!hasCartItems) {
      return '';
    }
    return t('search.cartSummaryTotal', { total: formatCurrency(cartSubtotal) });
  }, [cartSubtotal, hasCartItems, t]);

  const onSearch = useCallback(() => {
    const trimmed = searchValue.trim();
    if (trimmed.length < 2) {
      return;
    }
    Keyboard.dismiss();
    dispatch(performMedicineSearch(trimmed));
  }, [dispatch, searchValue]);

  const onSelectItem = useCallback((item: MedicineSearchResult) => {
    if (!cartState.pharmacyId) {
      setSnackbarMessage(t('cart.selectPharmacyPrompt'));
      setSnackbarVisible(true);
      return;
    }

    if (catalogState.loading) {
      setSnackbarMessage(t('common.loading'));
      setSnackbarVisible(true);
      return;
    }

    setSelectedItem(item);

    const inventoryMatch = catalogState.items.find(inv => inv.id === item.id);
    const existing = inventoryMatch
      ? cartState.items.find(cartItem => cartItem.medicineId === inventoryMatch.id)
      : undefined;

    if (existing) {
      setQuantity(existing.quantity);
      setSelectingQuantity(true);
    } else {
      setQuantity(1);
      setSelectingQuantity(false);
    }
    setDialogVisible(true);
  }, [cartState.items, cartState.pharmacyId, catalogState.items, catalogState.loading, t]);

  const handleConfirmQuantity = useCallback(() => {
    if (!selectedItem) {
      return;
    }

    if (!cartState.pharmacyId) {
      setSnackbarMessage(t('cart.selectPharmacyPrompt'));
      setSnackbarVisible(true);
      return;
    }

    const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

    const resolveInventoryItem = (): MedicineItem | null => {
      if (catalogState.items.length === 0) {
        return null;
      }

      const directMatch = catalogState.items.find(item => item.id === selectedItem.id);
      if (directMatch) {
        return directMatch;
      }

      const normalizedName = normalize(selectedItem.name);
      const normalizedComposition = selectedItem.composition ? normalize(selectedItem.composition) : '';
      const normalizedSearchId = normalize(selectedItem.id);

      return (
        catalogState.items.find(item => {
          const itemName = normalize(item.name);
          if (itemName && normalizedName && (itemName.includes(normalizedName) || normalizedName.includes(itemName))) {
            return true;
          }

          if (normalizedComposition) {
            const itemDescription = item.description ? normalize(item.description) : '';
            if (itemDescription && (itemDescription.includes(normalizedComposition) || normalizedComposition.includes(itemDescription))) {
              return true;
            }
          }

          const skuNormalized = item.sku ? normalize(item.sku) : '';
          return skuNormalized && skuNormalized === normalizedSearchId;
        }) ?? null
      );
    };

    const inventoryItem = resolveInventoryItem();

    if (!inventoryItem) {
      setSnackbarMessage(t('search.notAvailableForPharmacy'));
      setSnackbarVisible(true);
      return;
    }

    const existing = cartState.items.find(cartItem => cartItem.medicineId === inventoryItem.id);
    const fallbackExisting = cartState.items.find(cartItem => cartItem.medicineId === selectedItem.id);

    if (fallbackExisting && fallbackExisting.medicineId !== inventoryItem.id) {
      dispatch(removeItem(fallbackExisting.medicineId));
    }

    if (existing) {
      dispatch(
        updateQuantity({
          medicineId: inventoryItem.id,
          quantity
        })
      );
    } else {
      dispatch(
        addItem({
          medicineId: inventoryItem.id,
          name: inventoryItem.name,
          price: inventoryItem.price,
          currency: inventoryItem.currency,
          requiresPrescription: inventoryItem.requiresPrescription,
          quantity
        })
      );
    }

    setDialogVisible(false);
    setSelectingQuantity(false);
    setSnackbarMessage(
      t('search.addedConfirmation', {
        name: inventoryItem.name,
        quantity
      })
    );
    setSnackbarVisible(true);
  }, [cartState.items, cartState.pharmacyId, catalogState.items, dispatch, quantity, selectedItem, t]);

  const onDismissDialog = useCallback(() => {
    setDialogVisible(false);
    setSelectingQuantity(false);
  }, []);

  const decreaseQuantity = useCallback(() => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  }, []);

  const increaseQuantity = useCallback(() => {
    setQuantity(prev => prev + 1);
  }, []);

  const onQuantityChange = useCallback((value: string) => {
    const numeric = value.replace(/[^0-9]/g, '');
    if (numeric.length === 0) {
      setQuantity(1);
      return;
    }
    const parsed = parseInt(numeric, 10);
    setQuantity(Number.isNaN(parsed) || parsed <= 0 ? 1 : parsed);
  }, []);

  useEffect(() => {
    if (cartState.pharmacyId && cartState.pharmacyId !== lastFetchedPharmacy) {
      dispatch(fetchInventory(cartState.pharmacyId));
      setLastFetchedPharmacy(cartState.pharmacyId);
    }
  }, [cartState.pharmacyId, dispatch, lastFetchedPharmacy]);

  const dialogContent = useMemo(() => selectedItem, [selectedItem]);

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <View style={[styles.content, hasCartItems && styles.contentWithCartBar]}>
        <Searchbar
          placeholder={t('search.placeholder')}
          value={searchValue}
          onChangeText={setSearchValue}
          onSubmitEditing={onSearch}
          onIconPress={onSearch}
          style={styles.searchbar}
          autoCorrect={false}
        />
        <Button mode="contained" onPress={onSearch} style={styles.searchButton}>
          {t('search.searchAction')}
        </Button>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator animating size="large" />
            <Text>{t('common.loading')}</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={item => item.id}
            contentContainerStyle={results.length === 0 ? styles.emptyContainer : styles.listContainer}
            renderItem={({ item }) => (
              <Card style={styles.card} onPress={() => onSelectItem(item)}>
                <Card.Title title={item.name} subtitle={item.manufacturer ?? t('search.unknownManufacturer')} />
                <Card.Content>
                  {item.composition && <Text variant="bodySmall">{item.composition}</Text>}
                  <View style={styles.tagRow}>
                    {item.form && <Chip icon="pill">{item.form}</Chip>}
                    {item.schedule && <Chip icon="file-document-outline">{item.schedule}</Chip>}
                    {item.requiresPrescription && <Chip icon="shield-alert-outline">{t('search.requiresPrescription')}</Chip>}
                  </View>
                </Card.Content>
                <Card.Actions>
                  <Button onPress={() => onSelectItem(item)}>{t('search.viewDetails')}</Button>
                </Card.Actions>
              </Card>
            )}
            ListEmptyComponent={() => (
              <View style={styles.empty}>
                <Text variant="titleMedium">{t('search.noResultsTitle')}</Text>
                <Text>{t('search.noResultsDescription')}</Text>
              </View>
            )}
            style={styles.list}
          />
        )}

        {error && <HelperText type="error">{t(error)}</HelperText>}
      </View>

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={onDismissDialog}>
          <Dialog.Title>{dialogContent?.name}</Dialog.Title>
          <Dialog.Content>
            {dialogContent?.composition && <Text style={styles.dialogLine}>{dialogContent.composition}</Text>}
            <View style={styles.dialogMeta}>
              {dialogContent?.manufacturer && (
                <Chip icon="factory" style={styles.dialogChip}>{dialogContent.manufacturer}</Chip>
              )}
              {dialogContent?.form && (
                <Chip icon="shape" style={styles.dialogChip}>{dialogContent.form}</Chip>
              )}
            </View>
            <View style={styles.dialogMeta}>
              {dialogContent?.strength && (
                <Chip icon="weight-kilogram" style={styles.dialogChip}>{dialogContent.strength}</Chip>
              )}
              {dialogContent?.schedule && (
                <Chip icon="calendar" style={styles.dialogChip}>{dialogContent.schedule}</Chip>
              )}
            </View>
            <Text style={styles.dialogLine}>
              {t('search.priceLabel', {
                price: dialogContent?.maximumRetailPrice?.toFixed(2) ?? '—',
                currency: '₹'
              })}
            </Text>
            {dialogContent?.requiresPrescription && (
              <View style={styles.prescriptionNotice}>
                <IconButton icon="alert" size={20} disabled />
                <Text style={styles.prescriptionText}>{t('search.prescriptionNotice')}</Text>
              </View>
            )}
            {dialogContent?.ogdSource && (
              <Text variant="bodySmall" style={styles.dialogSource}>{t('search.sourceLabel', { source: dialogContent.ogdSource })}</Text>
            )}

            {selectingQuantity && (
              <View style={styles.quantitySection}>
                <Text style={styles.quantityLabel}>{t('search.quantityLabel')}</Text>
                <View style={styles.quantityRow}>
                  <IconButton icon="minus" onPress={decreaseQuantity} disabled={quantity <= 1} />
                  <TextInput
                    mode="outlined"
                    value={quantity.toString()}
                    onChangeText={onQuantityChange}
                    keyboardType="number-pad"
                    style={styles.quantityInput}
                  />
                  <IconButton icon="plus" onPress={increaseQuantity} />
                </View>
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                if (selectingQuantity) {
                  setSelectingQuantity(false);
                  return;
                }
                onDismissDialog();
              }}
            >
              {t('common.cancel')}
            </Button>
            {selectingQuantity ? (
              <Button mode="contained" onPress={handleConfirmQuantity}>
                {t('search.confirmSelection')}
              </Button>
            ) : (
              <Button mode="contained" onPress={() => setSelectingQuantity(true)}>
                {t('search.addToSelection')}
              </Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>

      {hasCartItems && (
        <Surface elevation={3} style={styles.cartSurface}>
          <View style={styles.cartBarContent}>
            <View style={styles.cartSummaryText}>
              <Text variant="bodyLarge" style={styles.cartPrimary}>{cartPrimaryText}</Text>
              <Text variant="bodySmall" style={styles.cartSecondary}>{cartSecondaryText}</Text>
            </View>
            <Button
              mode="contained"
              onPress={() => {
                let current: any = navigation;
                while (current) {
                  const routeNames = current.getState?.()?.routeNames;
                  if (Array.isArray(routeNames) && routeNames.includes('Pharmacies')) {
                    current.navigate('Pharmacies');
                    return;
                  }
                  current = current.getParent?.();
                }
                navigation.navigate('App', { screen: 'Pharmacies' });
              }}
            >
              {t('search.goToPharmaciesButton')}
            </Button>
          </View>
        </Surface>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F6F6'
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16
  },
  contentWithCartBar: {
    paddingBottom: 96
  },
  searchbar: {
    marginBottom: 8
  },
  searchButton: {
    alignSelf: 'flex-end',
    marginBottom: 12
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12
  },
  listContainer: {
    paddingBottom: 24,
    gap: 12
  },
  card: {
    marginBottom: 12
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center'
  },
  empty: {
    alignItems: 'center',
    gap: 8
  },
  dialogLine: {
    marginBottom: 8
  },
  dialogMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8
  },
  dialogChip: {
    marginRight: 4
  },
  dialogSource: {
    marginTop: 12,
    color: '#455A64'
  },
  prescriptionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8
  },
  prescriptionText: {
    flex: 1,
    color: '#BF360C'
  },
  quantitySection: {
    marginTop: 16
  },
  quantityLabel: {
    marginBottom: 8,
    fontWeight: '600'
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  quantityInput: {
    flex: 0,
    minWidth: 72
  },
  list: {
    flex: 1
  },
  cartSurface: {
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  cartBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16
  },
  cartSummaryText: {
    flex: 1
  },
  cartPrimary: {
    fontWeight: '600'
  },
  cartSecondary: {
    marginTop: 4,
    color: '#455A64'
  }
});

export default MedicineSearchScreen;
