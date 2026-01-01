# SmartExpense - Mobile Expense Tracker

A native mobile app for Android and iOS that automatically tracks expenses from payment notifications and provides smart insights into your spending habits.

## Features

🔐 **Authentication**
- Login with email/password or Google Account
- Secure user profile management

🧠 **Smart Auto-Logging from Notifications**
- Background notification listener for payment apps (Android only)
- Automatic extraction of transaction details
- Silent logging with smart categorization

📊 **Expense Tracking**
- Add, edit, and delete expenses manually
- Categorize transactions with automatic suggestions
- View daily, weekly, and monthly spending summaries
- Interactive charts and graphs for spending analysis

📱 **Modern Native UI**
- Fully native mobile experience (not a web-based app)
- Dark/light mode support
- Clean, intuitive interface with smooth animations

## Tech Stack

- **Framework:** React Native with Expo
- **Navigation:** React Navigation v6
- **State Management:** React Context API
- **Storage:** SQLite for local database
- **Authentication:** Firebase Auth
- **ML/NLP:** TensorFlow.js for automatic categorization
- **UI Components:** Custom components with React Native primitives
- **Charts:** React Native Chart Kit
- **Icons:** Ionicons

## Setup Instructions

### Prerequisites

- Node.js 16+
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Configure Firebase:
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Authentication (Email/Password and Google Sign-In)
   - Update the Firebase configuration in `src/services/firebase.ts`

3. Start the development server:
   ```
   npm start
   ```

4. Run on devices:
   - For Android: `npm run android`
   - For iOS: `npm run ios` (macOS only)
   - Or scan the QR code with Expo Go app

### Building for Production

#### Android APK

1. Install EAS CLI:
   ```
   npm install -g eas-cli
   ```

2. Configure EAS:
   ```
   eas build:configure
   ```

3. Build Android APK:
   ```
   eas build --platform android --profile preview
   ```

4. The APK will be available for download from the Expo website

#### iOS IPA (requires Apple Developer Account)

1. Build iOS IPA:
   ```
   eas build --platform ios --profile preview
   ```

2. Follow the instructions on the Expo website to install the app on your iOS device

## Notification Listener Setup (Android only)

For the auto-logging feature to work on Android:

1. Go to Settings > Apps > Special app access > Notification access
2. Enable notification access for SmartExpense
3. Grant the app notification permissions when prompted

## Project Structure

```
src/
├── assets/          # Images, fonts, and other static assets
├── components/      # Reusable UI components
├── constants/       # App constants and configuration
├── contexts/        # React Context providers
├── hooks/           # Custom React hooks
├── models/          # TypeScript interfaces and types
├── navigation/      # React Navigation setup
├── screens/         # App screens
├── services/        # Core services (auth, database, ML)
└── utils/           # Helper functions and utilities
```
