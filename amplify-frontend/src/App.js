// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, {useEffect, useState, Fragment} from "react";
import Amplify, {Auth, Hub} from "aws-amplify";
import {Container} from "react-bootstrap";

import Navigation from "./components/Navigation.js";
import FederatedSignIn from "./components/FederatedSignIn.js";
import MainRequest from "./components/MainRequest.js";
import "./App.css";

Amplify.configure({
  Auth: {
    region: "eu-west-2",
    userPoolId: "eu-west-2_n1QjnbLXa",
    userPoolWebClientId: "7vo8kh83puv302vm7mlhfup12r",
    oauth: {
      domain: "oidvap5657qsdreadoidvap5657qsdread.auth.eu-west-2.amazoncognito.com",
      scope: ["email", "openid", "aws.cognito.signin.user.admin", "profile"],
      redirectSignIn: "https://dev.d33j778sy3zkjh.amplifyapp.com",
      redirectSignOut: "https://dev.d33j778sy3zkjh.amplifyapp.com",
      responseType: "code"
    }
  },
  API: {
    endpoints: [
      {
        name: "MyBlogPostAPI",
        endpoint: "https://88et9mw53m.execute-api.eu-west-2.amazonaws.com/Dev"
      }
    ]
  }
});

const federatedIdName = "okta";

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    Hub.listen("auth", ({payload: {event, data}}) => {
      switch (event) {
        case "signIn":
        case "cognitoHostedUI":
          setToken("grating...");
          getToken().then(userToken => setToken(userToken.idToken.jwtToken));
          break;
        case "signOut":
          setToken(null);
          break;
        case "signIn_failure":
        case "cognitoHostedUI_failure":
          console.log("Sign in failure", data);
          break;
        default:
          break;
      }
    });
  }, []);

  function getToken() {
    return Auth.currentSession()
      .then(session => session)
      .catch(err => console.log(err));
  }

  return (
    <Fragment>
      <Navigation token={token} />
      <Container fluid>
        <br />
        {token ? (
          <MainRequest token={token} />
        ) : (
          <FederatedSignIn federatedIdName={federatedIdName} />
        )}
      </Container>
    </Fragment>
  );
}

export default App;
