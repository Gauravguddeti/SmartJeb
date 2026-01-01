# How to Get Your Expo Project ID

The Expo Project ID is required for several Expo services and is used in your mobile app's environment configuration. Here's a step-by-step guide on how to get it:

## Method 1: Using the Expo Dashboard (Easiest)

1. **Sign in** to your Expo account at [https://expo.dev/](https://expo.dev/)

2. **Create a new project** (if you don't have one already):
   - Click the "Create a project" button
   - Enter a name for your project (e.g., "PennyLog")
   - Choose the appropriate account/organization
   - Click "Create project"

3. **Find your Project ID**:
   - Go to your project's settings
   - Look for "Project ID" in the General section
   - Copy this ID to use in your .env file

## Method 2: Using EAS CLI

1. **Install EAS CLI** globally:
   ```bash
   npm install -g eas-cli
   ```

2. **Log in to your Expo account**:
   ```bash
   eas login
   ```

3. **Navigate to your project directory** and run:
   ```bash
   eas project:init
   ```

4. This will:
   - Create a project on Expo's servers (if it doesn't exist)
   - Link your local project to the remote one
   - Add the Project ID to your app.json/app.config.js

5. **View your Project ID** in the terminal output or check your app.json/app.config.js file

## Method 3: From an Existing Project

If your project is already set up with Expo:

1. **Check your app.json or app.config.js** for the projectId:
   ```json
   {
     "expo": {
       "extra": {
         "eas": {
           "projectId": "YOUR-PROJECT-ID-HERE"
         }
       }
     }
   }
   ```

2. If you don't see it there, run:
   ```bash
   eas project:init
   ```

## Adding the Project ID to Your Environment

Once you have your Project ID:

1. **Open** your `.env` file in the project root
2. **Add** the following line:
   ```
   EXPO_PROJECT_ID=your-project-id-here
   ```
3. **Save** the file

Your app.config.js should be configured to use this environment variable:
```javascript
export default {
  expo: {
    // ...other configuration
    extra: {
      // ...other extras
      eas: {
        projectId: process.env.EXPO_PROJECT_ID
      }
    }
  }
};
```

## What is the Expo Project ID Used For?

The Expo Project ID is used for:
- Building your app with EAS Build
- Submitting your app to app stores with EAS Submit
- Using over-the-air updates with EAS Update
- Integrating with other Expo cloud services

## Troubleshooting

- **"Cannot find module 'dotenv/config'"**: Run `npm install dotenv --save-dev`
- **Authentication issues**: Ensure you're logged in with `eas login`
- **Project creation fails**: Try creating the project manually on the Expo website

Remember to keep your Project ID secure but accessible to your development team.
