/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { identity } from 'lodash-es'
import { useParams } from 'react-router-dom'

import { Layout, Tabs, Tab, Text } from '@harness/uicore'
import { Page } from '@common/exports'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import ScopedTitle from '@common/components/Title/ScopedTitle'
import { Scope } from '@common/interfaces/SecretsInterface'
import { useQueryParamsState } from '@common/hooks/useQueryParamsState'
import AuditLogs from './AuditLogs'
import AuditLogStreaming from './AuditLogStreaming'
import css from './AuditTrailsPage.module.scss'

export const VIEWS = {
  AUDIT_LOGS: 'auditLogs',
  AUDIT_LOG_STREAMING: 'auditLogStreaming'
}

const AuditTrailsPage: React.FC = () => {
  const { getString } = useStrings()
  const { PL_AUDIT_LOG_STREAMING_ENABLED: isAuditLogStreamingEnabled } = useFeatureFlags()
  const { orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [view, setView] = useQueryParamsState<string>('view', '', {
    serializer: identity,
    deserializer: identity
  })

  const auditTrailTitle = getString('common.auditTrail')
  const defaultSelectedTabId = Object.values(VIEWS).includes(view) ? view : VIEWS.AUDIT_LOGS
  const isOrgOrProjectScope = orgIdentifier || projectIdentifier
  const showAuditLogStreamingTab = isAuditLogStreamingEnabled && !isOrgOrProjectScope

  return (
    <>
      <Page.Header
        title={
          <ScopedTitle
            title={{
              [Scope.ACCOUNT]: auditTrailTitle,
              [Scope.PROJECT]: auditTrailTitle,
              [Scope.ORG]: auditTrailTitle
            }}
          />
        }
        breadcrumbs={<NGBreadcrumbs />}
      />

      <Page.Body>
        <Layout.Horizontal className={css.auditTabs}>
          <Tabs
            id="auditTabs"
            defaultSelectedTabId={defaultSelectedTabId}
            onChange={newTabId => {
              setView(newTabId as string)
            }}
          >
            <Tab id={VIEWS.AUDIT_LOGS} title={<Text>{getString('auditTrail.auditLogs')}</Text>} panel={<AuditLogs />} />
            {showAuditLogStreamingTab && (
              <Tab
                id={VIEWS.AUDIT_LOG_STREAMING}
                title={<Text>{getString('auditTrail.auditLogStreaming')}</Text>}
                panel={<AuditLogStreaming />}
              />
            )}
          </Tabs>
        </Layout.Horizontal>
      </Page.Body>
    </>
  )
}

export default AuditTrailsPage
