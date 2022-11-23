/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useMemo } from 'react'
import moment from 'moment'
import { useParams } from 'react-router-dom'
import { Layout, Heading, Container, Icon, Text, CodeBlock, Button, PageError } from '@harness/uicore'
import { Dialog, IDialogProps, Classes, Spinner } from '@blueprintjs/core'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { CVNGLogDTO, useGetOnboardingLogs } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import css from './ThirdPartyCallLog.module.scss'

export interface ApiCallLogDTOField {
  name: string
  value: string
}
export interface ApiCallLogDTO extends CVNGLogDTO {
  requests: ApiCallLogDTOField[]
  responses: ApiCallLogDTOField[]
  requestTime: number
  responseTime: number
}

interface ThirdPartyCallLogsProps {
  guid: string
  onBackButtonClick?: () => void
  onHide: () => void
  verificationType: string
}

interface RequestMadeProps {
  status: number
  requestURL: string
  requestTimestamp: number
  isSelected: boolean
  onClick: () => void
}

interface SelectedLogProps {
  callLog: ApiCallLogDTO
}

type RequestAndResponse = {
  requestURL?: string
  requestMethod?: string
  statusCode?: string
  responseBody?: string
  responseIsJSON?: boolean
}

const bpDialogProps: IDialogProps = {
  isOpen: true,
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: false,
  className: Classes.DIALOG,
  style: { width: 900, height: 570 }
}

function SelectedLog(props: SelectedLogProps): JSX.Element {
  const { requests, responses, requestTime, responseTime } = props.callLog || {}
  const { getString } = useStrings()
  const requiredKeys = useMemo(() => {
    const obj: RequestAndResponse = {}
    requests?.forEach(reqObj => {
      if (reqObj.name === 'url') {
        obj.requestURL = reqObj.value
      } else if (reqObj.name === 'Method') {
        obj.requestMethod = reqObj.value
      }

      responses?.forEach(respObj => {
        if (respObj.name === 'Status Code') {
          obj.statusCode = respObj.value
        } else if (respObj.name === 'Response Body') {
          try {
            obj.responseBody = JSON.stringify(JSON.parse(respObj.value), null, 2)
            obj.responseIsJSON = true
          } catch (exception) {
            obj.responseBody = respObj.value
          }
        }
      })
    })
    return obj
  }, [requests, responses])

  return (
    <Container className={css.selectedCallLog}>
      <Container className={css.requestContainer}>
        <Text color={Color.BLACK}>{getString('cv.thirdPartyCalls.requestMade')}</Text>
        <Text className={css.urlLabel}>{getString('UrlLabel')}:</Text>
        <Container className={css.requestUrl}>
          <CodeBlock allowCopy format="pre" snippet={requiredKeys.requestURL} />
        </Container>
        {requiredKeys.requestMethod && (
          <Text>
            {getString('cv.methodLabel')}: <Text inline>{requiredKeys.requestMethod}</Text>
          </Text>
        )}
      </Container>
      <Container className={css.responseContainer}>
        <Text color={Color.BLACK}>{getString('cv.response')}</Text>
        <Text>
          {getString('cv.statusCode')}: <Text inline>{requiredKeys.statusCode}</Text>
        </Text>
        <Text>
          {getString('cv.thirdPartyCalls.timeTaken')}:<Text inline>{(responseTime || 0) - (requestTime || 0)}ms</Text>
        </Text>
        <Text>{getString('cv.responseBody')}:</Text>
        <Container className={css.responseBody}>
          <CodeBlock allowCopy format="pre" snippet={requiredKeys.responseBody} />
        </Container>
      </Container>
    </Container>
  )
}

function RequestMade(props: RequestMadeProps): JSX.Element {
  const { requestTimestamp, requestURL, status, isSelected, onClick } = props
  const { getString } = useStrings()
  const requestDate = useMemo(
    () => (requestTimestamp === -1 ? undefined : moment(requestTimestamp)),
    [requestTimestamp]
  )
  const statusIcon = useMemo(() => {
    if (status === 200) {
      return <Icon name="deployment-success-legacy" className={css.statusIcon} />
    } else if (status >= 400) {
      return <Icon name="main-issue" color={Color.RED_500} className={css.statusIcon} />
    }
    return <Icon name="small-minus" className={css.statusIcon} />
  }, [status])
  return (
    <Container className={css.requestCard} data-selected={isSelected} onClick={onClick}>
      <Container flex className={css.dateContainer}>
        <Container>
          {statusIcon}
          {requestDate && <Text className={css.day}>{requestDate.format('MMM D YYYY')}</Text>}
        </Container>
        {requestDate && <Text className={css.timestamp}>{requestDate.format('hh:mm')}</Text>}
      </Container>
      <Container className={css.requestContainer}>
        <Text inline className={css.requestLabel}>
          {getString('cv.request')}:
        </Text>
        <Text intent="primary" lineClamp={1} width={220}>
          {requestURL}
        </Text>
      </Container>
    </Container>
  )
}

export function ThirdPartyCallLogModal(props: ThirdPartyCallLogsProps): JSX.Element {
  const { guid, onHide, onBackButtonClick, verificationType } = props
  const { accountId } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const [selectedIndex, setSelected] = useState(0)
  const { loading, error, data } = useGetOnboardingLogs({
    queryParams: { traceableId: guid, accountId, offset: 0, pageSize: 1000 }
  })

  const dialogProps = useMemo(() => {
    if (onBackButtonClick) {
      return {
        ...bpDialogProps,
        title: (
          <Container className={css.headingContainer}>
            <Button minimal intent="primary" icon="chevron-left" onClick={onBackButtonClick}>
              {getString('back')}
            </Button>
            <Heading level={2} className={css.backButtonHeading}>
              {`${getString('cv.thirdPartyCalls.modalTitle')} ${verificationType}`}
            </Heading>
          </Container>
        ),
        onClose: onHide
      }
    }
    return {
      ...bpDialogProps,
      title: `${getString('cv.thirdPartyCalls.modalTitle')} ${verificationType}`,
      onClose: onHide
    }
  }, [onBackButtonClick, onHide, verificationType])

  const callLogs: ApiCallLogDTO[] = (data?.data?.content as ApiCallLogDTO[]) || []
  return (
    <Dialog {...dialogProps}>
      <Layout.Horizontal className={css.main}>
        <Container className={css.sideContainer}>
          <Container>
            {callLogs.map((callLog, index) => {
              const status = callLog?.responses?.filter(resp => resp.name === 'Status Code')
              return !callLog ? null : (
                <RequestMade
                  key={index}
                  requestTimestamp={callLog.requestTime || -1}
                  status={parseInt(status[0]?.value)}
                  requestURL={callLog.requests[0].value}
                  isSelected={selectedIndex === index}
                  onClick={() => setSelected(index)}
                />
              )
            })}
          </Container>
        </Container>
        {loading && (
          <Container className={css.spinner}>
            <Spinner />
          </Container>
        )}
        {!loading && !error && callLogs?.length === 0 && (
          <Text className={css.noCalls}>{getString('cv.thirdPartyCalls.noCallsWereMade')}</Text>
        )}
        {error && <PageError message={getErrorMessage(error)} />}
        {!loading && !error && callLogs?.length > 0 && <SelectedLog callLog={callLogs[selectedIndex]} />}
      </Layout.Horizontal>
    </Dialog>
  )
}
