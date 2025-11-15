# Medicine Order & Delivery Platform

A full-stack medicine ordering platform built with ASP.NET Core Web API and React Native (Expo).

## Features

### Customer Features
- 🔐 User authentication (Login/Register)
- 📍 Location-based pharmacy discovery
- 💊 Browse pharmacy inventory
- 🛒 Shopping cart with prescription upload
- 📦 Order tracking and history
- 🌐 Multi-language support (English/Tamil)
- 💵 Cash on delivery payment

### Pharmacist Features
- 📋 Order management dashboard
- 💊 Inventory management
- 📸 Prescription review and approval
- 🏪 Pharmacy onboarding

### Admin Features
- 📊 Dashboard with metrics
- ✅ Pharmacy approval workflow
- 👥 User management
- 📈 Analytics

## Tech Stack

### Backend (API)
- ASP.NET Core 8.0
- Entity Framework Core 8.0 (In-Memory/SQL Server)
- MediatR (CQRS pattern)
- FluentValidation
- Serilog logging
- JWT authentication
- Clean Architecture

### Frontend (Mobile)
- React Native (Expo SDK 54)
- TypeScript
- Redux Toolkit
- React Navigation
- React Native Paper (Material Design)
- i18next (internationalization)
- Expo Location, Image Picker

## Prerequisites

- .NET 8.0 SDK
- Node.js 18+
- Expo CLI
- Android Studio / Xcode (for emulators)
- Expo Go app (for physical device testing)

## Getting Started

### Backend Setup

1. Navigate to the project root:
```bash
cd Medicine
```

2. Restore dependencies:
```bash
dotnet restore
```

3. Run the API:
```bash
dotnet run --project api --urls http://0.0.0.0:5005
```

The API will be available at `http://localhost:5005` (or `http://0.0.0.0:5005` for network access).

### Frontend Setup

1. Navigate to the UI folder:
```bash
cd ui
```

2. Install dependencies:
```bash
npm install
```

3. Start Expo development server:

**For local network (same WiFi):**
```bash
EXPO_PUBLIC_API_URL=http://YOUR_IP:5005 npx expo start
```

**For tunnel mode (works anywhere):**
```bash
EXPO_PUBLIC_API_URL=http://localhost:5005 npx expo start --tunnel
```

4. Scan the QR code with Expo Go app on your mobile device.

## Default Credentials

The application seeds the following test accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@medicloud.local | Admin@123 |
| Pharmacist | pharmacist@medicloud.local | Pharma@123 |
| Customer | customer@medicloud.local | Customer@123 |

## Project Structure

```
Medicine/
├── api/                          # ASP.NET Core Web API
│   ├── Controllers/              # API controllers
│   ├── Contracts/                # Request/Response DTOs
│   ├── Application/              # CQRS handlers, validators
│   ├── Domain/                   # Entities, value objects, enums
│   └── Infrastructure/           # EF Core, services, persistence
└── ui/                           # React Native app
    ├── src/
    │   ├── components/           # Reusable UI components
    │   ├── navigation/           # Navigation configuration
    │   ├── screens/              # Screen components
    │   ├── services/             # API clients
    │   ├── store/                # Redux slices
    │   ├── localization/         # i18n resources
    │   └── utils/                # Helper functions
    └── assets/                   # Images, fonts
```

## Configuration

### API Configuration

Edit `api/appsettings.Development.json`:

```json
{
  "UseInMemoryDatabase": true,  // Set to false for SQL Server
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;Database=MedicineDb;..."
  },
  "Jwt": {
    "Issuer": "MedicineAPI",
    "Audience": "MedicineApp",
    "SigningKey": "your-secret-key-min-32-chars"
  }
}
```

### Mobile App Configuration

The API URL is set via environment variable `EXPO_PUBLIC_API_URL` when starting Expo.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login

### Pharmacies
- `GET /api/pharmacies/nearby` - Find nearby pharmacies
- `GET /api/pharmacies/{id}/inventory` - Get pharmacy inventory
- `POST /api/pharmacies/onboard` - Onboard new pharmacy
- `POST /api/pharmacies/{id}/approve` - Approve pharmacy (Admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get customer orders
- `GET /api/orders/pharmacy` - Get pharmacy orders
- `PUT /api/orders/{id}/status` - Update order status
- `POST /api/orders/{id}/prescription/review` - Review prescription

### Admin
- `GET /api/admin/dashboard` - Get dashboard metrics
- `GET /api/admin/pharmacies/pending` - Get pending pharmacies

## Development Notes

- The in-memory database is cleared on each restart
- For production, switch to SQL Server and run migrations
- Tunnel mode requires `@expo/ngrok` installed globally
- API listens on `0.0.0.0` to allow mobile device connections

## License

This project is provided as-is for educational purposes.
