// index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import FlowBoard from './FlowBoard';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <FlowBoard />
    </React.StrictMode>
  );
} else {
  console.error('Не удалось найти элемент с id "root"');
}