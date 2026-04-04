declare module 'react-resizable' {
  import type React from 'react';

  export interface ResizeCallbackData {
    node: HTMLElement;
    size: {
      width: number;
      height: number;
    };
    handle: string;
  }

  export interface ResizableBoxProps {
    width: number;
    height: number;
    axis?: 'both' | 'x' | 'y' | 'none';
    minConstraints?: [number, number];
    maxConstraints?: [number, number];
    resizeHandles?: Array<'s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'>;
    onResizeStop?: (
      event: React.SyntheticEvent,
      data: ResizeCallbackData
    ) => void;
    children?: React.ReactNode;
  }

  export interface ResizableProps {
    onResize?: (event: React.SyntheticEvent, data: ResizeCallbackData) => void;
    children?: React.ReactNode;
  }

  export const ResizableBox: React.ComponentType<ResizableBoxProps>;
  export const Resizable: React.ComponentType<ResizableProps>;
}
