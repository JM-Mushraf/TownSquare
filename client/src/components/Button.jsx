import React from 'react';
import './Button.css';

export function Button({ children, className, ...props }) {
  return (
    <button className={`button ${className || ''}`} {...props}>
      {children}
    </button>
  );
}