/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import type { MultiSelectOption, SelectOption } from '@wings-software/uicore'
import type { FormikContextType } from 'formik'
import type { JiraFieldNG, JiraStatusNG } from 'services/cd-ng'
import type { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

export enum ApprovalRejectionCriteriaType {
  Jexl = 'Jexl',
  KeyValues = 'KeyValues'
}

export interface ApprovalRejectionCriteriaCondition {
  key: string
  operator: string
  value: string | SelectOption | MultiSelectOption[]
}

export interface ApprovalRejectionCriteria {
  type: ApprovalRejectionCriteriaType
  spec: {
    // if type is Jexl
    expression?: string

    // If type is KV
    matchAnyCondition?: boolean
    conditions?: ApprovalRejectionCriteriaCondition[]
  }
}

export interface ApprovalRejectionCriteriaProps {
  mode: string
  values: ApprovalRejectionCriteria
  onChange: (values: ApprovalRejectionCriteria) => void
  statusList: JiraStatusNG[]
  fieldList: JiraFieldNG[]
  isFetchingFields?: boolean
  formik: FormikContextType<any>
  readonly?: boolean
  title: string
  stepType: StepType
}

export interface ConditionsInterface extends ApprovalRejectionCriteriaProps {
  allowedFieldKeys: SelectOption[]
  allowedValuesForFields: Record<string, SelectOption[]>
}
