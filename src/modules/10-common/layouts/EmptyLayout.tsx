/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useModuleInfo } from '@common/hooks/useModuleInfo'
import { TrialLicenseBanner } from '@common/layouts/TrialLicenseBanner'
import FeatureBanner from './FeatureBanner'
import css from './layouts.module.scss'
import { ModuleName, moduleToModuleNameMapping } from 'framework/types/ModuleName'
import { fetchLicenseUseAndSummary } from '@common/hooks/getUsageAndLimitHelper'

export function EmptyLayout(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const { module } = useModuleInfo()
  const moduleName: ModuleName = module ? moduleToModuleNameMapping[module] : ModuleName.COMMON

  const {
    data: limitData,
    loading: loadingLimit,
    error: limitError,
    refetch: refetchLimit
  } = fetchLicenseUseAndSummary(moduleName)
  return (
    <div className={css.main} data-layout="empty">
      {module && (
        <TrialLicenseBanner data={limitData} loading={loadingLimit} refetch={refetchLimit} limitError={limitError} />
      )}
      {module && (
        <FeatureBanner data={limitData} loading={loadingLimit} refetch={refetchLimit} limitError={limitError} />
      )}
      <div className={css.children}>{props.children}</div>
    </div>
  )
}
