/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Classes, Dialog } from '@blueprintjs/core'
import { Icon } from '@harness/icons'
import { Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import ReactTimeago from 'react-timeago'
import { isNil } from 'lodash-es'
import { EvaluationView } from '@governance/EvaluationView'
import type { GitQueryParams, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import type { Evaluation } from 'services/pm'
import { RevalidateFooter } from './RevalidateFooter'
import { isStatusSuccess, ValidationStatus } from '../ValidationUtils'
import css from '../ValidationBadge.module.scss'

interface ValidationResultModalProps {
  isOpen: boolean
  policyEval?: Evaluation
  status: ValidationStatus | undefined
  endTs?: number
  onClose: () => void
  onRevalidate: () => Promise<void>
}

export function ValidationResultModal({
  isOpen,
  policyEval,
  status,
  endTs,
  onClose,
  onRevalidate
}: ValidationResultModalProps): JSX.Element | null {
  const { accountId, module } = useParams<PipelineType<PipelinePathProps> & GitQueryParams>()
  const { getString } = useStrings()

  if (!policyEval) return null

  const isSuccess = isStatusSuccess(status)

  const successTitle = isSuccess && (
    <div className={css.successTitle}>
      <Icon name="tick" color={Color.PRIMARY_6} size={32} />
      <div>
        <Text font={{ variation: FontVariation.H4 }} color={Color.GREY_800}>
          {getString('pipeline.validation.pipelineValidated')}
        </Text>
        {!isNil(endTs) && Number.isFinite(endTs) && (
          <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_500}>
            <ReactTimeago date={endTs} live />
          </Text>
        )}
      </div>
    </div>
  )

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isSuccess ? successTitle : getString('common.policiesSets.evaluations')}
      className={css.validationResultModal}
      enforceFocus={false}
      canEscapeKeyClose
      canOutsideClickClose
    >
      <div className={css.validationResultModalBody}>
        <EvaluationView
          metadata={policyEval}
          accountId={accountId}
          module={module}
          headingErrorMessage={getString('pipeline.policyEvaluations.failureHeadingEvaluationDetail')}
          headingWarningMessage={getString('pipeline.policyEvaluations.warningHeadingEvaluationDetail')}
        />
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <RevalidateFooter onClose={onClose} onRevalidate={onRevalidate} />
      </div>
    </Dialog>
  )
}
