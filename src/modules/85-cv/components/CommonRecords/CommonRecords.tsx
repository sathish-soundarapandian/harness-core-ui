/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import cx from 'classnames'
import { Container, Icon, StackTraceList, Text, PageError, NoDataCard } from '@harness/uicore'
import { isEmpty } from 'lodash-es'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import noDataImage from '@cv/assets/noData.svg'
import { transformSampleData } from './utils'
import type { CommonRecordsProps } from './types'
import css from './CommonRecords.module.scss'

export function CommonRecords(props: CommonRecordsProps): JSX.Element {
  const { data, loading, error, fetchRecords, query, className, isQueryExecuted } = props
  const { getString } = useStrings()
  let content = null

  const { records } = useMemo(() => {
    return transformSampleData(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  if (error) {
    content = (
      <PageError
        message={getErrorMessage(error)}
        disabled={isEmpty(query)}
        onClick={() => {
          fetchRecords()
        }}
      />
    )
  } else if (loading) {
    content = (
      <Container className={css.centerElement}>
        <Icon name="spinner" size={32} color={Color.GREY_600} />
        <Text padding={{ top: 'small', left: 'medium' }}>
          {getString('cv.monitoringSources.commonHealthSource.records.fetchingRecords')}
        </Text>
      </Container>
    )
  } else if (!isQueryExecuted) {
    content = (
      <Container className={css.noDataContainer}>
        <NoDataCard
          message={
            <Text padding={{ top: 'small', left: 'medium' }}>
              {getString('cv.monitoringSources.commonHealthSource.records.runQueryToSeeRecords')}
            </Text>
          }
          image={noDataImage}
        />
      </Container>
    )
  } else if (!records?.length) {
    content = (
      <Container className={css.noRecords}>
        <NoDataCard
          image={noDataImage}
          message={getString('cv.monitoringSources.gcoLogs.noRecordsForQuery')}
          onClick={fetchRecords}
          buttonText={getString('retry')}
          buttonDisabled={isEmpty(query)}
        />
      </Container>
    )
  } else {
    content = (
      <StackTraceList
        stackTraceList={records}
        className={css.recordContainer}
        stackTracePanelClassName={css.stackTracePanelClassName}
      />
    )
  }

  return (
    <Container className={css.queryAndRecords}>
      <Text font={{ variation: FontVariation.H6 }} margin={{ bottom: 'small' }}>
        {getString('cv.monitoringSources.gcoLogs.records')}
      </Text>
      <Container className={cx(css.chartContainer, className)}>{content}</Container>
    </Container>
  )
}
