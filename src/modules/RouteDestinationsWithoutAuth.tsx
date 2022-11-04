/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Route, Switch, Redirect, useHistory } from 'react-router-dom'
import NotFoundPage from '@common/pages/404/NotFoundPage'
import routes from '@common/RouteDefinitions'
import SessionToken from 'framework/utils/SessionToken'
import LoginPage from '@common/pages/login/LoginPage'
import SignupPage from '@common/pages/signup/SignupPage'
import { getLoginPageURL } from 'framework/utils/SessionUtils'
import RedirectPage from '@common/pages/redirect/Redirect'
import { accountPathProps, executionPathProps, returnUrlParams } from '@common/utils/routeUtils'

const RedirectToHome: React.FC = () => {
  const history = useHistory()
  const accountId = SessionToken.accountId()
  if (accountId) {
    return <Redirect to={routes.toMainDashboard({ accountId })} />
  } else {
    history.push({ pathname: routes.toRedirect(), search: returnUrlParams(getLoginPageURL({})) })
    return null
  }
}

const RouteDestinationsWithoutAuth: React.FC = () => {
  console.log(
    routes.toPublicExecutionPipelineView({ ...accountPathProps, ...executionPathProps, module: ':module(ci)' })
  )
  return (
    <Switch>
      <Route exact path="/">
        <RedirectToHome />
      </Route>
      <Route
        path={routes.toPublicExecutionPipelineView({
          ...accountPathProps,
          ...executionPathProps,
          module: ':module(ci)'
        })}
      >
        <div>hello public pipeline</div>
      </Route>
      {__DEV__ ? (
        <Route path={routes.toLogin()}>
          <LoginPage />
        </Route>
      ) : null}
      {__DEV__ ? (
        <Route path={routes.toSignup()}>
          <SignupPage />
        </Route>
      ) : null}
      <Route path={routes.toRedirect()}>
        <RedirectPage />
      </Route>
      <Route path="*">
        <NotFoundPage />
      </Route>
    </Switch>
  )
}

export default RouteDestinationsWithoutAuth
