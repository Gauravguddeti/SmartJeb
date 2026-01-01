# SmartExpense - Mobile App Development Guide

## Overview

SmartExpense is a native mobile application that automatically tracks expenses by reading transaction notifications from payment apps and bank apps. The app uses machine learning for automatic categorization and provides users with insightful analytics about their spending habits.

## Key Features Implementation

### 1. Authentication

The authentication system is implemented using Firebase Authentication:

- `src/services/authService.ts` - Core authentication functions
- `src/contexts/AuthContext.tsx` - Authentication state management
- `src/screens/LoginScreen.tsx` - Login UI
- `src/screens/RegisterScreen.tsx` - Registration UI

Users can sign in with email/password or Google authentication. The app securely stores user credentials and implements proper session management.

### 2. Smart Notification Listener

The notification listener is implemented using the React Native Notifications package:

- `src/services/notificationService.ts` - Core notification processing logic

This service runs in the background (on Android) and listens for payment-related notifications. When a notification arrives, it processes the text to extract:

- Transaction amount
- Merchant name
- Timestamp
- Source app

The extracted information is then automatically categorized and saved to the local database.

### 3. Machine Learning Categorization

The ML categorization system uses TensorFlow.js and custom NLP techniques:

- `src/services/mlService.ts` - Transaction classification logic
- `src/constants/categories.ts` - Category definitions with keywords

The system works by:
1. Extracting text from notifications
2. Analyzing the text for payment-related keywords
3. Matching merchant names against predefined categories
4. Automatically assigning the most likely expense category

### 4. Local Database

The app uses SQLite for local storage:

- `src/services/databaseService.ts` - Database operations

All expense data is stored locally on the device, ensuring:
- Offline access to all data
- Quick data retrieval
- Proper data structure for analytics

### 5. User Interface

The UI is implemented using native React Native components:

- `src/navigation/AppNavigation.tsx` - Navigation structure
- `src/screens/` - All app screens
- `src/components/` - Reusable components
- `src/contexts/ThemeContext.tsx` - Dark/light mode support

The app follows a clean, modern design with proper state management and responsive layouts.

## Building and Testing

### Development Build

1. Run the development server:
   ```
   npm start
   ```

2. Launch on Android:
   ```
   npm run android
   ```

3. Launch on iOS (requires macOS):
   ```
   npm run ios
   ```

### Testing Notification Listener

To test the automatic expense logging:

1. Install the app on an Android device
2. Enable notification access (Settings > Apps > Special access > Notification access)
3. Send a mock payment notification:
   ```
   adb shell am broadcast -a android.provider.Telephony.SMS_RECEIVED --es "address" "HDFCBANK" --es "body" "Alert: You've spent Rs.1,299.00 at Amazon.in on 03/07/25. Avl bal: Rs.24,580.75"
   ```

### Building Production APK/IPA

For Android:
```
eas build --platform android --profile production
```

For iOS:
```
eas build --platform ios --profile production
```

## Additional Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [SQLite Database](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [TensorFlow.js](https://www.tensorflow.org/js)
- [React Native Notifications](https://github.com/wix/react-native-notifications)

## Troubleshooting Common Issues

1. **Notification Listener Not Working**
   - Ensure notification permissions are granted
   - Check that battery optimization is disabled for the app
   - Verify that notification access is enabled in Android settings

2. **Firebase Authentication Errors**
   - Verify Firebase configuration in `src/services/firebase.ts`
   - Check that the Firebase project has Authentication enabled
   - Ensure the app has internet connectivity

3. **Database Issues**
   - Check for database initialization errors in logs
   - Verify the database schema is correctly defined
   - Ensure proper error handling for database operations

4. **Build Errors**
   - Update Expo SDK and dependencies
   - Clear the cache: `expo r -c`
   - Check Android/iOS specific configuration
