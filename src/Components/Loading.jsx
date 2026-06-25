import React from 'react';
import './Loading.css';

const Loading = () => {
  return (
    <div className="loading-wrapper">
      <div className="modern-spinner"></div>
      <p className="loading-text">Cargando...</p>
    </div>
  );
};

export default Loading;
