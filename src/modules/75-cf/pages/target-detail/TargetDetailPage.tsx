/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { useParams } from 'react-router-dom'
import { Tabs } from '@harness/uicore'
import { Target, useGetTarget } from 'services/cf'
import { useGetEnvironment } from 'services/cd-ng'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import TargetManagementDetailPageTemplate from '@cf/components/TargetManagementDetailPageTemplate/TargetManagementDetailPageTemplate'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { Page } from '@common/exports'
import { useQueryParamsState } from '@common/hooks/useQueryParamsState'
import LeftBar from './components/LeftBar/LeftBar'
import FlagSettings from './components/FlagSettings/FlagSettings'
import FlagEvaluations from './components/FlagEvaluations/FlagEvaluations'
import useDeleteTargetDialog from './hooks/useDeleteTargetDialog'

import css from '@cf/pages/target-group-detail/TargetGroupDetailPage.module.scss'

const TargetDetailPage: FC = () => {
  const [selectedTab, setSelectedTab] = useQueryParamsState<string>('tab', 'overrides')

  const { activeEnvironment: environmentIdentifier } = useActiveEnvironment()
  const {
    accountId: accountIdentifier,
    orgIdentifier,
    projectIdentifier,
    targetIdentifier
  } = useParams<Record<string, string>>()

  const {
    data: target,
    loading: targetLoading,
    error: targetError,
    refetch: refetchTarget
  } = useGetTarget({
    identifier: targetIdentifier,
    queryParams: {
      accountIdentifier,
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier
    }
  })

  const {
    data: envData,
    loading: envLoading,
    error: envError,
    refetch: refetchEnv
  } = useGetEnvironment({
    environmentIdentifier,
    queryParams: {
      accountId: accountIdentifier,
      orgIdentifier,
      projectIdentifier
    }
  })

  const deleteTargetDialog = useDeleteTargetDialog(target as Target)

  if (targetLoading || envLoading) {
    return <ContainerSpinner flex={{ align: 'center-center' }} />
  }

  if (targetError || envError) {
    return (
      <Page.Error
        message={targetError?.message || envError?.message}
        onClick={async () => {
          await Promise.all([refetchTarget(), refetchEnv()])
        }}
      />
    )
  }

  return (
    <TargetManagementDetailPageTemplate
      item={target as Target}
      openDeleteDialog={deleteTargetDialog}
      metaData={{ environment: envData?.data?.name as string }}
      leftBar={<LeftBar target={target as Target} />}
    >
      <div className={css.tabs}>
        <Tabs
          id="TargetDetailTabs"
          selectedTabId={selectedTab}
          onChange={setSelectedTab}
          tabList={[
            {
              id: 'overrides',
              title: 'Overrides',
              panel: <FlagSettings target={target as Target} />,
              panelClassName: css.panel
            },
            {
              id: 'evaluations',
              title: 'Evaluations',
              panel: <FlagEvaluations target={target as Target} />,
              panelClassName: css.panel
            }
          ]}
        />
      </div>
    </TargetManagementDetailPageTemplate>
  )
}

export default TargetDetailPage
