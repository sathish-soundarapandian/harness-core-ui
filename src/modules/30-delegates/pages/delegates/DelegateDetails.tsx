/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Container, Layout, Text, IconName } from '@harness/uicore'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import type {
  ProjectPathProps,
  ModulePathParams,
  DelegatePathProps,
  AccountPathProps
} from '@common/interfaces/RouteInterfaces'
import { delegateTypeToIcon } from '@common/utils/delegateUtils'
import { useStrings } from 'framework/strings'
import { useGetDelegateGroupByIdentifier, useGetV2 } from 'services/portal'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import { DelegateOverview } from './DelegateOverview'
import css from './DelegateDetails.module.scss'

export default function DelegateDetails(): JSX.Element {
  const { delegateIdentifier, accountId, orgIdentifier, projectIdentifier, module } = useParams<
    Partial<ProjectPathProps & ModulePathParams> & DelegatePathProps & AccountPathProps
  >()
  const { getString } = useStrings()
  const { data } = useGetDelegateGroupByIdentifier({
    identifier: delegateIdentifier,
    queryParams: { accountId, orgId: orgIdentifier, projectId: projectIdentifier }
  })

  const breadcrumbs = [
    {
      label: getString('delegate.delegates'),
      url: routes.toDelegateList({
        accountId,
        orgIdentifier,
        projectIdentifier,
        module
      })
    }
  ]

  if (getScopeFromDTO({ accountId, orgIdentifier, projectIdentifier }) === Scope.ACCOUNT) {
    breadcrumbs.unshift({
      url: routes.toAccountResources({ accountId }),
      label: getString('common.accountResources')
    })
  }

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
  const icon: IconName = delegateTypeToIcon(delegate?.delegateType as string)

  const renderTitle = (): React.ReactNode => {
    return (
      <Layout.Vertical spacing="small">
        <Layout.Horizontal spacing="small">
          <NGBreadcrumbs links={breadcrumbs} />
        </Layout.Horizontal>
        <Text style={{ fontSize: '20px', color: 'var(--black)' }} icon={icon} iconProps={{ size: 21 }}>
          {delegate?.groupName}
        </Text>
      </Layout.Vertical>
    )
  }

  if (loading) {
    return (
      <Container
        style={{
          position: 'fixed',
          top: '0',
          left: '270px',
          width: 'calc(100% - 270px)',
          height: '100%'
        }}
      >
        <ContainerSpinner />
      </Container>
    )
  }

  if (error) {
    return <Page.Error message={error.message} onClick={() => refetch()} />
  }

  return (
    <>
      <Container
        height={116}
        padding={{ top: 'large', right: 'xlarge', bottom: 'large', left: 'xlarge' }}
        className={css.detailsContainer}
      >
        {renderTitle()}
      </Container>
      <Page.Body className={css.main}>
        <Layout.Vertical>
          <Layout.Horizontal spacing="large">
            <Container className={css.cardContainer}>
              {delegate && (
                <Layout.Vertical spacing="large" width="50%">
                  <DelegateOverview delegate={delegate} delegateProfile={delegateProfile} />
                </Layout.Vertical>
              )}
            </Container>
          </Layout.Horizontal>
        </Layout.Vertical>
      </Page.Body>
    </>
  )
}
