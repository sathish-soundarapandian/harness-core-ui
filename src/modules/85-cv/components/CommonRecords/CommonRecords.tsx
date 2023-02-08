/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import cx from 'classnames'
import { Container, Icon, StackTraceList, Text, PageError, NoDataCard, Button, ButtonVariation } from '@harness/uicore'
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
      <Container className={cx(css.recordsContainer, className)}>
        <PageError message={getErrorMessage(error)} disabled={isEmpty(query)} onClick={fetchRecords} />
      </Container>
    )
  } else if (loading) {
    content = (
      <Container
        className={cx(css.recordsContainer, className)}
        flex={{ justifyContent: 'center', alignItems: 'center' }}
      >
        <Icon name="spinner" size={32} color={Color.GREY_600} />
        <Text padding={{ top: 'small', left: 'medium' }}>
          {getString('cv.monitoringSources.commonHealthSource.records.fetchingRecords')}
        </Text>
      </Container>
    )
  } else if (!isQueryExecuted) {
    content = (
      <Container className={cx(css.noDataContainer, className)}>
        <Text padding={{ top: 'small', left: 'medium' }} color={Color.BLACK}>
          {getString('cv.monitoringSources.commonHealthSource.records.runQueryToSeeRecords')}
        </Text>
      </Container>
    )
  } else if (!records?.length) {
    content = (
      <Container className={cx(css.recordsContainer, css.noRecords, className)}>
        <NoDataCard
          image={noDataImage}
          message={getString('cv.monitoringSources.gcoLogs.noRecordsForQuery')}
          onClick={fetchRecords}
          button={
            <Button variation={ButtonVariation.SECONDARY} onClick={fetchRecords} margin={{ bottom: 'small' }}>
              {getString('retry')}
            </Button>
          }
          buttonDisabled={isEmpty(query)}
        />
      </Container>
    )
  } else {
    content = (
      <Container className={cx(css.recordsContainer, className)}>
        <StackTraceList
          stackTraceList={records}
          className={css.recordContainer}
          stackTracePanelClassName={cx({ [css.stackTracePanelClassName]: records?.length === 1 })}
        />
      </Container>
    )
  }

  return (
    <Container className={css.queryAndRecords}>
      <Text font={{ variation: FontVariation.H6 }} margin={{ bottom: 'small' }}>
        {getString('cv.monitoringSources.gcoLogs.records')}
      </Text>
      <Container>{content}</Container>
    </Container>
  )
}
