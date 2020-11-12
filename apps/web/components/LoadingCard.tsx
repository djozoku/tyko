import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

const LoadingCard = () => (
  <div
    style={{
      minHeight: '320px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <CircularProgress />
  </div>
);

export default LoadingCard;
