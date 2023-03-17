/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Checkbox, Layout } from '@harness/uicore'
import { useStrings, StringKeys } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { DashboardTags, MappedDashboardTagOptions } from '@dashboards/types/DashboardTypes.types'
import { ModuleName } from 'framework/types/ModuleName'
import useNavModuleInfo from '@common/hooks/useNavModuleInfo'
import moduleTagCss from '@dashboards/common/ModuleTags.module.scss'

export interface ModuleTagsFilterProps {
  selectedFilter: MappedDashboardTagOptions
  setPredefinedFilter: (moduleName: DashboardTags, checked: boolean) => void
}

const ModuleTagsFilter: React.FC<ModuleTagsFilterProps> = ({ selectedFilter, setPredefinedFilter }) => {
  const { getString } = useStrings()
  const { CENG_ENABLED, CING_ENABLED, CFNG_ENABLED, CUSTOM_DASHBOARD_V2, CI_TI_DASHBOARDS_ENABLED } = useFeatureFlags()
  const { licenseInformation } = useLicenseStore()

  const renderTagsFilter = (
    moduleName: DashboardTags,
    cssClass: string,
    text: StringKeys,
    isEnabled = false
  ): React.ReactNode => {
    return (
      isEnabled && (
        <Layout.Horizontal flex={{ alignItems: 'center' }}>
          <Checkbox
            checked={selectedFilter[moduleName]}
            onChange={e => {
              setPredefinedFilter(moduleName, e.currentTarget.checked)
            }}
          />
          <div className={`${cssClass} ${moduleTagCss.moduleTag}`}>{getString(text)}</div>
        </Layout.Horizontal>
      )
    )
  }
  const { shouldVisible } = useNavModuleInfo(ModuleName.CD)
  return (
    <>
      {renderTagsFilter(DashboardTags.HARNESS, moduleTagCss.harnessTag, 'dashboards.modules.harness', true)}
      {renderTagsFilter(DashboardTags.CE, moduleTagCss.ceTag, 'common.purpose.ce.cloudCost', CENG_ENABLED)}
      {renderTagsFilter(DashboardTags.CI, moduleTagCss.ciTag, 'buildsText', CING_ENABLED || CI_TI_DASHBOARDS_ENABLED)}
      {renderTagsFilter(DashboardTags.CD, moduleTagCss.cdTag, 'deploymentsText', shouldVisible || CUSTOM_DASHBOARD_V2)}
      {renderTagsFilter(DashboardTags.CF, moduleTagCss.cfTag, 'common.purpose.cf.continuous', CFNG_ENABLED)}
      {renderTagsFilter(
        DashboardTags.STO,
        moduleTagCss.stoTag,
        'common.purpose.sto.continuous',
        licenseInformation['STO']?.status === 'ACTIVE'
      )}
    </>
  )
}

export default ModuleTagsFilter
