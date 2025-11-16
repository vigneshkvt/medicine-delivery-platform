import React, { useEffect, useMemo } from 'react';
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import PharmacyListScreen from '../screens/Pharmacies/PharmacyListScreen';
import PharmacyDetailScreen from '../screens/Pharmacies/PharmacyDetailScreen';
import CartScreen from '../screens/Orders/CartScreen';
import PaymentScreen from '../screens/Orders/PaymentScreen';
import OrderHistoryScreen from '../screens/Orders/OrderHistoryScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import PharmacyOrdersScreen from '../screens/Pharmacies/PharmacyOrdersScreen';
import AdminDashboardScreen from '../screens/Admin/AdminDashboardScreen';
import AdminPharmacyApprovalsScreen from '../screens/Admin/AdminPharmacyApprovalsScreen';
import LocationPermissionScreen from '../screens/Onboarding/LocationPermissionScreen';
import ManualLocationScreen from '../screens/Onboarding/ManualLocationScreen';
import MedicineSearchScreen from '../screens/Medicines/MedicineSearchScreen';
import PharmacyProfileScreen from '../screens/Pharmacies/PharmacyProfileScreen';
import PrescriptionValidationScreen from '../screens/Pharmacies/PrescriptionValidationScreen';
import PharmacyReportsScreen from '../screens/Pharmacies/PharmacyReportsScreen';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { AuthState } from '../store/authSlice';
import { LocationState } from '../store/locationSlice';
import { PharmacyState, fetchManagedPharmacies } from '../store/pharmacySlice';
import { Pharmacy } from '../services/pharmacyService';

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const CustomerTabs = createBottomTabNavigator();
const PharmacistTabs = createBottomTabNavigator();
const AdminTabs = createBottomTabNavigator();
const PharmacyStack = createNativeStackNavigator();
const OnboardingStack = createNativeStackNavigator();

const navigationTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    background: '#F4F6F6'
  }
};

function AuthNavigator() {
  const { t } = useTranslation();
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <AuthStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: t('auth.createAccount', { defaultValue: 'Create account' }) }}
      />
    </AuthStack.Navigator>
  );
}

function PharmacyNavigator() {
  const { t } = useTranslation();
  return (
    <PharmacyStack.Navigator>
      <PharmacyStack.Screen
        name="PharmacyList"
        component={PharmacyListScreen}
        options={{ headerShown: false }}
      />
      <PharmacyStack.Screen
        name="PharmacyDetail"
        component={PharmacyDetailScreen}
        options={({ route }) => ({ title: (route.params as { name?: string })?.name ?? t('pharmacies.inventory') })}
      />
    </PharmacyStack.Navigator>
  );
}

function CustomerNavigator() {
  const { t } = useTranslation();
  return (
    <CustomerTabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            Medicines: 'magnify',
            Pharmacies: 'hospital-marker',
            Cart: 'cart',
            Payment: 'credit-card',
            Orders: 'clipboard-list',
            Settings: 'cog'
          };
          return <MaterialCommunityIcons name={(icons[route.name] as any) ?? 'circle-outline'} color={color} size={size} />;
        }
      })}
    >
      <CustomerTabs.Screen
        name="Medicines"
        component={MedicineSearchScreen}
        options={{ title: t('search.title') }}
      />
      <CustomerTabs.Screen
        name="Pharmacies"
        component={PharmacyNavigator}
        options={{ title: t('pharmacies.nearbyTitle') }}
      />
      <CustomerTabs.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: t('cart.title') }}
      />
      <CustomerTabs.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ title: t('payment.title') }}
      />
      <CustomerTabs.Screen
        name="Orders"
        component={OrderHistoryScreen}
        options={{ title: t('orders.historyTitle') }}
      />
      <CustomerTabs.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: t('common.language') }}
      />
    </CustomerTabs.Navigator>
  );
}

function PharmacistNavigator() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const pharmacyState = useAppSelector(state => state.pharmacy as PharmacyState);

  useEffect(() => {
    dispatch(fetchManagedPharmacies());
  }, [dispatch]);

  const activePharmacies = useMemo(
    () => pharmacyState.managed.filter(pharmacy => pharmacy.status === 'Active'),
    [pharmacyState.managed]
  );

  const hasActivePharmacy = activePharmacies.length > 0;

  if (pharmacyState.managedLoading && !hasActivePharmacy) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
        <ActivityIndicator animating size="large" />
        <Text>{t('pharmacies.loadingPharmacies')}</Text>
      </View>
    );
  }

  if (!hasActivePharmacy) {
    return <PharmacyProfileScreen />;
  }

  return (
    <PharmacistTabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            PharmacyOrders: 'bell-badge',
            PrescriptionValidation: 'clipboard-check-outline',
            PharmacyReports: 'chart-box'
          };
          return <MaterialCommunityIcons name={(icons[route.name] as any) ?? 'circle-outline'} color={color} size={size} />;
        }
      })}
    >
      <PharmacistTabs.Screen
        name="PharmacyOrders"
        component={PharmacyOrdersScreen}
        options={{ title: t('pharmacies.notifications') }}
      />
      <PharmacistTabs.Screen
        name="PrescriptionValidation"
        component={PrescriptionValidationScreen}
        options={{ title: t('pharmacies.validation') }}
      />
      <PharmacistTabs.Screen
        name="PharmacyReports"
        component={PharmacyReportsScreen}
        options={{ title: t('pharmacies.reports') }}
      />
    </PharmacistTabs.Navigator>
  );
}

function AdminNavigator() {
  const { t } = useTranslation();
  return (
    <AdminTabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            AdminDashboard: 'view-dashboard',
            AdminPharmacies: 'account-multiple-check',
            AdminSettings: 'cog'
          };
          return <MaterialCommunityIcons name={(icons[route.name] as any) ?? 'circle-outline'} color={color} size={size} />;
        }
      })}
    >
      <AdminTabs.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ title: t('admin.dashboard') }}
      />
      <AdminTabs.Screen
        name="AdminPharmacies"
        component={AdminPharmacyApprovalsScreen}
        options={{ title: t('admin.pharmacyApplications') }}
      />
      <AdminTabs.Screen
        name="AdminSettings"
        component={SettingsScreen}
        options={{ title: t('common.language') }}
      />
    </AdminTabs.Navigator>
  );
}

function OnboardingNavigator() {
  const { t } = useTranslation();
  return (
    <OnboardingStack.Navigator>
      <OnboardingStack.Screen
        name="LocationPermission"
        component={LocationPermissionScreen}
        options={{ headerShown: false }}
      />
      <OnboardingStack.Screen
        name="ManualLocation"
        component={ManualLocationScreen}
        options={{ title: t('onboarding.selectCityTitle') }}
      />
    </OnboardingStack.Navigator>
  );
}

export default function AppNavigator() {
  const { token, role } = useAppSelector(state => state.auth as AuthState);
  const locationState = useAppSelector(state => state.location as LocationState);
  const shouldShowOnboarding = token && role === 'Customer' && !locationState.hasOnboarded;

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          shouldShowOnboarding ? (
            <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
          ) : (
            <RootStack.Screen
              name="App"
              component={role === 'Admin' ? AdminNavigator : role === 'Pharmacist' ? PharmacistNavigator : CustomerNavigator}
            />
          )
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
