/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import {
  Layout,
  Text,
  Collapse,
  Container,
  Heading,
  NoDataCard,
  Pagination,
  PageSpinner,
  PageError
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { ApiCallLogDTO, ApiCallLogDTOField } from 'services/cv'
import { CopyText } from '@common/components/CopyText/CopyText'
import noLogsDataImage from '@cv/assets/genericEmptyState.svg'
import { getTags } from '@cv/utils/CommonUtils'
import { formatDate, getStatusColor } from '../../useLogContentHook.utils'
import type { ExecutionAndAPICallLogProps } from '../../useLogContentHook.types'
import { RequestPropertyNames } from './ExternalAPICallContent.constants'
import KeyValuePair from './components/KeyValuePairDisplay'
import ExternalAPICallBodyContent from './components/ExternalAPICallBodyContent/ExternalAPICallBodyContent'
import css from './ExternalAPICall.module.scss'

const ExternalAPICallContent: React.FC<ExecutionAndAPICallLogProps> = ({
  loading,
  errorMessage,
  refetchLogs,
  resource,
  setPageNumber,
  monitoredServiceIdentifier,
  showTimelineSlider
}) => {
  const { getString } = useStrings()
  const TEXT_NO_DATA =
    Boolean(monitoredServiceIdentifier) && !showTimelineSlider
      ? getString('cv.monitoredServices.noAvailableLogData')
      : getString('cv.changeSource.noDataAvaiableForCard')
  const { content = [], pageSize = 0, pageIndex = 0, totalPages = 0, totalItems = 0 } = resource ?? {}

  if (loading) {
    return <PageSpinner />
  }

  if (errorMessage) {
    return <PageError message={errorMessage} onClick={() => refetchLogs()} />
  }

  if (!content.length) {
    return <NoDataCard message={TEXT_NO_DATA} image={noLogsDataImage} containerClassName={css.noDataContainer} />
  }

  return (
    <>
      <Container className={css.container}>
        {content.map((log: ApiCallLogDTO, index) => {
          const { createdAt, requests, requestTime, responses, responseTime, tags } = log
          const request = requests?.find(_request => _request.name === 'url')
          const requestMethod = requests?.find(_request => _request.name === RequestPropertyNames.method)
          const requestHeaders = requests?.find(_request => _request.name === RequestPropertyNames.headers)
          const requestBody = requests?.find(_request => _request.name === RequestPropertyNames.body)

          const status = responses?.find(_response => _response.name === 'Status Code') ?? {}
          const responseBody = responses?.find(_response => _response.name === 'Response Body') ?? {}

          let stringifyResponse = ''

          try {
            stringifyResponse = responseBody.value
              ? JSON.stringify(JSON.parse(responseBody.value), null, 4)
              : TEXT_NO_DATA
          } catch (e) {
            stringifyResponse = responseBody.value ?? TEXT_NO_DATA
          }

          return (
            <Collapse
              key={index}
              collapseClassName={cx(css.collapse, css[getStatusColor(status.value)])}
              collapseHeaderClassName={css.collapseHeader}
              collapsedIcon="main-chevron-down"
              expandedIcon="main-chevron-right"
              heading={
                <Layout.Horizontal padding={{ left: 'small' }} spacing="small">
                  <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_400}>
                    {formatDate(createdAt)}
                  </Text>
                  <Text lineClamp={1} font={{ variation: FontVariation.BODY }} color={Color.GREY_900}>
                    {`${getString('cv.fetchingDataFrom')} ${request?.value?.split('?')[0]}`}
                  </Text>
                </Layout.Horizontal>
              }
            >
              <Container className={css.collapseContent}>
                <Container
                  border={{ bottom: true }}
                  padding={{ top: 'medium', right: 'large', bottom: 'medium', left: 'large' }}
                >
                  <Heading level={2} font={{ variation: FontVariation.BODY2 }} color={Color.GREY_900}>
                    {getString('common.request')}
                  </Heading>
                  <KeyValuePair keyText="URL" value={request?.value} isLink />
                  <KeyValuePair keyText="Request Timestamp" value={formatDate(requestTime)} />
                  <KeyValuePair keyText="Tags" value={getTags(tags)} />
                  {requestMethod && <KeyValuePair keyText={requestMethod?.name ?? ''} value={requestMethod?.value} />}
                  {requestHeaders && (
                    <KeyValuePair keyText={requestHeaders?.name ?? ''} value={requestHeaders?.value} />
                  )}
                  <ExternalAPICallBodyContent data={requestBody as ApiCallLogDTOField} noDataText={TEXT_NO_DATA} />
                </Container>
                <Container padding={{ top: 'medium', right: 'large', bottom: 'medium', left: 'large' }}>
                  <Heading level={2} font={{ variation: FontVariation.BODY2 }} color={Color.GREY_900}>
                    {getString('cv.response')}
                  </Heading>
                  <KeyValuePair keyText="Status Code" value={status.value} />
                  <KeyValuePair keyText="Response Timestamp" value={formatDate(responseTime)} />
                  <Container flex={{ alignItems: 'flex-start' }}>
                    <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_400}>
                      {getString('cv.responseBody')}:
                    </Text>
                    <CopyText
                      iconAlwaysVisible
                      iconName="duplicate"
                      className={css.copy}
                      textToCopy={stringifyResponse}
                    />
                  </Container>
                  <Container padding="small" background={Color.WHITE} className={css.responseBody}>
                    <pre>{stringifyResponse}</pre>
                  </Container>
                </Container>
              </Container>
            </Collapse>
          )
        })}
      </Container>
      <Container border={{ top: true }} padding={{ left: 'medium', right: 'medium' }}>
        <Pagination
          pageSize={pageSize}
          pageIndex={pageIndex}
          pageCount={totalPages}
          itemCount={totalItems}
          gotoPage={setPageNumber}
        />
      </Container>
    </>
  )
}

export default ExternalAPICallContent
