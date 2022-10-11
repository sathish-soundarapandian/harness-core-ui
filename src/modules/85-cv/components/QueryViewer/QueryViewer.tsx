/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import {
  Button,
  Container,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  Text
} from '@wings-software/uicore'
import { defaultTo, isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { MapGCPLogsToServiceFieldNames } from '@cv/pages/health-source/connectors/GCOLogsMonitoringSource/components/MapQueriesToHarnessService/constants'
import CVMultiTypeQuery from '../CVMultiTypeQuery/CVMultiTypeQuery'
import type { QueryViewerProps, QueryContentProps } from './types'
import { Records } from '../Records/Records'
import { QueryViewDialog } from './components/QueryViewDialog'
import css from './QueryViewer.module.scss'

export function QueryContent(props: QueryContentProps): JSX.Element {
  const {
    handleFetchRecords,
    query,
    loading,
    onClickExpand,
    onEditQuery,
    isDialogOpen,
    textAreaProps,
    textAreaName,
    isAutoFetch = false,
    mandatoryFields = [],
    staleRecordsWarning,
    textAreaPlaceholder,
    isTemplate,
    expressions,
    isConnectorRuntimeOrExpression,
    fetchButtonText,
    isFetchButtonDisabled = false
  } = props
  const { getString } = useStrings()

  useEffect(() => {
    if (!isEmpty(query) && mandatoryFields.every(v => v) && isAutoFetch && !isConnectorRuntimeOrExpression) {
      handleFetchRecords()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, isAutoFetch])

  return (
    <Container className={css.queryContainer}>
      {isTemplate ? (
        <>
          <Layout.Horizontal className={css.queryIcons} spacing="small">
            {onEditQuery && (
              <Button icon="Edit" iconProps={{ size: 12 }} className={css.action} onClick={() => onEditQuery()} />
            )}
          </Layout.Horizontal>
          <CVMultiTypeQuery
            name={textAreaName || MapGCPLogsToServiceFieldNames.QUERY}
            expressions={defaultTo(expressions, [])}
            fetchRecords={handleFetchRecords}
            disableFetchButton={isEmpty(query) || isConnectorRuntimeOrExpression || loading}
            allowedTypes={
              isConnectorRuntimeOrExpression
                ? [MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]
                : [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
            }
          />
        </>
      ) : (
        <>
          <Layout.Horizontal className={css.queryIcons} spacing="small">
            {onEditQuery && (
              <Button icon="Edit" iconProps={{ size: 12 }} className={css.action} onClick={() => onEditQuery()} />
            )}
            {onClickExpand && !isDialogOpen && (
              <Button
                icon="fullscreen"
                iconProps={{ size: 12 }}
                className={css.action}
                onClick={() => onClickExpand?.(true)}
              />
            )}
          </Layout.Horizontal>
          <FormInput.TextArea
            name={textAreaName || MapGCPLogsToServiceFieldNames.QUERY}
            textArea={textAreaProps}
            className={cx(css.formQueryBox)}
            placeholder={textAreaPlaceholder ?? ''}
          />
          {!isAutoFetch && (
            <Layout.Horizontal spacing={'large'}>
              <Button
                intent="primary"
                text={fetchButtonText || getString('cv.monitoringSources.gcoLogs.fetchRecords')}
                onClick={handleFetchRecords}
                disabled={isEmpty(query) || loading || isFetchButtonDisabled}
              />
              {staleRecordsWarning && <Text className={css.warningText}>{staleRecordsWarning}</Text>}
            </Layout.Horizontal>
          )}
        </>
      )}
    </Container>
  )
}

export function QueryViewer(props: QueryViewerProps): JSX.Element {
  const {
    className,
    records,
    fetchRecords,
    loading,
    error,
    query,
    isQueryExecuted,
    postFetchingRecords,
    queryNotExecutedMessage,
    queryTextAreaProps,
    staleRecordsWarning,
    isAutoFetch,
    queryContentMandatoryProps,
    queryLabel,
    recordsClassName,
    fetchEntityName,
    dataTooltipId,
    isTemplate,
    expressions,
    isConnectorRuntimeOrExpression,
    queryTextareaName
  } = props
  const { getString } = useStrings()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const isQueryRuntimeOrExpression = getMultiTypeFromValue(query) !== MultiTypeInputType.FIXED
  useEffect(() => {
    // if query exists then always fetch records on did mount
    if (query && !isConnectorRuntimeOrExpression && !isQueryRuntimeOrExpression) {
      fetchRecords()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFetchRecords = () => {
    fetchRecords()
    if (postFetchingRecords) {
      postFetchingRecords()
    }
  }

  return (
    <Container className={cx(css.main, className)}>
      {!isTemplate && (
        <Text className={css.labelText} tooltipProps={{ dataTooltipId }}>
          {queryLabel ?? getString('cv.query')}
        </Text>
      )}
      {isTemplate ? (
        <CVMultiTypeQuery
          name={MapGCPLogsToServiceFieldNames.QUERY}
          expressions={defaultTo(expressions, [])}
          fetchRecords={handleFetchRecords}
          disableFetchButton={isEmpty(query) || isConnectorRuntimeOrExpression || loading}
          allowedTypes={
            isConnectorRuntimeOrExpression
              ? [MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]
              : [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
          }
        />
      ) : (
        <QueryContent
          onClickExpand={setIsDialogOpen}
          query={query}
          isDialogOpen={isDialogOpen}
          loading={loading}
          handleFetchRecords={handleFetchRecords}
          textAreaProps={queryTextAreaProps}
          staleRecordsWarning={staleRecordsWarning}
          isAutoFetch={isAutoFetch}
          mandatoryFields={queryContentMandatoryProps}
          textAreaName={queryTextareaName}
        />
      )}

      <Records
        fetchRecords={handleFetchRecords}
        recordsClassName={recordsClassName}
        loading={loading}
        data={records}
        error={error}
        query={query}
        isQueryExecuted={isQueryRuntimeOrExpression ? !isQueryRuntimeOrExpression : isQueryExecuted}
        queryNotExecutedMessage={
          isConnectorRuntimeOrExpression
            ? getString('cv.customHealthSource.chartRuntimeWarning')
            : queryNotExecutedMessage
        }
        fetchEntityName={fetchEntityName}
      />
      <QueryViewDialog
        isOpen={isDialogOpen}
        onHide={() => setIsDialogOpen(false)}
        query={query}
        fetchRecords={handleFetchRecords}
        loading={loading}
        data={records}
        error={error}
        isQueryExecuted={isQueryExecuted}
      />
    </Container>
  )
}
