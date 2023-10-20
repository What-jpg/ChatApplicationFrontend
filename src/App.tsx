import React from 'react';
import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CallbackPage from './pages/CallbackPage';
import WeatherPage from './pages/WeatherPage';
import RequireAuthenticationForPage from './components/RequireAuthenticationForPage';
import { AppState, Auth0Provider, WithAuthenticationRequiredOptions } from '@auth0/auth0-react';
import './index.css';
import SavePageLink from './components/SavePageLink';
import ChatPage from './pages/ChatPage';

function App() {
  const domain = process.env.REACT_APP_AUTH0_DOMAIN;
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
  const redirectionUri = process.env.REACT_APP_AUTH0_CALLBACK_URL;
  const audience = process.env.REACT_APP_AUTH0_AUDIENCE;

  const navigate = useNavigate();

  const onRedirectCallback = (appState?: AppState | undefined) => {
      console.log(window.location.pathname);
      navigate(appState?.returnTo || window.location.pathname);
  };

  return (
    domain && clientId && redirectionUri && audience 
    ?
    <Auth0Provider
    domain={domain} 
    clientId={clientId}
    onRedirectCallback={onRedirectCallback}
    authorizationParams={{
      audience,
      redirect_uri: redirectionUri,
    }}  
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/callback" element={<CallbackPage />} />
        <Route path="/weatherprotected" element={<RequireAuthenticationForPage page={WeatherPage} />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </Auth0Provider>
    :
    <h1>Enviroment isn't properly configured</h1>
  );
}

export default App;
