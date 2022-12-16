/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { Container, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { defaultTo, isEmpty } from 'lodash-es'
import { CommonHealthSourceFieldNames } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import CVMultiTypeQuery from '../CVMultiTypeQuery/CVMultiTypeQuery'
import { CommonQueryViewDialog } from './components/CommonQueryViewerDialog/CommonQueryViewDialog'
import { CommonQueryContent } from './components/CommonQueryContent/CommonQueryContent'
import { CommonRecords } from '../CommonRecords/CommonRecords'
import type { CommonQueryViewerProps } from './types'

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
    isTemplate,
    expressions,
    isConnectorRuntimeOrExpression
  } = props

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
    <Container className={className}>
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
      {isQueryExecuted ? (
        <CommonRecords fetchRecords={handleFetchRecords} loading={loading} data={records} error={error} query={query} />
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
      />
    </Container>
  )
}
