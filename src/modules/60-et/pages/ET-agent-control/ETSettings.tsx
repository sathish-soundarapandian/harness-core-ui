/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Page, TabNavigation } from '@harness/uicore'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useStrings } from 'framework/strings'
import ScopedTitle from '@common/components/Title/ScopedTitle'

const ETSettings: React.FC = ({ children }) => {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  interface SettingsLink {
    label: string
    to: string
  }

  const settingsLinks: SettingsLink[] = [
    {
      label: 'Agents',
      to: routes.toETAgents({ accountId, orgIdentifier, projectIdentifier })
    },
    {
      label: 'Tokens',
      to: routes.toETAgentsTokens({ accountId, orgIdentifier, projectIdentifier })
    }
  ]

  settingsLinks.push({
    label: 'Critical Events',
    to: routes.toETCriticalEvents({ accountId, orgIdentifier, projectIdentifier })
  })

  useDocumentTitle(['ET', getString('common.codeErrorsSettings')])

  return (
    <>
      <Page.Header
        breadcrumbs={<NGBreadcrumbs />}
        title={<ScopedTitle title={getString('common.codeErrorsSettings')} />}
        toolbar={
          <TabNavigation size={'small'} links={settingsLinks.map(link => ({ label: link.label, to: link.to }))} />
        }
      />
      <Page.Body>{children}</Page.Body>
    </>
  )
}

export default ETSettings
