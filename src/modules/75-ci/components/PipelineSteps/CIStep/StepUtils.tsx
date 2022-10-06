/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction } from 'react'
import type { FormikErrors } from 'formik'
import { get, isEmpty, set } from 'lodash-es'
import cx from 'classnames'
import { FontVariation, Color } from '@harness/design-system'
import {
  AllowedTypesWithExecutionTime,
  AllowedTypesWithRunTime,
  AllowedTypes,
  FormInput,
  MultiTypeInputType,
  Container,
  Text,
  FormError,
  Layout
} from '@wings-software/uicore'
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
  ConnectionType
} from '@pipeline/components/PipelineInputSetForm/CICodebaseInputSetForm'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { FormMultiTypeRadioGroupField } from '@common/components/MultiTypeRadioGroup/MultiTypeRadioGroup'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
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

export const AllMultiTypeInputTypesForStep: AllowedTypesWithRunTime[] = [
  MultiTypeInputType.FIXED,
  MultiTypeInputType.EXPRESSION,
  MultiTypeInputType.RUNTIME
]

export const AllMultiTypeInputTypesForInputSet: AllowedTypesWithExecutionTime[] = [
  MultiTypeInputType.FIXED,
  MultiTypeInputType.EXPRESSION
]
/* Field of type lists have some limitations to support all three input types */

/* a field of type list cannot assume expression as supported a value */
export const SupportedInputTypesForListTypeField: AllowedTypesWithRunTime[] = [
  MultiTypeInputType.FIXED,
  MultiTypeInputType.RUNTIME
]
/* Note:  list items do not support runtime inputs by design, captured in https://harness.atlassian.net/browse/PIE-2617 */

/* for few fields, list items cannot support be expressions due to a limitation, captured in https://harness.atlassian.net/browse/CI-3950 */
export const SupportedInputTypesForOPVarsListItems: AllowedTypesWithRunTime[] = [MultiTypeInputType.FIXED]

/* few fields are able to support expressions for list items */
export const SupportedInputTypesForListItems: AllowedTypesWithRunTime[] = [
  MultiTypeInputType.FIXED,
  MultiTypeInputType.EXPRESSION
]

export const SupportedInputTypesForListTypeFieldInInputSetView: AllowedTypesWithExecutionTime[] = [
  MultiTypeInputType.FIXED
]

export const renderBuildTypeInputField = ({
  type,
  getString,
  readonly,
  expressions,
  allowableTypes,
  prefix,
  previousBuildTypeValues,
  onChange
}: {
  type: CodebaseTypes
  getString: UseStringsReturn['getString']
  allowableTypes: AllowedTypes
  previousBuildTypeValues?: Record<string, string>
  onChange?: Dispatch<SetStateAction<Record<string, string>>>
  readonly?: boolean
  expressions?: string[]
  prefix?: string
}): JSX.Element => {
  const inputLabels = getBuildTypeInputLabels(getString)

  return (
    <FormInput.MultiTextInput
      label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{inputLabels[type]}</Text>}
      name={`${prefix}spec.build.spec.${type}`}
      multiTextInputProps={{
        expressions,
        allowableTypes
      }}
      onChange={val => onChange?.({ ...(previousBuildTypeValues || {}), [type]: val } as Record<string, string>)}
      disabled={readonly}
      className={css.bottomMargin1}
    />
  )
}

export const RenderBuild = ({
  expressions,
  readonly,
  getString,
  formik,
  allowableTypes,
  path,
  triggerIdentifier,
  stepViewType,
  isTemplatePreview
}: {
  expressions: string[]
  getString: UseStringsReturn['getString']
  formik: any
  allowableTypes: AllowedTypes
  connectorType?: ConnectorInfoDTO['type']
  readonly?: boolean
  path?: string
  triggerIdentifier?: string
  stepViewType?: string
  isTemplatePreview?: boolean
}) => {
  const radioLabels = getBuildTypeLabels(getString)
  const prefix = isEmpty(path) ? '' : `${path}.`
  const buildValue = get(formik?.values, `${prefix}spec.build`)
  const buildTypeValue = get(formik?.values, `${prefix}spec.build.type`)
  // build.type is the fieldName but as runtime input, requires special handling as build: <+input>
  const isBuildRuntimeInput = isRuntimeInput(buildValue) && stepViewType === StepViewType.InputSet
  const isBuildTypeRuntimeInput = isRuntimeInput(buildTypeValue)
  const buildTypeError = get(formik?.errors, `${prefix}spec.build`)
  const [previousBuildTypeValues, setPreviousBuildTypeValues] = React.useState<Record<string, string>>({
    ...{
      [CodebaseTypes.BRANCH]: '',
      [CodebaseTypes.TAG]: ''
    },
    [buildTypeValue]: get(formik?.values, `${prefix}spec.build.spec.${buildTypeValue}`) || ''
  })
  const shouldShowError = formik?.submitCount > 0 || triggerIdentifier // do not prematurely show error but should display on Triggers form
  const handleTypeChange = (newType: any = CodebaseTypes.BRANCH): void => {
    const newValuesSpec = get(formik.values, `${prefix}spec`)
    const persistedValue = previousBuildTypeValues[newType]
    if (isRuntimeInput(newType)) {
      // unable to currently test toggling from fixed to runtime
      /* istanbul ignore next */
      newValuesSpec.build = newType
    } else {
      newValuesSpec.build = { type: newType }
    }

    if (newValuesSpec.build?.spec) {
      delete newValuesSpec.build.spec.branch
      delete newValuesSpec.build.spec.tag
    }
    // persist previous value
    if (persistedValue) {
      newValuesSpec.build.spec = { [newType]: persistedValue }
    }
    const newValues = set(formik.values, `${prefix}spec`, newValuesSpec)
    formik.setValues({ ...newValues })
  }

  return (
    <Container>
      {isBuildRuntimeInput ? (
        <MultiTypeTextField
          label={
            <Text
              font={{ variation: FontVariation.FORM_LABEL }}
              margin={{ bottom: 'xsmall' }}
              tooltipProps={{ dataTooltipId: 'buildType' }}
            >
              {getString('filters.executions.buildType')}{' '}
            </Text>
          }
          name={`${prefix}spec.build`}
          multiTextInputProps={{
            disabled: isTemplatePreview
          }}
        />
      ) : (
        <>
          <FormMultiTypeRadioGroupField
            name={`${prefix}spec.build.type`}
            label={getString('filters.executions.buildType')}
            options={[
              { label: radioLabels['branch'], value: CodebaseTypes.BRANCH },
              { label: radioLabels['tag'], value: CodebaseTypes.TAG }
            ]}
            onChange={handleTypeChange}
            className={cx(
              (isEmpty(buildTypeValue) || isBuildTypeRuntimeInput || stepViewType === StepViewType.DeploymentForm) &&
                css.bottomMargin0
            )}
            tooltipProps={{
              dataTooltipId: 'buildType'
            }}
            multiTypeRadioGroup={{
              name: `${prefix}spec.build.type`,
              expressions,
              disabled: readonly,
              allowableTypes: (Array.isArray(allowableTypes)
                ? (allowableTypes as MultiTypeInputType[]).filter(type => type !== MultiTypeInputType.EXPRESSION)
                : allowableTypes) as AllowedTypes // dependent downstream field can support expression
            }}
          />
          {shouldShowError && buildTypeError && <FormError errorMessage={buildTypeError} name="build.type" />}
          {buildTypeValue === CodebaseTypes.BRANCH
            ? renderBuildTypeInputField({
                getString,
                expressions,
                type: buildTypeValue,
                readonly,
                allowableTypes,
                onChange: setPreviousBuildTypeValues,
                previousBuildTypeValues,
                prefix
              })
            : null}
          {buildTypeValue === CodebaseTypes.TAG
            ? renderBuildTypeInputField({
                getString,
                expressions,
                type: buildTypeValue,
                readonly,
                allowableTypes,
                onChange: setPreviousBuildTypeValues,
                previousBuildTypeValues,
                prefix
              })
            : null}
        </>
      )}
    </Container>
  )
}

export const getIsRepoNameRequired = ({
  connectorRef,
  connectorType
}: {
  connectorRef?: string | ConnectorSelectedValue
  connectorType?: string
}): boolean => !isRuntimeInput(connectorRef) && connectorType === ConnectionType.Account

const getOptionalSubLabel = (
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string,
  tooltip?: string
): React.ReactElement => (
  <Text
    tooltipProps={tooltip ? { dataTooltipId: tooltip } : {}}
    className={css.inpLabel}
    color={Color.GREY_400}
    font={{ size: 'small', weight: 'semi-bold' }}
    style={{ textTransform: 'capitalize' }}
  >
    {getString?.('common.optionalLabel')}
  </Text>
)

export const renderOptionalWrapper = ({
  label,
  optional,
  getString,
  tooltipId
}: {
  label: JSX.Element
  optional?: boolean
  getString: UseStringsReturn['getString']
  tooltipId?: string
}): JSX.Element => {
  if (optional) {
    return (
      <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
        {label}&nbsp;
        {getOptionalSubLabel(getString, tooltipId)}
      </Layout.Horizontal>
    )
  } else {
    return label
  }
}
