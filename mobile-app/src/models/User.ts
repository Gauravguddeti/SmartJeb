/**
 * User profile data model
 */

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: number;
  lastLoginAt: number;
  notificationPermissionGranted: boolean;
  darkMode: boolean;
  currency: string;
}

export default UserProfile;
