import type { ImageProps, PressableProps, ScrollViewProps, TextInputProps, TextProps, ViewProps } from 'react-native';

declare module 'react-native' {
  interface ViewProps { className?: string }
  interface TextProps { className?: string }
  interface TextInputProps { className?: string }
  interface ImageProps { className?: string }
  interface PressableProps { className?: string }
  interface ScrollViewProps { className?: string }
}

export type NativeWindProps = ViewProps | TextProps | TextInputProps | ImageProps | PressableProps | ScrollViewProps;
