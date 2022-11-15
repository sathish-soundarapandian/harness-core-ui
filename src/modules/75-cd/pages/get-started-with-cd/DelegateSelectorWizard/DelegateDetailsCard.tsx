/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Container, Layout, PageError, PageSpinner } from '@harness/uicore'
import type {
  ProjectPathProps,
  ModulePathParams,
  DelegatePathProps,
  AccountPathProps
} from '@common/interfaces/RouteInterfaces'
import { useGetDelegateGroupByIdentifier, useGetV2 } from 'services/portal'
import { DelegateOverview } from '@delegates/pages/delegates/DelegateOverview'
import css from '../DeployProvisioningWizard/DeployProvisioningWizard.module.scss'

const DelegateDetailsCard = ({ delegateIdentifier }: { delegateIdentifier: string }): JSX.Element => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<
    Partial<ProjectPathProps & ModulePathParams> & DelegatePathProps & AccountPathProps
  >()

  const { data } = useGetDelegateGroupByIdentifier({
    identifier: delegateIdentifier,
    queryParams: { accountId, orgId: orgIdentifier, projectId: projectIdentifier }
  })

  const delegate = data?.resource
  const {
    loading,
    error,
    data: profileResponse,
    refetch
  } = useGetV2({
    delegateProfileId: delegate?.delegateConfigurationId || '',
    queryParams: { accountId }
  })
  const delegateProfile = delegate?.delegateConfigurationId ? profileResponse?.resource : undefined

  if (error) {
    return <PageError message={error.message} onClick={() => refetch()} />
  }

  return (
    <Layout.Vertical width="100%">
      {loading ? (
        <PageSpinner />
      ) : (
        <Layout.Horizontal spacing="large">
          <Container flex width="100%">
            {delegate && (
              <Layout.Vertical spacing="large" width="80%">
                <DelegateOverview
                  delegate={delegate}
                  delegateProfile={delegateProfile}
                  showConnectivityStatus={true}
                  className={css.delegateOverviewWrapper}
                />
              </Layout.Vertical>
            )}
          </Container>
        </Layout.Horizontal>
      )}
    </Layout.Vertical>
  )
}

export default DelegateDetailsCard
