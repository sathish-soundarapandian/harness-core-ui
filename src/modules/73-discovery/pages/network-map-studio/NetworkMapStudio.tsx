/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Icon, Tab, Tabs } from '@harness/uicore'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'

import { useStrings } from 'framework/strings'

import { Page } from '@common/exports'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { getLinkForAccountResources } from '@common/utils/BreadcrumbUtils'
import { Scope } from '@common/interfaces/SecretsInterface'
import routes from '@common/RouteDefinitions'
import ScopedTitle from '@common/components/Title/ScopedTitle'
import { accountPathProps } from '@common/utils/routeUtils'
import Overview from './views/Overview'
import css from './NetworkMapStudio.module.scss'

enum StudioTabs {
  OVERVIEW = 'Overview',
  SELECT_SERVICES = 'Select Services',
  CONFIGURE_RELATIONS = 'Configure Relations'
}

const NetworkMapStudio: React.FC = () => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & ModulePathParams>()
  const { getString } = useStrings()
  const history = useHistory()
  const createNetworkMapLabel = 'Create Network Map'

  useDocumentTitle(createNetworkMapLabel)

  const handleTabChange = (tabID: StudioTabs): void => {
    switch (tabID) {
      case StudioTabs.OVERVIEW:
        history.push(routes.toNetworkMapOverview({ ...accountPathProps }))
        break
      case StudioTabs.SELECT_SERVICES:
        history.push(routes.toNetworkMapOverview({ ...accountPathProps }))
        break
      case StudioTabs.CONFIGURE_RELATIONS:
        history.push(routes.toNetworkMapOverview({ ...accountPathProps }))
        break
    }
  }

  return (
    <>
      <Page.Header
        breadcrumbs={
          <NGBreadcrumbs
            links={getLinkForAccountResources({ accountId, orgIdentifier, projectIdentifier, getString })}
          />
        }
        title={
          <ScopedTitle
            title={{
              [Scope.PROJECT]: createNetworkMapLabel,
              [Scope.ORG]: createNetworkMapLabel,
              [Scope.ACCOUNT]: createNetworkMapLabel
            }}
          />
        }
      />

      <Page.Body className={css.listBody}>
        <section className={css.setupShell}>
          <Tabs id="networkMapTabs" onChange={handleTabChange} selectedTabId={StudioTabs.OVERVIEW}>
            <Tab id={StudioTabs.OVERVIEW} panel={<Overview />} title={getString('overview')} />
            <Icon
              name="chevron-right"
              height={20}
              size={20}
              margin={{ right: 'small', left: 'small' }}
              color={'grey400'}
              style={{ alignSelf: 'center' }}
            />
            <Tab
              id={StudioTabs.SELECT_SERVICES}
              panel={<>Select Services</>}
              title={getString('discovery.tabs.selectServices')}
            />
            <Icon
              name="chevron-right"
              height={20}
              size={20}
              margin={{ right: 'small', left: 'small' }}
              color={'grey400'}
              style={{ alignSelf: 'center' }}
            />
            <Tab
              id={StudioTabs.CONFIGURE_RELATIONS}
              panel={<>Configure Relations</>}
              title={getString('discovery.tabs.configureRelations')}
            />
          </Tabs>
        </section>
      </Page.Body>
    </>
  )
}

export default NetworkMapStudio
