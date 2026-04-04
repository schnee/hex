import { useMemo } from 'react';

interface OverlayDimensionsInput {
  width_inches?: number;
  height_inches?: number;
  scaleX?: number;
  scaleY?: number;
}

interface OverlayDimensionsResult {
  physicalDimensions: {
    width: number;
    height: number;
  };
  visualDimensions: {
    width: number;
    height: number;
  };
}

export const useOverlayDimensions = (
  input: OverlayDimensionsInput
): OverlayDimensionsResult => {
  return useMemo(() => {
    const width = (input.width_inches ?? 0) * (input.scaleX ?? 1);
    const height = (input.height_inches ?? 0) * (input.scaleY ?? 1);

    return {
      physicalDimensions: {
        width,
        height,
      },
      visualDimensions: {
        width: width * 30,
        height: height * 30,
      },
    };
  }, [input.height_inches, input.scaleX, input.scaleY, input.width_inches]);
};
