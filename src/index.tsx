import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';

//require('dotenv').config();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const requiredVars = [
  "REACT_APP_AUTH0_DOMAIN",
  "REACT_APP_AUTH0_CLIENT_ID",
  "REACT_APP_AUTH0_CALLBACK_URL",
  "REACT_APP_API_SERVER_URL",
  "REACT_APP_AUTH0_AUDIENCE"
];

requiredVars.forEach(element => {
  if (!(element in process.env)) {
    throw new Error(`Config variable missing: ${element}.`);
  }
});

root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
