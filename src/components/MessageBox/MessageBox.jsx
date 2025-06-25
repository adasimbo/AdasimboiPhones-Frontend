// adasimbo-iphones-frontend/src/components/MessageBox/MessageBox.jsx
import React from 'react';
// Styles are now in index.css

function MessageBox({ variant = 'info', children }) {
  // Use className with variant-specific classes from index.css
  const className = `message-box ${variant}`;

  return (
    <div className={className}>
      {children}
    </div>
  );
}

export default MessageBox;
