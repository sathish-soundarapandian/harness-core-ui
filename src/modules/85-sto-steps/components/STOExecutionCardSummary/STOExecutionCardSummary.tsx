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
      if (!issueCounts || error) {
        return (
          <div className={css.main}>
            <Text icon="error" intent="danger" font={{ size: 'small' }}>
              {getString('stoSteps.failedToGetIssueCounts')}
            </Text>
          </div>
        )
      }
      const counts = issueCounts[executionId]
      if (issueCounts && Object.keys(issueCounts).length === 0) {
        return (
          <div className={css.main}>
            <Text font={{ size: 'small' }}>{getString(`stoSteps.noSecurityResults`)}</Text>
          </div>
        )
      } else if (
        !(counts?.critical > 0 || counts?.high > 0 || counts?.medium > 0 || counts?.low > 0 || counts?.info > 0)
      ) {
        return (
          <div className={css.main}>
            <Text icon={'tick-circle'} iconProps={{ intent: 'success' }} font={{ size: 'small' }}>
              {getString('stoSteps.noSecurityIssues')}
            </Text>
          </div>
        )
      } else {
        return (
          <div className={css.main}>
            {counts?.critical ? <SeverityPill severity={SeverityCode.Critical} value={counts.critical} /> : null}
            {counts?.high ? <SeverityPill severity={SeverityCode.High} value={counts.high} /> : null}
            {counts?.medium ? <SeverityPill severity={SeverityCode.Medium} value={counts.medium} /> : null}
            {counts?.low ? <SeverityPill severity={SeverityCode.Low} value={counts.low} /> : null}
            {counts?.info ? <SeverityPill severity={SeverityCode.Info} value={counts.info} /> : null}
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
