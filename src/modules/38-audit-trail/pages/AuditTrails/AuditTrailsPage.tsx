/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'

import { Layout, Tabs, Tab, Text } from '@harness/uicore'
import { Page } from '@common/exports'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import ScopedTitle from '@common/components/Title/ScopedTitle'
import { Scope } from '@common/interfaces/SecretsInterface'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { AuditTrailQueryParams, View, useAuditTrailQueryParamOptions } from '@audit-trail/utils/RequestUtil'
import AuditLogs from './AuditLogs'
import AuditLogStreaming from './AuditLogStreaming'
import css from './AuditTrailsPage.module.scss'

const AuditTrailsPage: React.FC = () => {
  const { getString } = useStrings()
  const { PL_AUDIT_LOG_STREAMING_ENABLED: isAuditLogStreamingEnabled } = useFeatureFlags()
  const { orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const queryParamOptions = useAuditTrailQueryParamOptions()
  const { view } = useQueryParams(queryParamOptions)
  const { updateQueryParams } = useUpdateQueryParams<AuditTrailQueryParams>()

  const auditTrailTitle = getString('common.auditTrail')
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
            selectedTabId={view}
            onChange={newTabId => {
              updateQueryParams({ page: 0, view: newTabId as View })
            }}
          >
            <Tab id={View.AUDIT_LOGS} title={<Text>{getString('auditTrail.auditLogs')}</Text>} panel={<AuditLogs />} />
            {showAuditLogStreamingTab && (
              <Tab
                id={View.AUDIT_LOG_STREAMING}
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
