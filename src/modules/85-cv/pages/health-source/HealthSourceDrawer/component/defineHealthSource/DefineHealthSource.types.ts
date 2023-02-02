/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import type { MetricDashboardItem } from '@cv/components/MetricDashboardWidgetNav/MetricDashboardWidgetNav.type'
import type { CommonHealthSourceConfigurations } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import type { UseStringsReturn } from 'framework/strings'
import type { ConnectorConfigureOptionsProps } from '@connectors/components/ConnectorConfigureOptions/ConnectorConfigureOptions'

export interface DefineHealthSourceFormInterface extends CommonHealthSourceConfigurations {
  healthSourceIdentifier: string
  healthSourceName: string
  healthSourceList: any[]
  identifier: string
  product: SelectOption
  dataSourceType?: string
  sourceType?: string
  connectorRef: string | ConnectorConfigureOptionsProps
  region?: string
  workspaceId?: string
  serviceRef: string
  environmentRef: string
  selectedDashboards?: Map<string, MetricDashboardItem>
}

export interface ConnectorDisableFunctionProps {
  isEdit?: boolean
  connectorRef?: string
  sourceType?: string
  dataSourceType?: string
}

export interface FormValidationFunctionProps {
  values: DefineHealthSourceFormInterface
  isEdit?: boolean
  getString: UseStringsReturn['getString']
}

export interface DataSourceTypeValidateFunctionProps {
  sourceType?: string
  dataSourceType?: string
}

export interface GetDataSourceTypeParams {
  type?: string
  dataSourceType?: string
}
