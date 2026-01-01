# Getting Your Expo Project ID

The Expo Project ID is a unique identifier for your application in the Expo ecosystem. This ID is needed for various Expo services like EAS Build, EAS Submit, and EAS Update.

## How to Get Your Expo Project ID

### Option 1: Using EAS CLI (Recommended)

1. **Install the EAS CLI** if you haven't already:
   ```bash
   npm install -g eas-cli
   ```

2. **Log in to your Expo account**:
   ```bash
   eas login
   ```

3. **Initialize your project with EAS**:
   ```bash
   cd mobile-app
   eas init
   ```
   
   This command will:
   - Create a new project in your Expo account (if it doesn't exist)
   - Link your local project to the Expo project
   - Print out your project ID
   - Update your app.json with the project ID

4. **View your project ID** after initialization:
   - Check the terminal output after running `eas init`
   - Or look in your app.json/app.config.js file for the `extra.eas.projectId` field

### Option 2: From the Expo Website

1. **Log in** to your Expo account at [expo.dev](https://expo.dev)
2. **Navigate** to your project
3. **Find** your project ID in the project settings or dashboard

### Option 3: From an Existing app.json

If your project is already set up with Expo, you might find the project ID in:
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-project-id-here"
      }
    }
  }
}
```

## Using Your Expo Project ID

Once you have your Project ID:

1. **Add it to your .env file**:
   ```
   EXPO_PROJECT_ID=your-project-id-here
   ```

2. **Access it in your app.config.js**:
   ```javascript
   export default {
     expo: {
       // ... other configuration
       extra: {
         supabaseUrl: process.env.SUPABASE_URL,
         supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
         eas: {
           projectId: process.env.EXPO_PROJECT_ID
         }
       }
     }
   };
   ```

This ID is essential for:
- Building your app with EAS Build
- Submitting your app to stores with EAS Submit
- Using over-the-air updates with EAS Update
- Accessing other Expo cloud services

## Current Project ID

Your current Expo Project ID is:
```
4425a0b5-5234-4267-89cb-3ea86be4270b
```

This ID has been added to your .env.example file. Copy it to your actual .env file to use in your project configuration.
