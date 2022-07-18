/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikErrors } from 'formik'
import { get, isEmpty, set } from 'lodash-es'
import cx from 'classnames'
import { FontVariation } from '@harness/design-system'
import { FormInput, MultiTypeInputType, Container, Text } from '@wings-software/uicore'
import type { UseFromStageInfraYaml } from 'services/ci'
import type { StringsMap } from 'stringTypes'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { BuildStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import type { UseStringsReturn } from 'framework/strings'
import { isRuntimeInput, CodebaseTypes } from '@pipeline/utils/CIUtils'
import {
  getBuildTypeLabels,
  getBuildTypeInputLabels,
  CodeBaseType
} from '@pipeline/components/PipelineInputSetForm/CICodebaseInputSetForm'
import { FormMultiTypeRadioGroupField } from '@common/components/MultiTypeRadioGroup/MultiTypeRadioGroup'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
export const useGetPropagatedStageById = (
  stageId: string
): StageElementWrapper<BuildStageElementConfig> | undefined => {
  const { getStageFromPipeline } = usePipelineContext()

  const { stage: currentStage } = getStageFromPipeline<BuildStageElementConfig>(stageId || '')

  const isPropagatedStage = !isEmpty((currentStage?.stage?.spec?.infrastructure as UseFromStageInfraYaml)?.useFromStage)
  const { stage: propagatedStage } = getStageFromPipeline<BuildStageElementConfig>(
    (currentStage?.stage?.spec?.infrastructure as UseFromStageInfraYaml)?.useFromStage
  )
  return isPropagatedStage ? propagatedStage : currentStage
}

export const validateConnectorRefAndImageDepdendency = (
  connectorRef: string,
  image: string,
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
): FormikErrors<any> => {
  const errors: FormikErrors<any> = {}
  if (connectorRef && !image) {
    errors['spec.image'] = getString('ci.buildInfra.awsVM.isRequiredWhen', {
      field1: getString('imageLabel'),
      field2: getString('pipelineSteps.connectorLabel')
    })
  } else if (!connectorRef && image) {
    errors['spec.connectorRef'] = getString('ci.buildInfra.awsVM.isRequiredWhen', {
      field2: getString('imageLabel'),
      field1: getString('pipelineSteps.connectorLabel')
    })
  }
  return errors
}

export const AllMultiTypeInputTypesForStep = [
  MultiTypeInputType.FIXED,
  MultiTypeInputType.EXPRESSION,
  MultiTypeInputType.RUNTIME
]

export const AllMultiTypeInputTypesForInputSet = [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]

/* Field of type lists have some limitations to support all three input types */

/* a field of type list cannot assume expression as supported a value */
export const SupportedInputTypesForListTypeField = [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]

/* Note:  list items do not support runtime inputs by design, captured in https://harness.atlassian.net/browse/PIE-2617 */

/* for few fields, list items cannot support be expressions due to a limitation, captured in https://harness.atlassian.net/browse/CI-3950 */
export const SupportedInputTypesForOPVarsListItems = [MultiTypeInputType.FIXED]

/* few fields are able to support expressions for list items */
export const SupportedInputTypesForListItems = [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]

export const SupportedInputTypesForListTypeFieldInInputSetView = [MultiTypeInputType.FIXED]

export const renderBuildTypeInputField = ({
  type,
  inputLabels,
  readonly,
  expressions,
  allowableTypes,
  prefix
}: {
  type: CodeBaseType
  inputLabels: Record<string, string>
  allowableTypes: MultiTypeInputType[]
  readonly?: boolean
  expressions?: string[]
  prefix?: string
}): JSX.Element => {
  return (
    <FormInput.MultiTextInput
      label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{inputLabels[type]}</Text>}
      name={`${prefix}spec.build.spec.${type}`}
      multiTextInputProps={{
        expressions,
        allowableTypes
      }}
      disabled={readonly}
      className={css.bottomMargin1}
    />
  )
}

export const renderBuild = ({
  expressions,
  readonly,
  getString,
  formik,
  allowableTypes,
  path
}: {
  expressions: string[]
  getString: UseStringsReturn['getString']
  formik: any
  allowableTypes: MultiTypeInputType[]
  connectorType?: ConnectorInfoDTO['type']
  readonly?: boolean
  path?: string
}) => {
  const radioLabels = getBuildTypeLabels(getString)
  const inputLabels = getBuildTypeInputLabels(getString)
  const prefix = isEmpty(path) ? '' : `${path}.`
  const buildTypeValue = get(formik?.values, `${prefix}spec.build.type`)
  // either can be true onEdit or onChange before Saving
  const isBuildRuntimeInput =
    isRuntimeInput(get(formik?.values, `${prefix}spec.build`)) || isRuntimeInput(buildTypeValue)

  const handleTypeChange = (newType: any = CodebaseTypes.branch): void => {
    const newValuesSpec = get(formik.values, `${prefix}spec`)
    if (isRuntimeInput(newType)) {
      newValuesSpec.build = newType
    } else {
      newValuesSpec.build = { type: newType }
    }
    if (newValuesSpec.build?.spec) {
      delete newValuesSpec.build.spec.branch
      delete newValuesSpec.build.spec.tag
    }
    const newValues = set(formik.values, `${prefix}spec`, newValuesSpec)
    formik?.setValues({ ...newValues })
  }

  return (
    <Container>
      <FormMultiTypeRadioGroupField
        name={`${prefix}spec.build.type`}
        label={getString('filters.executions.buildType')}
        options={[
          { label: radioLabels['branch'], value: CodebaseTypes.branch },
          { label: radioLabels['tag'], value: CodebaseTypes.tag }
        ]}
        onChange={handleTypeChange}
        className={cx(css.radioGroup, isBuildRuntimeInput && css.bottomMargin0)}
        tooltipProps={{
          dataTooltipId: 'buildType'
        }}
        multiTypeRadioGroup={{
          name: `${prefix}spec.build.type`,
          expressions,
          disabled: readonly,
          allowableTypes: allowableTypes.filter(type => type !== MultiTypeInputType.EXPRESSION)
        }}
      />
      {buildTypeValue === CodebaseTypes.branch
        ? renderBuildTypeInputField({ inputLabels, type: buildTypeValue, readonly, allowableTypes, prefix })
        : null}
      {buildTypeValue === CodebaseTypes.tag
        ? renderBuildTypeInputField({ inputLabels, type: buildTypeValue, readonly, allowableTypes, prefix })
        : null}
    </Container>
  )
}
