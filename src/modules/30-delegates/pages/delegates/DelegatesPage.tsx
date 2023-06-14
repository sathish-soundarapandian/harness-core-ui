/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { Button, ButtonSize, ButtonVariation, Layout, TabNavigation, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Callout } from '@blueprintjs/core'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { Page } from '@common/exports'
import ScopedTitle from '@common/components/Title/ScopedTitle'
import { Scope } from '@common/interfaces/SecretsInterface'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { getLinkForAccountResources } from '@common/utils/BreadcrumbUtils'
import type { GetDelegateGroupsNGV2WithFilterQueryParams } from 'services/portal'
import { useListDelegateConfigsNgV2WithFilter } from 'services/cd-ng'
import type { DelegateProfileDetailsNg } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useLocalStorage } from '@common/hooks'
import css from './DelegatesPage.module.scss'

const DelegatesPage: React.FC = ({ children }) => {
  const params = useParams<PipelineType<ProjectPathProps>>()
  const { accountId, orgIdentifier, projectIdentifier, module } = params
  const { getString } = useStrings()
  const { pathname } = useLocation()
  const [profiles, setProfiles] = useState<DelegateProfileDetailsNg[]>([])
  const { PL_HELM2_DELEGATE_BANNER } = useFeatureFlags()
  const [isBannerDismissed, setIsBannerDismissed] = useLocalStorage<boolean | undefined>(
    'helmv2_deprecation_banner_dismissed',
    !PL_HELM2_DELEGATE_BANNER,
    window.sessionStorage
  )
  const isDelTokensPage =
    pathname.indexOf(
      routes.toDelegateTokens({ accountId: params.accountId, orgIdentifier, projectIdentifier, module })
    ) !== -1

  const { mutate: getDelegateProfiles } = useListDelegateConfigsNgV2WithFilter({
    accountId,
    queryParams: { orgId: orgIdentifier, projectId: projectIdentifier }
  })

  const getDelegates = async () => {
    const delProfilesResponse = await getDelegateProfiles(
      {
        filterType: 'DelegateProfile'
      },
      {
        queryParams: {
          accountId,
          module,
          pageSize: 10,
          searchTerm: ''
        } as GetDelegateGroupsNGV2WithFilterQueryParams
      }
    )
    const resource = delProfilesResponse?.resource as any
    setProfiles(resource?.response || [])
  }

  useEffect(() => {
    getDelegates()
  }, [getDelegateProfiles])

  const links = [
    {
      label: getString('delegate.delegates'),
      to: routes.toDelegateList({ accountId, orgIdentifier, projectIdentifier, module })
    }
  ]
  if (profiles.length > 0) {
    links.push({
      label: getString('delegate.delegateConfigurations'),
      to: routes.toDelegateConfigs({ accountId, orgIdentifier, projectIdentifier, module })
    })
  }
  links.push({
    label: getString('common.tokens'),
    to: routes.toDelegateTokens({ accountId, orgIdentifier, projectIdentifier, module })
  })

  return (
    <>
      {!isBannerDismissed && (
        <Callout className={css.callout} intent="warning" icon={null}>
          <Layout.Horizontal flex={{ justifyContent: 'flex-start' }}>
            <Text color={Color.BLACK}>
              Harness will be deprecating the Helm 2 Binary by July 30th. Please reach out to our support team -&nbsp;
              <a href="mailto:support.harness.io">support.harness.io</a>
              &nbsp;for any questions or concerns. For the formal notice, please see our&nbsp;
              <a href="https://developer.harness.io" target="_blank" rel="noreferrer">
                docs
              </a>
            </Text>
          </Layout.Horizontal>
          <Button
            aria-label={getString('close')}
            variation={ButtonVariation.ICON}
            size={ButtonSize.LARGE}
            icon="cross"
            onClick={() => setIsBannerDismissed(true)}
          />
        </Callout>
      )}
      <Page.Header
        breadcrumbs={
          <NGBreadcrumbs
            links={getLinkForAccountResources({ accountId, orgIdentifier, projectIdentifier, getString })}
          />
        }
        title={
          <ScopedTitle
            title={{
              [Scope.PROJECT]: isDelTokensPage
                ? getString('delegates.tokens.delegateTokens')
                : getString('delegate.delegates'),
              [Scope.ORG]: isDelTokensPage
                ? getString('delegates.tokens.delegateTokensTitle')
                : getString('delegates.delegatesTitle'),
              [Scope.ACCOUNT]: isDelTokensPage
                ? getString('delegates.tokens.delegateTokensTitle')
                : getString('delegates.delegatesTitle')
            }}
          />
        }
        toolbar={<TabNavigation size={'small'} links={links} />}
      />
      <Page.Body>{children}</Page.Body>
    </>
  )
}

export default DelegatesPage
