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
import moduleTagCss from '@dashboards/common/ModuleTags.module.scss'

export interface ModuleTagsFilterProps {
  selectedFilter: Record<string, boolean>
  setPredefinedFilter: (moduleName: string, checked: boolean) => void
}

const ModuleTagsFilter: React.FC<ModuleTagsFilterProps> = ({ selectedFilter, setPredefinedFilter }) => {
  const { getString } = useStrings()
  const { CENG_ENABLED, CING_ENABLED, CDNG_ENABLED, CFNG_ENABLED, CUSTOM_DASHBOARD_V2 } = useFeatureFlags()

  const renderTagsFilter = (moduleName: string, cssClass: string, text: StringKeys, isEnabled = false) => {
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

  return (
    <>
      {renderTagsFilter('HARNESS', moduleTagCss.harnessTag, 'dashboards.modules.harness', true)}
      {renderTagsFilter('CE', moduleTagCss.ceTag, 'common.purpose.ce.cloudCost', CENG_ENABLED)}
      {renderTagsFilter('CI', moduleTagCss.ciTag, 'buildsText', CING_ENABLED)}
      {renderTagsFilter('CD', moduleTagCss.cdTag, 'deploymentsText', CDNG_ENABLED)}
      {renderTagsFilter('CF', moduleTagCss.cfTag, 'common.purpose.cf.continuous', CFNG_ENABLED)}
      {renderTagsFilter('CG_CD', moduleTagCss.cgCdTag, 'dashboards.modules.cgDeployments', CUSTOM_DASHBOARD_V2)}
    </>
  )
}

export default ModuleTagsFilter
