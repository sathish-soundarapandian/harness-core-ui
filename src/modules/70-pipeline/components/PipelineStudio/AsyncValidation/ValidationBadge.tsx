/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { isNil } from 'lodash-es'
import { Icon, Popover, Text, useToaster } from '@harness/uicore'
import { Color } from '@harness/design-system'
import ReactTimeago from 'react-timeago'
import { Classes } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { useGetPipelineValidateResult, useValidatePipelineAsync } from 'services/pipeline-ng'
import type { GitQueryParams, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useBooleanStatus, useQueryParams } from '@common/hooks'
import { getGitQueryParamsWithParentScope } from '@common/utils/gitSyncUtils'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import { usePolling } from '@common/hooks/usePolling'
import type { Evaluation } from 'services/pm'
import { usePipelineContext } from '../PipelineContext/PipelineContext'
import {
  getIconPropsByStatus,
  isStatusError,
  isStatusFailure,
  isStatusLoading,
  isStatusSuccess,
  minimalTimeagoFormatter,
  useValidationErrorCount,
  ValidationStatus
} from './ValidationUtils'
import { ValidationPopoverContent } from './ValidationPopoverContent'
import { ValidationErrorModal } from './ValidationModals/ValidationErrorModal'
import { ValidationResultModal } from './ValidationModals/ValidationResultModal'
import css from './ValidationBadge.module.scss'

export interface ValidationBadgeProps {
  className?: string
}

export function ValidationBadge({ className }: ValidationBadgeProps): JSX.Element | null {
  const { getString } = useStrings()
  const params = useParams<PipelineType<PipelinePathProps> & GitQueryParams>()
  const { accountId: accountIdentifier, orgIdentifier, projectIdentifier, pipelineIdentifier } = params
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const {
    state: { validationUuid, storeMetadata, isUpdated },
    setValidationUuid
  } = usePipelineContext()
  const {
    open: openValidationResultModal,
    close: closeValidationResultModal,
    state: isValidationResultModalOpen
  } = useBooleanStatus(false)
  const {
    open: openValidationErrorModal,
    close: closeValidationErrorModal,
    state: isValidationErrorModalOpen
  } = useBooleanStatus(false)

  const {
    data: validationResultData,
    error: validationResultError,
    refetch: refetchValidationResult,
    loading: validationResultLoading
  } = useGetPipelineValidateResult({
    uuid: validationUuid ?? '',
    queryParams: {
      accountIdentifier,
      orgIdentifier,
      projectIdentifier
    },
    pathParams: {
      uuid: validationUuid ?? ''
    },
    lazy: !validationUuid,
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })

  const status = useMemo((): ValidationStatus | undefined => {
    if (validationResultLoading) return 'IN_PROGRESS'
    if (validationResultError) return 'ERROR'

    return validationResultData?.data?.status as ValidationStatus | undefined
  }, [validationResultData?.data?.status, validationResultError, validationResultLoading])

  const policyEval = validationResultData?.data?.policyEval as Evaluation | undefined
  const templatesValidation = validationResultData?.data?.templateValidationResponse
  const endTs = validationResultData?.data?.endTs

  const pollUntil = useMemo(() => {
    return !!validationUuid && !validationResultLoading && isStatusLoading(status)
  }, [status, validationResultLoading, validationUuid])

  usePolling(refetchValidationResult, {
    pollingInterval: 5_000,
    startPolling: pollUntil
  })

  const { mutate: validatePipeline } = useValidatePipelineAsync({
    pipelineIdentifier,
    queryParams: {
      accountIdentifier,
      orgIdentifier,
      projectIdentifier,
      ...getGitQueryParamsWithParentScope({ storeMetadata, params, branch, repoIdentifier })
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })

  const onRevalidate = async (): Promise<void> => {
    try {
      const response = await validatePipeline()
      const uuid = response?.data?.uuid

      if (!uuid) return

      setValidationUuid(uuid)
      closeValidationResultModal()
      closeValidationErrorModal()
    } catch (error) {
      showError(getRBACErrorMessage(error as RBACError))
    }
  }

  const onBadgeClick = (): void => {
    if (isStatusLoading(status)) {
      return
    }

    if (isStatusError(status)) {
      return openValidationErrorModal()
    }

    if (isStatusSuccess(status) || isStatusFailure(status)) {
      return openValidationResultModal()
    }
  }

  const { totalErrorCount } = useValidationErrorCount({ policyEval, status, templatesValidation })

  const validationText = useMemo(() => {
    switch (true) {
      case isStatusLoading(status):
        return getString('pipeline.validation.validating')
      case isStatusSuccess(status):
        return getString('pipeline.validation.validated')
      case isStatusError(status):
      case isStatusFailure(status):
      default:
        return null
    }
  }, [getString, status])

  const iconProps = getIconPropsByStatus(status)
  const badgeClassName = cx(css.validationBadge, {
    [css.loading]: isStatusLoading(status),
    [css.error]: isStatusError(status) || isStatusFailure(status),
    [css.success]: isStatusSuccess(status)
  })

  const showTimeago =
    Number.isFinite(endTs) &&
    !isNil(endTs) &&
    (isStatusSuccess(status) || isStatusError(status) || isStatusFailure(status))
  const showPopover = isStatusSuccess(status) || isStatusError(status) || isStatusFailure(status)
  const showBadge = !(isUpdated && isStatusSuccess(status))

  if (!showBadge) {
    return null
  }

  return (
    <div className={className}>
      <Popover disabled={!showPopover} interactionKind="hover" popoverClassName={Classes.DARK} position="bottom">
        <div data-testid="validation-badge" className={badgeClassName} onClick={onBadgeClick}>
          {iconProps && <Icon {...iconProps} />}
          {validationText && (
            <Text font={{ size: 'xsmall', weight: 'bold' }} color={Color.GREY_600}>
              {validationText}
            </Text>
          )}
          {showTimeago && <ReactTimeago date={endTs as number} live formatter={minimalTimeagoFormatter} />}
        </div>
        <ValidationPopoverContent status={status} errorCount={totalErrorCount} />
      </Popover>

      <ValidationResultModal
        isOpen={isValidationResultModalOpen}
        endTs={endTs}
        policyEval={policyEval}
        status={status}
        templatesValidation={templatesValidation}
        onClose={closeValidationResultModal}
        onRevalidate={onRevalidate}
      />
      <ValidationErrorModal
        isOpen={isValidationErrorModalOpen}
        error={validationResultError}
        onClose={closeValidationErrorModal}
        onRevalidate={onRevalidate}
      />
    </div>
  )
}
