/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import type { FormikProps } from 'formik'
import type { GetDataError } from 'restful-react'
import type { AllowedTypes, SelectOption } from '@harness/uicore'
import type { InputSetData, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { Failure } from 'services/cd-ng'
import type { AllFailureStrategyConfig } from '../../AdvancedSteps/FailureStrategyPanel/utils'
import type { jobParameterInterface } from '../JenkinsStep/types'

export interface BambooStepSpec {
  connectorRef: SelectOption | string
  planName: string
  planParameter: jobParameterInterface[] | string
  delegateSelectors: string[]
  unstableStatusAsSuccess?: boolean
  useConnectorUrlForJobExecution?: boolean
}

export interface BambooStepData {
  identifier: string
  name?: string
  type: string
  timeout?: string
  failureStrategies?: AllFailureStrategyConfig[]
  spec: BambooStepSpec
}

export interface BambooInputStepProps {
  initialValues: BambooStepData
  allowableTypes: AllowedTypes
  template: BambooStepData | null
  path: string
  readonly: boolean
  stepViewType: StepViewType
  inputSetData?: InputSetData<BambooStepData>
  onUpdate?: (data: BambooStepData) => void
  onChange?: (data: BambooStepData) => void
}

export interface BambooStepDeploymentModeProps {
  stepViewType: StepViewType
  initialValues: BambooStepData
  allowableTypes: AllowedTypes
  onUpdate?: (data: BambooStepData) => void
  inputSetData?: InputSetData<BambooStepData>
  formik?: any
}

export interface BambooFormContentInterface {
  formik: FormikProps<BambooStepData>
  stepViewType: StepViewType
  allowableTypes: AllowedTypes
  projectsFetchError?: GetDataError<Failure | Error> | null
  projectMetadataFetchError?: GetDataError<Failure | Error> | null
  isNewStep?: boolean
  readonly?: boolean
}
