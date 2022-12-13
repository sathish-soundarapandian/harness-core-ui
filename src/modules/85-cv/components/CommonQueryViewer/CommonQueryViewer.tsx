/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import { Container, getMultiTypeFromValue, MultiTypeInputType, Text } from '@harness/uicore'
import { defaultTo, isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { CommonHealthSourceFieldNames } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import CVMultiTypeQuery from '../CVMultiTypeQuery/CVMultiTypeQuery'
import type { CommonQueryViewerProps } from './types'
import { CommonQueryViewDialog } from './components/CommonQueryViewerDialog/CommonQueryViewDialog'
import { CommonRecords } from '../CommonRecords/CommonRecords'
import { CommonQueryContent } from './components/CommonQueryContent/CommonQueryContent'
import css from './CommonQueryViewer.module.scss'

export function CommonQueryViewer(props: CommonQueryViewerProps): JSX.Element {
  const {
    className,
    records,
    fetchRecords,
    loading,
    error,
    query,
    isQueryExecuted,
    postFetchingRecords,
    dataTooltipId,
    isTemplate,
    expressions,
    isConnectorRuntimeOrExpression
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

  const handleFetchRecords = (): void => {
    fetchRecords()
    if (postFetchingRecords) {
      postFetchingRecords()
    }
  }

  return (
    <Container className={cx(css.main, className)}>
      {!isTemplate && (
        <Text className={css.labelText} font={{ weight: 'semi-bold', size: 'medium' }} tooltipProps={{ dataTooltipId }}>
          {getString('cv.query')}
        </Text>
      )}
      {isTemplate ? (
        <CVMultiTypeQuery
          name={CommonHealthSourceFieldNames.QUERY}
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
        <CommonQueryContent
          onClickExpand={setIsDialogOpen}
          query={query}
          isDialogOpen={isDialogOpen}
          loading={loading}
          handleFetchRecords={handleFetchRecords}
        />
      )}

      <CommonRecords
        fetchRecords={handleFetchRecords}
        loading={loading}
        data={records}
        error={error}
        query={query}
        isQueryExecuted={isQueryRuntimeOrExpression ? !isQueryRuntimeOrExpression : isQueryExecuted}
      />
      <CommonQueryViewDialog
        isOpen={isDialogOpen}
        onHide={() => setIsDialogOpen(false)}
        query={query}
        fetchRecords={handleFetchRecords}
        loading={loading}
        data={records}
        error={error}
        isQueryExecuted={isQueryExecuted}
        isQueryRuntimeOrExpression={isQueryRuntimeOrExpression}
        isConnectorRuntimeOrExpression={isConnectorRuntimeOrExpression}
      />
    </Container>
  )
}
