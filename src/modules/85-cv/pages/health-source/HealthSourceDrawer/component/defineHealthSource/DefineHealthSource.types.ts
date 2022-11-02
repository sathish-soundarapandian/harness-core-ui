/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseStringsReturn } from 'framework/strings'

export interface DefineHealthSourceFormInterface {
  healthSourceIdentifier: string
  healthSourceList: any[]
  dataSourceType?: string
  sourceType?: string
  connectorRef?: string
  region?: string
  workspaceId?: string
}

export interface ConnectorDisableFunctionProps {
  isEdit?: boolean
  connectorRef?: string
  sourceType?: string
  isDataSourceTypeSelectorEnabled?: boolean
  dataSourceType?: string
}

export interface FormValidationFunctionProps {
  values: DefineHealthSourceFormInterface
  isEdit?: boolean
  isDataSourceTypeSelectorEnabled?: boolean
  getString: UseStringsReturn['getString']
}

export interface DataSourceTypeValidateFunctionProps {
  isDataSourceTypeSelectorEnabled?: boolean
  sourceType?: string
  dataSourceType?: string
}
