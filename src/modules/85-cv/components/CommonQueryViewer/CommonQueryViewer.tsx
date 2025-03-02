/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useContext, useEffect, useMemo } from 'react'
import cx from 'classnames'
import { Container, getMultiTypeFromValue, MultiTypeInputType, Text, ButtonVariation } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { defaultTo, isEmpty } from 'lodash-es'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import { CustomMetricFormFieldNames } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import CustomMetricsSectionHeader from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/components/CustomMetricsSectionHeader'
import { useCommonHealthSource } from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/components/CommonHealthSourceContext/useCommonHealthSource'
import type { CommonCustomMetricFormikInterface } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import CVMultiTypeQuery from '../CVMultiTypeQuery/CVMultiTypeQuery'
import { CommonQueryViewDialog } from './components/CommonQueryViewerDialog/CommonQueryViewDialog'
import { CommonQueryContent } from './components/CommonQueryContent/CommonQueryContent'
import { SetupSourceTabsContext } from '../CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { CommonRecords } from '../CommonRecords/CommonRecords'
import type { CommonQueryViewerProps } from './types'
import { getIsQueryButtonDisabled, getRunQueryBtnTooltip, shouldShowCommonRecords } from './CommonQueryViewer.utils'

export function CommonQueryViewer(props: CommonQueryViewerProps): JSX.Element {
  const { values } = useFormikContext<CommonCustomMetricFormikInterface>()

  const {
    className,
    records,
    fetchRecords,
    loading,
    error,
    query,
    isQueryExecuted,
    postFetchingRecords,
    isConnectorRuntimeOrExpression,
    dataTooltipId,
    querySectionTitle,
    queryFieldIdentifier,
    healthSourceConfig
  } = props

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { getString } = useStrings()
  const { isTemplate, expressions } = useContext(SetupSourceTabsContext)
  const { updateHelperContext, isQueryRuntimeOrExpression } = useCommonHealthSource()
  const isQueryButtonDisabled = useMemo(() => {
    return getIsQueryButtonDisabled({ query, loading, queryFieldIdentifier, values })
  }, [loading, query, queryFieldIdentifier, values])

  const queryField = healthSourceConfig?.customMetrics?.queryAndRecords?.queryField
  const queryFieldValue = (queryField ? values[queryField.identifier] : '') as string

  const hideRecords = useMemo(() => {
    const queryFieldValueType = getMultiTypeFromValue(queryFieldValue)

    return queryField && queryFieldValueType !== MultiTypeInputType.FIXED
  }, [queryField, queryFieldValue])

  const runQueryBtnTooltip = useMemo(
    () => getRunQueryBtnTooltip(queryFieldIdentifier, values, query, getString),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, queryFieldIdentifier, values]
  )

  useEffect(() => {
    if (isTemplate) {
      const queryType = getMultiTypeFromValue(query)
      updateHelperContext({
        isQueryRuntimeOrExpression: queryType !== MultiTypeInputType.FIXED
      })
    }
  }, [])

  const handleFetchRecords = (): void => {
    fetchRecords()
    if (postFetchingRecords) {
      postFetchingRecords()
    }
  }

  const handleQueryTemplateTypeChange = (updatedType: MultiTypeInputType): void => {
    const isQueryTypeRuntimeOrExpression = updatedType !== MultiTypeInputType.FIXED
    updateHelperContext({ isQueryRuntimeOrExpression: isQueryTypeRuntimeOrExpression })
  }

  return (
    <Container className={cx(className)}>
      <CustomMetricsSectionHeader
        sectionTitle={getString('cv.monitoringSources.commonHealthSource.defineQuery')}
        sectionSubTitle={`
        ${querySectionTitle}
        
        ${getString('cv.monitoringSources.commonHealthSource.defineQuerySubDescription')}
        `}
      />

      {!isTemplate && (
        <Text font={{ variation: FontVariation.H6 }} margin={{ bottom: 'small' }} tooltipProps={{ dataTooltipId }}>
          {getString('cv.query')}
        </Text>
      )}
      {isTemplate ? (
        <CVMultiTypeQuery
          name={CustomMetricFormFieldNames.QUERY}
          expressions={defaultTo(expressions, [])}
          fetchRecords={handleFetchRecords}
          disableFetchButton={isEmpty(query) || isConnectorRuntimeOrExpression || loading}
          onTypeChange={handleQueryTemplateTypeChange}
          allowedTypes={
            isConnectorRuntimeOrExpression
              ? [MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]
              : [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
          }
          fetchButtonProps={{
            text: getString('cv.monitoringSources.commonHealthSource.runQuery'),
            variation: ButtonVariation.SECONDARY
          }}
          hideFetchButton={hideRecords}
          runQueryBtnTooltip={runQueryBtnTooltip}
        />
      ) : (
        <CommonQueryContent
          onClickExpand={setIsDialogOpen}
          query={query}
          isDialogOpen={isDialogOpen}
          loading={loading}
          handleFetchRecords={handleFetchRecords}
          isQueryButtonDisabled={isQueryButtonDisabled}
          runQueryBtnTooltip={runQueryBtnTooltip}
        />
      )}
      {shouldShowCommonRecords({ hideRecords, isConnectorRuntimeOrExpression, isQueryRuntimeOrExpression }) ? (
        <CommonRecords
          fetchRecords={handleFetchRecords}
          loading={loading}
          data={records}
          error={error}
          query={query}
          isQueryExecuted={isQueryExecuted}
        />
      ) : null}
      <CommonQueryViewDialog
        isOpen={isDialogOpen}
        onHide={() => setIsDialogOpen(false)}
        query={query}
        fetchRecords={handleFetchRecords}
        loading={loading}
        data={records}
        error={error}
        isQueryExecuted={isQueryExecuted}
        isQueryButtonDisabled={isQueryButtonDisabled}
        runQueryBtnTooltip={runQueryBtnTooltip}
      />
    </Container>
  )
}
