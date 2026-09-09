import { PermissionsAndroid, Platform } from 'react-native';

export async function ensureMediaPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const granted = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.CAMERA,
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  ]);
  return (
    granted['android.permission.CAMERA'] === 'granted' &&
    granted['android.permission.RECORD_AUDIO'] === 'granted'
  );
}
