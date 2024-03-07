import React from 'react';
export const HeadManagerContext = React.createContext({});
if (process.env.NODE_ENV !== 'production') {
    HeadManagerContext.displayName = 'HeadManagerContext';
}
