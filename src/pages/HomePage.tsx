import React, { useEffect, useState } from 'react';
import { useAuth0 } from "@auth0/auth0-react"
import logo from '../logo.svg';
import '../App.css';
import { NavLink, useNavigate } from 'react-router-dom';

export default function HomePage() {
  //const [token, setToken] = useState<string | null>(null);
  //const [needToRedirect, setNeedToRedirect] = useState(false);

  const navigate = useNavigate();
  const { loginWithRedirect, logout, getAccessTokenSilently } = useAuth0();

  const redirectionUrl = window.location.pathname + "chat";

  useEffect(() => {
    async function checkRedirect() {
      let token;

      try {
        token = await getAccessTokenSilently();
      } catch (error) {
        token = undefined;
      }

      if (token) {
        //setNeedToRedirect(true);
        navigate(redirectionUrl);
      } else {
        loginWithRedirect({
          appState: {
            returnTo: redirectionUrl
          }
        })
      }
    }

    checkRedirect();
  }, []);
  
  /*if (needToRedirect) {
    console.log(needToRedirect);
    console.log(redirectionUrl);
    //return redirect("/login");
    navigate(redirectionUrl);
    //return <NavLink to={redirectionUrl} />
  }*/

  /*return (
      <div className="App">
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <p>
        Edit <code>src/App.tsx</code> and save to reload.
      </p>
      <a
        className="App-link"
        href="https://reactjs.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn React
      </a>
      <button onClick={async function () { await loginWithRedirect({
        appState: {
          returnTo: window.location.pathname
        }
      }) }}>Log in</button>
      <button onClick={function () { logout({
        logoutParams: {
          returnTo: window.location.origin,
        },
      }) }}>Log out</button>
    </header>
  </div>
  )*/
  return (
    <h1>Loading...</h1>
  )
};