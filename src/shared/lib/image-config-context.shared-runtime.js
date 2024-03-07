import React from 'react';
import { imageConfigDefault } from './image-config';
export const ImageConfigContext = React.createContext(imageConfigDefault);
if (process.env.NODE_ENV !== 'production') {
    ImageConfigContext.displayName = 'ImageConfigContext';
}
