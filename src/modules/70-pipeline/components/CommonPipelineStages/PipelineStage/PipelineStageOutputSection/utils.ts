/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { AllowedTypes, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import type { FormikErrors, FormikProps } from 'formik'
import { get, isEmpty, set } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings'
import type { PipelineStageOutputs } from 'services/pipeline-ng'

export const MAX_LENGTH = 64

export interface PipelineStageOutputSectionProps {
  children: React.ReactElement
}

export interface PipelineStageOutputData {
  outputs: PipelineStageOutputs[]
}

export interface OutputPanelInputSetProps {
  template: PipelineStageOutputData
  path: string
  allowableTypes: AllowedTypes
  readonly?: boolean
}

export interface ConectedOutputPanelInputSetProps extends OutputPanelInputSetProps {
  formik: FormikProps<PipelineStageOutputData>
}

interface ValidateOutputPanelInputSetProp {
  data: PipelineStageOutputData
  template?: PipelineStageOutputData
  getString?: UseStringsReturn['getString']
}

export const validateOutputPanelInputSet = ({
  data,
  template,
  getString
}: ValidateOutputPanelInputSetProp): FormikErrors<PipelineStageOutputData> => {
  const errors: FormikErrors<PipelineStageOutputData> = { outputs: [] }
  data?.outputs?.forEach((output: PipelineStageOutputs, index: number) => {
    const currentVariableTemplate = get(template, `outputs[${index}].value`, '')
    if (isEmpty(output.value) && getMultiTypeFromValue(currentVariableTemplate) === MultiTypeInputType.RUNTIME) {
      set(errors, `outputs[${index}].value`, getString?.('fieldRequired', { field: output.name }))
    }
  })
  return errors
}
