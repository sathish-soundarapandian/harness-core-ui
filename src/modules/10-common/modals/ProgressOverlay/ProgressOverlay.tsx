/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { capitalize, isUndefined, startCase } from 'lodash-es'
import { Button, Container, Icon, Layout, Text } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { Failure, Error, ResponseBoolean } from 'services/cd-ng'

import { ErrorHandler } from '@common/components/ErrorHandler/ErrorHandler'
import css from './ProgressOverlay.module.scss'

export type StepStatus = ResponseBoolean['status'] | 'IN_PROGRESS' | 'ABORTED'

const SHORT_DURATION = 1000
const LONG_DURATION = 3000

export interface Stage {
  status: StepStatus
  intermediateLabel: string | React.ReactElement
  finalLabel?: string
  error?: Failure | Error
}

interface ProgressOverlay {
  preFirstStage?: Stage
  firstStage: Stage
  postFirstStage?: Stage
  secondStage?: Stage
  onClose: () => void
}

const shouldCloseModal = (firstStage: Stage, secondStage?: Stage): boolean => {
  let shouldClose = false
  /* This logic will wait for first and second stage (if present) to run to completion */
  if (firstStage.status === 'SUCCESS') {
    if (!isUndefined(secondStage)) {
      shouldClose = secondStage.status === 'SUCCESS'
    } else {
      shouldClose = true
    }
  }
  return shouldClose
}

export const ProgressOverlay: React.FC<ProgressOverlay> = ({
  firstStage,
  preFirstStage,
  postFirstStage,
  secondStage,
  onClose
}): JSX.Element => {
  const { getString } = useStrings()

  const renderStage = (stage: Stage): React.ReactElement => {
    const { status, intermediateLabel } = stage
    let iconRender
    switch (status) {
      case 'IN_PROGRESS':
        iconRender = (
          <Icon name="steps-spinner" size={18} color={Color.PRIMARY_7} title={capitalize(startCase('IN_PROGRESS'))} />
        )
        break
      case 'SUCCESS':
        iconRender = (
          <Icon name="command-artifact-check" size={18} color={Color.GREEN_450} title={capitalize('SUCCESS')} />
        )
        break
      case 'FAILURE':
      case 'ERROR':
        iconRender = <Icon name="circle-cross" size={18} color={Color.RED_450} title={capitalize('FAILURE')} />
        break
      case 'ABORTED':
        iconRender = <Icon name="warning-sign" size={18} color={Color.YELLOW_450} title={capitalize('ABORTED')} />
        break
      default:
    }
    return (
      <>
        {iconRender}
        <Text className={css.branchName}>{intermediateLabel}</Text>
      </>
    )
  }

  const getOverallSummary = (): JSX.Element => {
    // error can be proper formatted BE error or any unhandled failure
    let responseMessages = (firstStage?.error as Error)?.responseMessages
    if (opnInProgress) {
      return (
        <Layout.Vertical spacing="small" flex>
          <Icon name="steps-spinner" size={40} color={Color.PRIMARY_7} />
          <Text font="medium" color={Color.BLACK} style={{ fontWeight: 'bold' }} className={css.finalLabel}>
            {getString('common.gitSync.savingInProgress')}
          </Text>
        </Layout.Vertical>
      )
    } else if (!opnInProgress && firstStage.status !== 'SUCCESS') {
      return responseMessages?.length ? (
        <ErrorHandler responseMessages={responseMessages} />
      ) : (
        <Layout.Vertical spacing="small" flex>
          <Icon name="circle-cross" size={40} color={Color.RED_450} />
          <Text font="medium" color={Color.BLACK} style={{ fontWeight: 'bold' }} className={css.finalLabel}>
            {firstStage.finalLabel}
          </Text>
        </Layout.Vertical>
      )
    } else if (!opnInProgress && firstStage.status === 'SUCCESS' && secondStage && secondStage.status !== 'SUCCESS') {
      responseMessages = (secondStage?.error as Error)?.responseMessages
      return responseMessages?.length ? (
        <ErrorHandler responseMessages={responseMessages} />
      ) : (
        <Layout.Vertical spacing="small" flex>
          <Icon name="circle-cross" size={40} color={Color.RED_450} />
          <Text font="medium" color={Color.BLACK} style={{ fontWeight: 'bold' }} className={css.finalLabel}>
            {secondStage?.finalLabel}
          </Text>
        </Layout.Vertical>
      )
    } else if (opnIsSuccessful) {
      return (
        <Layout.Vertical spacing="small" flex>
          <Icon name="command-artifact-check" size={40} color={Color.GREEN_450} />
          <Text font="medium" color={Color.BLACK} style={{ fontWeight: 'bold' }} className={css.finalLabel}>
            {getString('success')}
          </Text>
        </Layout.Vertical>
      )
    }
    return <></>
  }

  const opnInProgress =
    firstStage.status === 'IN_PROGRESS' ||
    (firstStage.status === 'SUCCESS' && secondStage && secondStage.status === 'IN_PROGRESS')
  const opnIsSuccessful = firstStage.status === 'SUCCESS' || (secondStage && secondStage.status === 'SUCCESS')

  React.useEffect(() => {
    let id: NodeJS.Timeout

    if (shouldCloseModal(firstStage, secondStage)) {
      id = setTimeout(() => onClose(), !isUndefined(secondStage) ? LONG_DURATION : SHORT_DURATION)
    }
    return () => {
      clearTimeout(id)
    }
  }, [firstStage.status, secondStage?.status])

  return (
    <Container className={css.prModal}>
      <Button icon="cross" minimal className={css.closeModal} onClick={onClose} />
      <Layout.Vertical
        spacing="medium"
        flex={{ justifyContent: 'center' }}
        padding={{ left: 'xxxlarge', right: 'xxxlarge', top: 'xxlarge', bottom: 'xxxlarge' }}
      >
        {getOverallSummary()}
        {/* Individual stages */}
        <Layout.Vertical spacing="large" flex={{ justifyContent: 'center', alignItems: 'baseline' }}>
          {preFirstStage ? (
            <Layout.Horizontal spacing="small" padding={{ bottom: 'small' }}>
              {renderStage(preFirstStage)}
            </Layout.Horizontal>
          ) : null}
          <Layout.Horizontal spacing="small" padding={{ bottom: 'small' }}>
            {renderStage(firstStage)}
          </Layout.Horizontal>
          {postFirstStage ? (
            <Layout.Horizontal spacing="small" padding={{ bottom: 'small' }}>
              {renderStage(postFirstStage)}
            </Layout.Horizontal>
          ) : null}
          {secondStage ? <Layout.Horizontal spacing="small">{renderStage(secondStage)}</Layout.Horizontal> : null}
        </Layout.Vertical>
      </Layout.Vertical>
    </Container>
  )
}
