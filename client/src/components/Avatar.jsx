import React from 'react';
import './Avatar.css';

export function Avatar({ src, fallback, className, ...props }) {
  return (
    <div className={`avatar ${className || ''}`} {...props}>
      {src ? (
        <img src={src || "/placeholder.svg"} alt={fallback} className="avatar-image" />
      ) : (
        <div className="avatar-fallback">{fallback}</div>
      )}
    </div>
  );
}