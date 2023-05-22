/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Redirect, useLocation, useParams } from 'react-router-dom'
import { useGetStatusInfoByTypeQuery } from '@harnessio/react-idp-service-client'
import { isEmpty } from 'lodash-es'
import routes from '@common/RouteDefinitions'
import { RouteWithLayout } from '@common/router'
import { accountPathProps } from '@common/utils/routeUtils'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import { useGetUserGroupAggregateList } from 'services/cd-ng'
import { MinimalLayout } from '@common/layouts'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import { ConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { MultiTypeSecretInput } from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { String } from 'framework/strings'
import RbacFactory from '@rbac/factories/RbacFactory'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import IDPAdminSideNav from './components/IDPAdminSideNav/IDPAdminSideNav'
import type { IDPCustomMicroFrontendProps } from './interfaces/IDPCustomMicroFrontendProps.types'
import './idp.module.scss'

// eslint-disable-next-line import/no-unresolved
const IDPMicroFrontend = React.lazy(() => import('idp/MicroFrontendApp'))

// eslint-disable-next-line import/no-unresolved
const IDPAdminMicroFrontend = React.lazy(() => import('idpadmin/MicroFrontendApp'))

const IDPAdminSideNavProps: SidebarContext = {
  navComponent: IDPAdminSideNav,
  subtitle: 'Internal Developer',
  title: 'Portal',
  icon: 'idp'
}

function RedirectToIDPDefaultPath(): React.ReactElement {
  const params = useParams<AccountPathProps>()
  const location = useLocation()

  const { data } = useGetStatusInfoByTypeQuery(
    { type: 'onboarding' },
    {
      enabled: location.pathname.includes('/idp-default'),
      staleTime: 15 * 60 * 1000
    }
  )
  const onboardingStatus = data?.content?.status?.current_status

  if (!isEmpty(onboardingStatus)) {
    if (onboardingStatus === 'COMPLETED') {
      return <Redirect to={routes.toIDP(params)} />
    }
    return <Redirect to={routes.toIDPAdmin(params)} />
  }
  return <></>
}

function IDPRoutes(): React.ReactElement {
  const isIDPEnabled = useFeatureFlag(FeatureFlag.IDP_ENABLED)

  if (isIDPEnabled) {
    RbacFactory.registerResourceTypeHandler(ResourceType.IDP_SETTINGS, {
      icon: 'idp',
      label: 'common.purpose.idp.name',
      labelSingular: 'common.purpose.idp.name',
      permissionLabels: {
        [PermissionIdentifier.IDP_SETTINGS_MANAGE]: <String stringID="rbac.permissionLabels.manage" />
      }
    })
  }

  return (
    <>
      <RouteWithLayout path={routes.toIDPDefaultPath({ ...accountPathProps })} layout={MinimalLayout}>
        <RedirectToIDPDefaultPath />
      </RouteWithLayout>

      <RouteWithLayout path={routes.toIDP({ ...accountPathProps })} layout={MinimalLayout}>
        <ChildAppMounter ChildApp={IDPMicroFrontend} />
      </RouteWithLayout>

      <RouteWithLayout
        path={[routes.toIDPAdmin({ ...accountPathProps })]}
        pageName={PAGE_NAME.IDPAdminPage}
        sidebarProps={IDPAdminSideNavProps}
      >
        <ChildAppMounter<IDPCustomMicroFrontendProps>
          ChildApp={IDPAdminMicroFrontend}
          customComponents={{ ConnectorReferenceField, MultiTypeSecretInput }}
          customHooks={{ useQueryParams, useUpdateQueryParams }}
          idpServices={{ useGetUserGroupAggregateList }}
        />
      </RouteWithLayout>
    </>
  )
}

export default IDPRoutes
