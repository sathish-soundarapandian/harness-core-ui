/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { Container, Tabs, Tab, Text, Card, Icon, Layout } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Color } from '@harness/design-system'
import { Dialog, IDialogProps, Classes } from '@blueprintjs/core'

import cx from 'classnames'
import type { AppdynamicsValidationResponse, AppdynamicsMetricValueValidationResponse } from 'services/cv'
import { useStrings } from 'framework/strings'
import { ThirdPartyCallLogModal } from '../ThirdPartyCallLogs/ThirdPartyCallLogs'
import css from './MetricsVerificationModal.module.scss'

const MAX_TEXT_WIDTH = 85
const ICON_SIZE = 8

interface MetricsVerificationModalProps {
  onHide: () => void
  verificationType: string
  verificationData?: AppdynamicsValidationResponse[]
  guid: string
}

interface StatusCard {
  metricName: string
}

interface SuccessMetricCardProps extends StatusCard {
  count: number
}

interface NoDataErrorCardProps extends StatusCard {
  viewCallLogs: (metricPackName: string, metricName: string) => void
  metricPackName: string
}

interface ErrorMetricCardProps extends NoDataErrorCardProps {
  errorMsg: string
}

interface MetricPackValidationResultProps {
  data: AppdynamicsValidationResponse[]
  viewCallLogs: (metricPackName: string, metricName: string) => void
}

const modalPropsLight: IDialogProps = {
  isOpen: true,
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: false,
  className: Classes.DIALOG,
  style: { width: 900, height: 570 }
}

function filterForMetricPacksByMetricStatus(
  data: AppdynamicsValidationResponse[],
  status: AppdynamicsMetricValueValidationResponse['apiResponseStatus']
): AppdynamicsValidationResponse[] {
  if (!data?.length) {
    return []
  }
  const filteredMetrics: Array<{ metricPackName: string; values: AppdynamicsMetricValueValidationResponse[] }> = []
  data.forEach((metricPack: AppdynamicsValidationResponse) => {
    const metrics = metricPack?.values?.filter((metric: AppdynamicsMetricValueValidationResponse) => {
      return metric.apiResponseStatus === status
    })
    if (metrics?.length && metricPack?.metricPackName) {
      filteredMetrics.push({ metricPackName: metricPack.metricPackName, values: metrics })
    }
  })
  return filteredMetrics
}

function SuccessMetricCard(props: SuccessMetricCardProps): JSX.Element {
  const { metricName, count } = props
  return (
    <Card className={cx(css.successCard, css.statusCard)}>
      <Icon name="deployment-success-legacy" className={css.statusIcon} size={ICON_SIZE} />
      <Container className={css.dataContainer}>
        <Text lineClamp={1} color={Color.GREEN_500} width={MAX_TEXT_WIDTH} className={css.dataTitle}>
          {metricName}
        </Text>
        <Text className={css.count} lineClamp={1} width={MAX_TEXT_WIDTH} color={Color.GREEN_500}>
          {count}
        </Text>
      </Container>
    </Card>
  )
}

function ErrorMetricCard(props: ErrorMetricCardProps): JSX.Element {
  const { metricName, errorMsg } = props
  return (
    <Card className={cx(css.errorCard, css.statusCard)}>
      <Icon name="deployment-failed-legacy" className={css.statusIcon} size={ICON_SIZE} />
      <Container className={css.dataContainer}>
        <Text intent="danger" lineClamp={1} width={MAX_TEXT_WIDTH} className={css.dataTitle}>
          {metricName}
        </Text>
        <Text intent="danger" lineClamp={1} width={MAX_TEXT_WIDTH} className={css.smallFont}>
          {errorMsg}
        </Text>
      </Container>
    </Card>
  )
}

function NoDataErrorCard(props: NoDataErrorCardProps): JSX.Element {
  const { metricName } = props
  const { getString } = useStrings()
  return (
    <Card className={cx(css.noDataCard, css.statusCard)}>
      <Icon name="small-minus" className={css.statusIcon} size={ICON_SIZE} />
      <Container className={css.dataContainer}>
        <Text intent="none" lineClamp={1} width={MAX_TEXT_WIDTH} className={css.dataTitle}>
          {metricName}
        </Text>
        <Text intent="none" className={css.smallFont}>
          {getString('noData')}
        </Text>
      </Container>
    </Card>
  )
}

function MetricPackValidationResult(props: MetricPackValidationResultProps): JSX.Element {
  const { data = [], viewCallLogs } = props
  return (
    <Container className={css.content}>
      {data?.map((metricPack: AppdynamicsValidationResponse) => {
        const { metricPackName = '', values = [] } = metricPack || {}
        return (
          <Container key={metricPackName} className={css.metricPackContainer}>
            <Text className={css.metricPackName}>{metricPackName}</Text>
            <Container className={css.cardContainer}>
              {values.map((metric: AppdynamicsMetricValueValidationResponse) => {
                const { metricName = '', value = 0, errorMessage = '', apiResponseStatus } = metric || {}
                switch (apiResponseStatus) {
                  case 'SUCCESS':
                    return <SuccessMetricCard metricName={metricName} count={value} />
                  case 'FAILED':
                    return (
                      <ErrorMetricCard
                        metricName={metricName}
                        metricPackName={metricPackName}
                        errorMsg={errorMessage}
                        viewCallLogs={viewCallLogs}
                      />
                    )
                  default:
                    return (
                      <NoDataErrorCard
                        metricName={metricName}
                        metricPackName={metricPackName}
                        viewCallLogs={viewCallLogs}
                      />
                    )
                }
              })}
            </Container>
          </Container>
        )
      })}
    </Container>
  )
}

function MetricsModal(props: MetricsVerificationModalProps): JSX.Element {
  const { onHide, verificationData = [], guid, verificationType } = props
  const errorMetrics = useMemo(() => filterForMetricPacksByMetricStatus(verificationData, 'FAILED'), [verificationData])
  const noDataMetrics = useMemo(
    () => filterForMetricPacksByMetricStatus(verificationData, 'NO_DATA'),
    [verificationData]
  )
  const successMetrics = useMemo(
    () => filterForMetricPacksByMetricStatus(verificationData, 'SUCCESS'),
    [verificationData]
  )
  const [{ displayCallLog }, setCallLogDisplay] = useState({
    displayCallLog: false
  })
  const displayCallLogCallback = useCallback(() => setCallLogDisplay({ displayCallLog: true }), [])
  const { getString } = useStrings()
  return (
    <Dialog
      {...modalPropsLight}
      onClose={onHide}
      className={css.main}
      title={
        <Layout.Vertical>
          <Text color={Color.BLACK} font={{ size: 'medium' }}>
            {getString('cv.metricVerificationModal.modalTitle')}
          </Text>
          <Text intent="primary" className={cx(css.smallFont, css.callLogs)} onClick={() => displayCallLogCallback()}>
            {getString('cv.metricVerificationModal.viewCalls', { type: verificationType })}
          </Text>
        </Layout.Vertical>
      }
    >
      {!displayCallLog ? (
        <Tabs id="tabsId1">
          <Tab
            id={getString('all').toLocaleUpperCase()}
            title={getString('all').toLocaleUpperCase()}
            panel={<MetricPackValidationResult data={verificationData} viewCallLogs={displayCallLogCallback} />}
          />
          <Tab
            id={getString('cv.failures').toLocaleUpperCase()}
            title={getString('cv.failures').toLocaleUpperCase()}
            panel={<MetricPackValidationResult data={errorMetrics} viewCallLogs={displayCallLogCallback} />}
          />
          <Tab
            id={getString('noData').toLocaleUpperCase()}
            title={getString('noData').toLocaleUpperCase()}
            panel={<MetricPackValidationResult data={noDataMetrics} viewCallLogs={displayCallLogCallback} />}
          />
          <Tab
            id={getString('success').toLocaleUpperCase()}
            title={getString('success').toLocaleUpperCase()}
            panel={<MetricPackValidationResult data={successMetrics} viewCallLogs={displayCallLogCallback} />}
          />
        </Tabs>
      ) : (
        <ThirdPartyCallLogModal
          guid={guid}
          onHide={onHide}
          onBackButtonClick={() => setCallLogDisplay({ displayCallLog: false })}
          verificationType={verificationType}
        />
      )}
    </Dialog>
  )
}

export default function MetricsVerificationModal(props: MetricsVerificationModalProps): JSX.Element {
  const { onHide, verificationData = [], guid, verificationType } = props
  const [openModal, hideModal] = useModalHook(() => {
    const hidemodalCallback = (): void => {
      hideModal()
      onHide()
    }
    return (
      <MetricsModal
        onHide={hidemodalCallback}
        verificationData={verificationData}
        guid={guid}
        verificationType={verificationType}
      />
    )
  })
  useEffect(() => openModal(), [openModal])
  return <span />
}
