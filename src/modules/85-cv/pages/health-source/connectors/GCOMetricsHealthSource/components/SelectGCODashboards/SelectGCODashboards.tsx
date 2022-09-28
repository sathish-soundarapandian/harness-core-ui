/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useContext, useMemo } from 'react'
import { StackdriverDashboardDTO, useGetStackdriverDashboards } from 'services/cv'

import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import MetricsDashboardList from '@cv/components/MetricsDashboardList/MetricsDashboardList'
import type { TableDashboardItem } from '@cv/components/MetricsDashboardList/MetricsDashboardList.type'
import { getSelectedDashboards } from '../../GCOMetricsHealthSource.utils'
import type { SelectGCODashboardsInterface } from './SelectGCODashboards.types'

export function SelectGCODashboards({ isTemplate, expressions }: SelectGCODashboardsInterface): JSX.Element {
  const { sourceData } = useContext(SetupSourceTabsContext)
  const dashboardItemMapper: (dashboard: StackdriverDashboardDTO & { id?: string }) => TableDashboardItem = useCallback(
    dashboard => {
      const { name = '', path = '', id = '' } = dashboard
      return {
        name: name,
        id: path || id
      }
    },
    []
  )

  const selectedDashboards = useMemo(() => {
    return sourceData.selectedDashboards || getSelectedDashboards(sourceData)
  }, [sourceData])
  return (
    <MetricsDashboardList<StackdriverDashboardDTO>
      manualQueryInputTitle={'cv.monitoringSources.gco.manualInputQueryModal.modalTitle'}
      dashboardsRequest={useGetStackdriverDashboards({ lazy: true })}
      defaultItemIcon={'service-stackdriver'}
      tableTitle={'cv.monitoringSources.gco.selectDashboardsPage.dashboardColumnName'}
      selectedDashboardList={selectedDashboards || []}
      tableItemMapper={dashboardItemMapper}
      isTemplate={isTemplate}
      expressions={expressions}
    />
  )
}
