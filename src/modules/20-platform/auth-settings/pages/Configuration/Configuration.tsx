/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { identity } from 'lodash-es'

import { Layout, Tabs, Tab, Text } from '@harness/uicore'

import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useQueryParamsState } from '@common/hooks/useQueryParamsState'
import Authentication from './Authentication'
import Allowlist from './Allowlist'
import css from './Configuration.module.scss'

export const VIEWS = {
  AUTHENTICATION: 'authentication',
  ALLOWLIST: 'allowlist'
}

const Configuration: React.FC = () => {
  const { getString } = useStrings()
  const { PL_IP_ALLOWLIST_NG } = useFeatureFlags()

  const [view, setView] = useQueryParamsState<string>('view', '', {
    serializer: identity,
    deserializer: identity
  })
  const defaultSelectedTabId = Object.values(VIEWS).includes(view) ? view : VIEWS.AUTHENTICATION

  return (
    <React.Fragment>
      <Page.Header breadcrumbs={<NGBreadcrumbs />} title={getString('authentication')} />
      <Page.Body className={css.configurationTabs}>
        <Layout.Horizontal>
          <Tabs
            id="configurationTabs"
            defaultSelectedTabId={defaultSelectedTabId}
            onChange={newTabId => {
              setView(newTabId as string)
            }}
          >
            <Tab
              id={VIEWS.AUTHENTICATION}
              title={<Text>{getString('authentication')}</Text>}
              panel={<Authentication />}
            />
            {PL_IP_ALLOWLIST_NG && (
              <Tab
                id={VIEWS.ALLOWLIST}
                title={<Text>{getString('authSettings.allowlist')}</Text>}
                panel={<Allowlist />}
              />
            )}
          </Tabs>
        </Layout.Horizontal>
      </Page.Body>
    </React.Fragment>
  )
}

export default Configuration
