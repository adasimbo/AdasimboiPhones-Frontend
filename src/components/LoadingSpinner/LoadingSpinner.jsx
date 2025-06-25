// adasimbo-iphones-frontend/src/components/LoadingSpinner/LoadingSpinner.jsx
import React from 'react';
// Styles are now in index.css

function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      {/* Uses the .spinner class from index.css */}
      <div className="spinner"></div>
    </div>
  );
}

export default LoadingSpinner;
