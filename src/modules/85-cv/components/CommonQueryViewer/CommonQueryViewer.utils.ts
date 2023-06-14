/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isEmpty } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings'
import type { CommonCustomMetricFormikInterface } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import { getRunQueryButtonTooltip } from './components/CommonQueryContent/CommonQueryContent.utils'

export function getIsQueryButtonDisabled({
  query,
  loading,
  queryFieldIdentifier,
  values
}: {
  query: string
  loading: boolean
  queryFieldIdentifier: string | undefined
  values: CommonCustomMetricFormikInterface
}): boolean {
  return Boolean(isEmpty(query) || loading || getIsQueryFieldNotPresent(queryFieldIdentifier, values))
}

export function getIsQueryFieldNotPresent(
  queryFieldIdentifier: string | undefined,
  values: CommonCustomMetricFormikInterface
): boolean {
  return Boolean(queryFieldIdentifier && !values[queryFieldIdentifier as keyof CommonCustomMetricFormikInterface])
}

export function getRunQueryBtnTooltip(
  queryFieldIdentifier: string | undefined,
  values: CommonCustomMetricFormikInterface,
  query: string,
  getString: UseStringsReturn['getString']
): string {
  const isQueryFieldNotPresent = getIsQueryFieldNotPresent(queryFieldIdentifier, values)
  const tooltipMessage = getRunQueryButtonTooltip(query, isQueryFieldNotPresent, queryFieldIdentifier, getString)
  return tooltipMessage
}

export const shouldShowCommonRecords = ({
  isQueryRuntimeOrExpression,
  isConnectorRuntimeOrExpression,
  hideRecords
}: {
  isQueryRuntimeOrExpression?: boolean
  isConnectorRuntimeOrExpression?: boolean
  hideRecords?: boolean
}): boolean => {
  return !(isQueryRuntimeOrExpression || isConnectorRuntimeOrExpression) && !hideRecords
}
