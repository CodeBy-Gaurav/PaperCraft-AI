declare module 'expo-image-picker' {
  export type MediaType = 'images' | 'videos' | 'livePhotos';
  export interface ImagePickerAsset { uri: string; width: number; height: number; fileName?: string | null; fileSize?: number; mimeType?: string; base64?: string; }
  export interface ImagePickerResult { canceled: boolean; assets?: ImagePickerAsset[]; }
  export interface ImagePickerOptions { mediaTypes?: MediaType[]; allowsEditing?: boolean; aspect?: [number, number]; quality?: number; base64?: boolean; }
  export function launchImageLibraryAsync(options?: ImagePickerOptions): Promise<ImagePickerResult>;
  export function launchCameraAsync(options?: ImagePickerOptions): Promise<ImagePickerResult>;
  export function requestMediaLibraryPermissionsAsync(): Promise<{ granted: boolean; status: string }>;
  export function requestCameraPermissionsAsync(): Promise<{ granted: boolean; status: string }>;
}
