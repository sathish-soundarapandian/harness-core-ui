/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import MainNav from '@common/navigation/MainNav'
import { useModuleInfo } from '@common/hooks/useModuleInfo'
import { TrialLicenseBanner } from '@common/layouts/TrialLicenseBanner'
import { useFetchLicenseUseAndSummary } from '@common/hooks/getUsageAndLimitHelper'
import FeatureBanner from './FeatureBanner'
import css from './layouts.module.scss'
import { ModuleName, moduleToModuleNameMapping } from 'framework/types/ModuleName'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'

export function MinimalLayout(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const { module } = useModuleInfo()
  const moduleName: ModuleName = module ? moduleToModuleNameMapping[module] : ModuleName.COMMON
  const { accountId } = useParams<AccountPathProps>()
  const {
    data: limitData,
    loading: loadingLimit,
    error: limitError,
    refetch: refetchLimit
  } = useFetchLicenseUseAndSummary(moduleName, accountId)
  return (
    <div className={css.main} data-layout="minimal">
      <MainNav />
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
