/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Color } from '@harness/design-system'
import type { IconProps } from '@harness/icons'
import { Text } from '@harness/uicore'
import type { Formatter } from 'react-timeago'
import type { Evaluation } from 'services/pm'
import type { TemplateValidationResponseDTO } from 'services/pipeline-ng'

export type ValidationStatus = 'INITIATED' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILURE' | 'ERROR' | 'TERMINATED'

export const loadingStatus: ValidationStatus[] = ['INITIATED', 'IN_PROGRESS']
export const successStatus: ValidationStatus[] = ['SUCCESS']
export const failureStatus: ValidationStatus[] = ['FAILURE']
export const errorStatus: ValidationStatus[] = ['ERROR', 'TERMINATED']

export const isStatusLoading = (status: ValidationStatus | undefined): boolean =>
  !!status && loadingStatus.includes(status)
export const isStatusSuccess = (status: ValidationStatus | undefined): boolean =>
  !!status && successStatus.includes(status)
export const isStatusFailure = (status: ValidationStatus | undefined): boolean =>
  !!status && failureStatus.includes(status)
export const isStatusError = (status: ValidationStatus | undefined): boolean => !!status && errorStatus.includes(status)

export const getIconPropsByStatus = (status: ValidationStatus | undefined): IconProps | undefined => {
  switch (true) {
    case isStatusError(status):
    case isStatusFailure(status):
      return { name: 'warning-sign', color: Color.RED_700 }
    case isStatusLoading(status):
      return { name: 'steps-spinner', color: Color.PRIMARY_7 }
    case isStatusSuccess(status):
      return { name: 'tick', color: Color.PRIMARY_7 }
    default:
      return
  }
}

export const minimalTimeagoFormatter: Formatter = (value, unit, suffix) => {
  if (suffix === 'from now') return null
  return (
    <Text font={{ size: 'xsmall' }} color={Color.GREY_600}>
      {`${value}${unit.at(0)} ${suffix}`}
    </Text>
  )
}

export const getPolicySetsErrorCount = (policyEval?: Evaluation): number => {
  if (!Array.isArray(policyEval?.details) || policyEval?.status !== 'error') {
    return 0
  }

  return policyEval.details.reduce((count, detail) => {
    if (detail.status === 'error') return count + 1
    return count
  }, 0)
}

export type ValidationArea = 'template' | 'policy'
export type ValidationAreaStatus = 'success' | 'failure' | 'pending'

export const useValidationErrorCount = ({
  policyEval,
  templatesValidation,
  status
}: {
  policyEval: Evaluation | undefined
  templatesValidation: TemplateValidationResponseDTO | undefined
  status: ValidationStatus | undefined
}): {
  totalErrorCount: number
  templatesErrorCount: number
  policySetsErrorCount: number
} => {
  const policySetsErrorCount = useMemo(() => getPolicySetsErrorCount(policyEval), [policyEval])
  const templatesErrorCount = templatesValidation?.validYaml === false ? 1 : 0
  const totalErrorCount = (() => {
    if (isStatusError(status)) return 1
    if (isStatusFailure(status)) return policySetsErrorCount + templatesErrorCount
    return 0
  })()

  return {
    totalErrorCount,
    templatesErrorCount,
    policySetsErrorCount
  }
}

export const useValidationSummary = ({
  policyEval,
  templatesValidation
}: {
  policyEval: Evaluation | undefined
  templatesValidation: TemplateValidationResponseDTO | undefined
  status: ValidationStatus | undefined
}): {
  [K in ValidationArea]: {
    status: ValidationAreaStatus
  }
} => {
  const templateStatus: ValidationAreaStatus = (() => {
    switch (templatesValidation?.validYaml) {
      case true:
        return 'success'
      case false:
        return 'failure'
      default:
        return 'pending'
    }
  })()

  const policyStatus: ValidationAreaStatus = (() => {
    switch (policyEval?.status) {
      case 'pass':
      case 'warning':
        return 'success'
      case 'error':
        return 'failure'
      // policyEval.status can be falsy if there are no active policy sets (this is considered as success)
      // or if policy sets are not validated because of template errors (this is considered as pending)
      default: {
        if (templateStatus === 'failure' || templateStatus === 'pending') {
          return 'pending'
        }
        return 'success'
      }
    }
  })()

  return {
    template: {
      status: templateStatus
    },
    policy: {
      status: policyStatus
    }
  }
}
