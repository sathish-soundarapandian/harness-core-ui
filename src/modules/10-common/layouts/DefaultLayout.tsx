/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import MainNav from '@common/navigation/MainNav'
import SideNav from '@common/navigation/SideNav'

import { useSidebar } from '@common/navigation/SidebarProvider'
import { useModuleInfo } from '@common/hooks/useModuleInfo'
import { TrialLicenseBanner } from '@common/layouts/TrialLicenseBanner'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { usePage } from '@common/pages/pageContext/PageProvider'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { ModuleName, moduleToModuleNameMapping } from 'framework/types/ModuleName'
import { GetLicensesAndSummaryQueryParams, useGetLicensesAndSummary } from 'services/cd-ng'
import FeatureBanner from './FeatureBanner'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import css from './layouts.module.scss'

export function DefaultLayout(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const { title, subtitle, icon, navComponent: NavComponent } = useSidebar()
  const { pageName } = usePage()
  const { module } = useModuleInfo()
  const moduleName: ModuleName = module ? moduleToModuleNameMapping[module] : ModuleName.COMMON
  const { trackPage, identifyUser } = useTelemetry()
  const { currentUserInfo } = useAppStore()
  const { accountId } = useParams<AccountPathProps>()
  const {
    data: limitData,
    loading: loadingLimit,
    error: limitError,
    refetch: refetchLimit
  } = useGetLicensesAndSummary({
    queryParams: { moduleType: moduleName as GetLicensesAndSummaryQueryParams['moduleType'] },
    accountIdentifier: accountId
  })
  useEffect(() => {
    if (pageName) {
      identifyUser(currentUserInfo.email)
      trackPage(pageName, { module: module || '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageName])

  return (
    <div className={css.main} data-layout="default">
      <MainNav />
      <SideNav title={title} subtitle={subtitle} icon={icon}>
        <NavComponent />
      </SideNav>
      <div className={css.rhs}>
        {module && (
          <TrialLicenseBanner data={limitData} loading={loadingLimit} refetch={refetchLimit} limitError={limitError} />
        )}
        {module && (
          <FeatureBanner data={limitData} loading={loadingLimit} refetch={refetchLimit} limitError={limitError} />
        )}
        <div className={css.children}>{props.children}</div>
      </div>
    </div>
  )
}
