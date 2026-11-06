declare module 'expo-print' {
  export interface PrintToFileOptions { html: string; width?: number; height?: number; margins?: { left?: number; right?: number; top?: number; bottom?: number } }
  export interface PrintToFileResult { uri: string; numberOfPages?: number }
  export interface PrintOptions { html?: string; uri?: string; printerUrl?: string; orientation?: 'portrait' | 'landscape'; margins?: { left?: number; right?: number; top?: number; bottom?: number } }
  export function printToFileAsync(options: PrintToFileOptions): Promise<PrintToFileResult>;
  export function printAsync(options: PrintOptions): Promise<void>;
}
