/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Checkbox, Layout } from '@harness/uicore'
import { useStrings, StringKeys } from 'framework/strings'
import { DashboardTags, MappedDashboardTagOptions } from '@dashboards/types/DashboardTypes.types'
import { useDashboardsContext } from '@dashboards/pages/DashboardsContext'
import moduleTagCss from '@dashboards/common/ModuleTags.module.scss'

export interface ModuleTagsFilterProps {
  selectedFilter: MappedDashboardTagOptions
  setPredefinedFilter: (moduleName: DashboardTags, checked: boolean) => void
}

const ModuleTagsFilter: React.FC<ModuleTagsFilterProps> = ({ selectedFilter, setPredefinedFilter }) => {
  const { getString } = useStrings()
  const { modelTags } = useDashboardsContext()

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

  return (
    <>
      {renderTagsFilter(DashboardTags.HARNESS, moduleTagCss.harnessTag, 'dashboards.modules.harness', true)}
      {renderTagsFilter(
        DashboardTags.CE,
        moduleTagCss.ceTag,
        'common.purpose.ce.cloudCost',
        modelTags.includes(DashboardTags.CE)
      )}
      {renderTagsFilter(DashboardTags.CI, moduleTagCss.ciTag, 'buildsText', modelTags.includes(DashboardTags.CI))}
      {renderTagsFilter(DashboardTags.CD, moduleTagCss.cdTag, 'deploymentsText', modelTags.includes(DashboardTags.CD))}
      {renderTagsFilter(
        DashboardTags.CF,
        moduleTagCss.cfTag,
        'common.purpose.cf.continuous',
        modelTags.includes(DashboardTags.CF)
      )}
      {renderTagsFilter(
        DashboardTags.CHAOS,
        moduleTagCss.chaosTag,
        'common.purpose.chaos.chaos',
        modelTags.includes(DashboardTags.CHAOS)
      )}
      {renderTagsFilter(
        DashboardTags.STO,
        moduleTagCss.stoTag,
        'common.purpose.sto.continuous',
        modelTags.includes(DashboardTags.STO)
      )}
      {renderTagsFilter(
        DashboardTags.SRM,
        moduleTagCss.srmTag,
        'common.purpose.cv.serviceReliability',
        modelTags.includes(DashboardTags.SRM)
      )}
    </>
  )
}

export default ModuleTagsFilter
