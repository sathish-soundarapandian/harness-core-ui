/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter, Route, Switch } from 'react-router-dom'

import languageLoader from 'strings/languageLoader'
import type { LangLocale } from 'strings/languageLoader'

import { AppWithAuthentication, AppWithoutAuthentication } from './App'

const ignoredErrorClasses = ['YAMLSemanticError', 'YAMLSyntaxError', 'AbortError']

export default async function render(): Promise<void> {
  const lang: LangLocale = 'en'
  const strings = await languageLoader(lang)

  if (window.bugsnagToken && typeof Bugsnag !== 'undefined' && Bugsnag.start && window.deploymentType === 'SAAS') {
    window.bugsnagClient = Bugsnag.start({
      apiKey: window.bugsnagToken,
      appVersion: __BUGSNAG_RELEASE_VERSION__,
      releaseStage: `ng-ui-${window.location.hostname.split('.')[0]}`,
      onError: (event: any): boolean => {
        if (Array.isArray(event.errors) && ignoredErrorClasses.includes(event.errors[0]?.errorClass)) {
          return false
        }

        return true
      }
    })
  }

  ReactDOM.render(
    <HashRouter>
      <Switch>
        <Route
          path={[
            // this path is needed for AppStoreProvider to populate accountId, orgId and projectId
            '/account/:accountId/:module/orgs/:orgIdentifier/projects/:projectIdentifier',
            '/account/:accountId/orgs/:orgIdentifier/projects/:projectIdentifier',
            '/account/:accountId/settings/organizations/:orgIdentifier/',
            '/account/:accountId'
          ]}
        >
          <AppWithAuthentication strings={strings} />
        </Route>
        <Route path="/">
          <AppWithoutAuthentication strings={strings} />
        </Route>
      </Switch>
    </HashRouter>,
    document.getElementById('react-root')
  )
}

render()
