/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Spinner } from '@blueprintjs/core'
import { Text } from '@harness/uicore'
import type { ExecutionCardInfoProps } from '@pipeline/factories/ExecutionFactory/types'
import SeverityPill from '@sto-steps/components/SeverityPill/SeverityPill'
import { SeverityCode } from '@sto-steps/types'
import { useStrings } from 'framework/strings'
import type { PipelineExecutionSummary } from 'services/pipeline-ng'
import { useIssueCounts } from 'services/sto'
import css from './STOExecutionCardSummary.module.scss'

export default function STOExecutionCardSummary(
  props: ExecutionCardInfoProps<PipelineExecutionSummary>
): React.ReactElement {
  const { data } = props
  const { pipelineIdentifier = '', planExecutionId: executionId = '', status: pipelineStatus = '' } = data

  const { getString } = useStrings()
  const { data: issueCounts, loading, error } = useIssueCounts(pipelineIdentifier, executionId)

  if (!pipelineIdentifier || !executionId || !pipelineStatus) {
    return <></>
  }

  if (pipelineStatuses['Loading'].includes(pipelineStatus)) {
    return RenderLoading()
  }
  return RenderSecurityResults()

  function RenderLoading(): React.ReactElement {
    return (
      <div className={css.spinnerWrapper}>
        <Spinner size={Spinner.SIZE_SMALL} />
        {RenderSecurityResults()}
      </div>
    )
  }

  function RenderSecurityResults(): React.ReactElement {
    if (loading) {
      if (pipelineStatuses['Loading'].includes(pipelineStatus)) {
        return <></>
      } else {
        return (
          <div className={css.spinnerWrapper}>
            <Spinner size={Spinner.SIZE_SMALL} />
          </div>
        )
      }
    } else {
      // Determine if an informational message should be shown, instead of Security Issue counts
      let message: JSX.Element | undefined = undefined
      if (error?.status === 404 || (issueCounts && Object.keys(issueCounts).length === 0)) {
        message = <Text font={{ size: 'small' }}>{getString(`stoSteps.noSecurityResults`)}</Text>
      } else if (!issueCounts || error) {
        message = (
          <Text icon="error" intent="danger" font={{ size: 'small' }}>
            {getString('stoSteps.failedToGetIssueCounts')}
          </Text>
        )
      } else if (
        !(issueCounts?.critical || issueCounts?.high || issueCounts?.medium || issueCounts?.low || issueCounts?.info)
      ) {
        message = (
          <Text icon={'tick-circle'} iconProps={{ intent: 'success' }} font={{ size: 'small' }}>
            {getString('stoSteps.noSecurityIssues')}
          </Text>
        )
      }

      // Render the message or display issue counts
      if (message) {
        return <div className={css.main}>{message}</div>
      } else {
        return (
          <div className={css.main}>
            {issueCounts?.critical ? (
              <SeverityPill severity={SeverityCode.Critical} value={issueCounts.critical} />
            ) : null}
            {issueCounts?.high ? <SeverityPill severity={SeverityCode.High} value={issueCounts.high} /> : null}
            {issueCounts?.medium ? <SeverityPill severity={SeverityCode.Medium} value={issueCounts.medium} /> : null}
            {issueCounts?.low ? <SeverityPill severity={SeverityCode.Low} value={issueCounts.low} /> : null}
            {issueCounts?.info ? <SeverityPill severity={SeverityCode.Info} value={issueCounts.info} /> : null}
          </div>
        )
      }
    }
  }
}

const pipelineStatuses = {
  Loading: [
    'ApprovalWaiting',
    'AsyncWaiting',
    'InputWaiting',
    'InterventionWaiting',
    'NotStarted',
    'Paused',
    'Pausing',
    'Queued',
    'ResourceWaiting',
    'Running',
    'TaskWaiting',
    'TimedWaiting'
  ],
  Succeeded: ['Success'],
  Failed: [
    'Aborted',
    'ApprovalRejected',
    'Discontinuing',
    'Errored',
    'Expired',
    'Failed',
    'IgnoreFailed',
    'Skipped',
    'Suspended'
  ]
}
