/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { defaultTo, get, isEmpty, isNil, set } from 'lodash-es'
import { useFormikContext } from 'formik'
import { Spinner } from '@blueprintjs/core'
import { v4 as uuid } from 'uuid'

import {
  AllowedTypes,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  RUNTIME_INPUT_VALUE,
  SelectOption
} from '@harness/uicore'

import { useStrings } from 'framework/strings'
import type { EnvironmentYamlV2 } from 'services/cd-ng'

import { useDeepCompareEffect } from '@common/hooks'
import { FormMultiTypeMultiSelectDropDown } from '@common/components/MultiTypeMultiSelectDropDown/MultiTypeMultiSelectDropDown'

import { useStageFormContext } from '@pipeline/context/StageFormContext'
import { clearRuntimeInput } from '@pipeline/utils/runPipelineUtils'
import { TEMPLATE_INPUT_PATH } from '@pipeline/utils/templateUtils'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import type { DeployEnvironmentEntityConfig, DeployEnvironmentEntityCustomStepProps } from './types'
import ExperimentalInput from '../K8sServiceSpec/K8sServiceSpecForms/ExperimentalInput'
import { useGetEnvironmentsData } from './DeployEnvironment/useGetEnvironmentsData'

import css from './DeployEnvironmentEntityStep.module.scss'

export interface DeployEnvironmentEntityInputStepProps extends Required<DeployEnvironmentEntityCustomStepProps> {
  initialValues: DeployEnvironmentEntityConfig
  readonly: boolean
  allowableTypes: AllowedTypes
  stepViewType: StepViewType
  inputSetData?: {
    template?: DeployEnvironmentEntityConfig
    path?: string
    readonly?: boolean
  }
}

export default function DeployEnvironmentEntityInputStep({
  initialValues,
  allowableTypes,
  inputSetData,
  deploymentType,
  stepViewType
}: DeployEnvironmentEntityInputStepProps): React.ReactElement {
  const { getString } = useStrings()
  const { getStageFormTemplate, updateStageFormTemplate } = useStageFormContext()
  const formik = useFormikContext()
  const uniquePath = React.useRef(`_pseudo_field_${uuid()}`)

  const pathPrefix = isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`
  const isStageTemplateInputSetForm = inputSetData?.path?.startsWith(TEMPLATE_INPUT_PATH)

  const environmentValue = get(initialValues, `environment.environmentRef`)
  const environmentTemplate = inputSetData?.template?.environment?.environmentRef

  const environmentValues: EnvironmentYamlV2[] = get(initialValues, `environments.values`, [])
  const environmentsTemplate = inputSetData?.template?.environments?.values

  const envIdentifiers: string[] = useMemo(() => {
    if (environmentValue) {
      return [environmentValue]
    }

    if (Array.isArray(environmentValues)) {
      return environmentValues.map(envValue => envValue.environmentRef)
    }

    return []
  }, [environmentValue, environmentValues])

  const {
    environmentsList,
    environmentsData,
    loadingEnvironmentsList,
    loadingEnvironmentsData,
    // This is required only when updating the entities list
    updatingEnvironmentsData
  } = useGetEnvironmentsData({ envIdentifiers })

  const selectOptions = useMemo(() => {
    /* istanbul ignore else */
    if (!isNil(environmentsList)) {
      return environmentsList.map(environmentInList => ({
        label: environmentInList.name,
        value: environmentInList.identifier
      }))
    }

    return []
  }, [environmentsList])

  const loading = loadingEnvironmentsList || loadingEnvironmentsData || updatingEnvironmentsData

  // If environments.values is a runtime value. This condition is the same as
  // one used to load environments runtime values in StageInputSetForm
  const isMultiEnvTemplate =
    getMultiTypeFromValue(environmentsTemplate as unknown as string) === MultiTypeInputType.RUNTIME ||
    (Array.isArray(environmentsTemplate) &&
      environmentsTemplate.some(env => getMultiTypeFromValue(env.environmentRef) === MultiTypeInputType.RUNTIME))

  useDeepCompareEffect(() => {
    // if this is a multi environment template, then set up a dummy field,
    // so that environments can be updated in this dummy field
    if (isMultiEnvTemplate) {
      formik.setFieldValue(
        uniquePath.current,
        envIdentifiers.map(environmentId => ({
          label: defaultTo(
            environmentsList.find(environmentInList => environmentInList.identifier === environmentId)?.name,
            environmentId
          ),
          value: environmentId
        }))
      )
    }
  }, [environmentsList])

  useDeepCompareEffect(() => {
    // On load of data
    // if no value is selected, clear the inputs and template
    if (envIdentifiers.length === 0) {
      if (isMultiEnvTemplate) {
        updateStageFormTemplate(RUNTIME_INPUT_VALUE, `${pathPrefix}environments.values`)
        formik.setFieldValue(`${pathPrefix}environments.values`, [])
      } else {
        const stageTemplate = getStageFormTemplate<DeployEnvironmentEntityConfig>(`${pathPrefix}environment`)

        set(stageTemplate, 'environmentInputs', RUNTIME_INPUT_VALUE)
        set(stageTemplate, 'infrastructureDefinitions', RUNTIME_INPUT_VALUE)

        updateStageFormTemplate(stageTemplate, `${pathPrefix}environment`)

        formik.setFieldValue(`${pathPrefix}environment`, {
          ...get(formik.values, `${pathPrefix}environment`),
          environmentInputs: {},
          infrastructureDefinitions: []
        })
      }
      return
    }

    // // updated template based on selected environments
    const newEnvironmentsTemplate: EnvironmentYamlV2[] = envIdentifiers.map(envId => {
      return {
        environmentRef: RUNTIME_INPUT_VALUE,
        environmentInputs: environmentsData.find(envTemplate => envTemplate.environment.identifier === envId)
          ?.environmentInputs,
        ...(isMultiEnvTemplate && { infrastructureDefinitions: RUNTIME_INPUT_VALUE as any })
      }
    })

    // updated values based on selected environments
    const newEnvironmentsValues: EnvironmentYamlV2[] = envIdentifiers.map(envId => {
      const envTemplateValue = environmentsData.find(
        envTemplate => envTemplate.environment.identifier === envId
      )?.environmentInputs

      return {
        environmentRef: envId,
        environmentInputs: envTemplateValue ? clearRuntimeInput(envTemplateValue) : undefined,
        ...(isMultiEnvTemplate && { infrastructureDefinitions: [] })
      }
    })

    if (isMultiEnvTemplate) {
      updateStageFormTemplate(newEnvironmentsTemplate, `${pathPrefix}environments.values`)
      formik.setFieldValue(`${pathPrefix}environments.values`, newEnvironmentsValues)
    } else {
      const stageTemplate = getStageFormTemplate<DeployEnvironmentEntityConfig>(`${pathPrefix}environment`)

      set(
        stageTemplate,
        'environmentInputs',
        defaultTo(newEnvironmentsTemplate[0].environmentInputs, isStageTemplateInputSetForm ? RUNTIME_INPUT_VALUE : {})
      )

      set(
        stageTemplate,
        'infrastructureDefinitions',
        defaultTo(
          newEnvironmentsTemplate[0].infrastructureDefinitions,
          isStageTemplateInputSetForm ? RUNTIME_INPUT_VALUE : []
        )
      )

      updateStageFormTemplate(stageTemplate, `${pathPrefix}environment`)

      formik.setFieldValue(`${pathPrefix}environment`, {
        ...get(formik.values, `${pathPrefix}environment`),
        environmentInputs: defaultTo(
          newEnvironmentsValues[0].environmentInputs,
          isStageTemplateInputSetForm ? RUNTIME_INPUT_VALUE : {}
        ),
        infrastructureDefinitions: defaultTo(
          newEnvironmentsValues[0].infrastructureDefinitions,
          isStageTemplateInputSetForm ? RUNTIME_INPUT_VALUE : []
        )
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentsData, envIdentifiers])

  const onEnvironmentRefChange = (value: SelectOption): void => {
    if (
      isStageTemplateInputSetForm &&
      getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME &&
      inputSetData?.path
    ) {
      formik.setFieldValue(`${pathPrefix}environment`, {
        environmentRef: RUNTIME_INPUT_VALUE,
        environmentInputs: RUNTIME_INPUT_VALUE,
        infrastructureDefinitions: RUNTIME_INPUT_VALUE
      })
    }
  }

  function handleEnvironmentsChange(values: SelectOption[]): void {
    const newValues = values.map(val => ({
      environmentRef: val.value as string,
      environmentInputs: RUNTIME_INPUT_VALUE,
      infrastructureDefinitions: RUNTIME_INPUT_VALUE
    }))

    formik.setFieldValue(`${pathPrefix}environments.values`, newValues)
  }

  return (
    <>
      <Layout.Horizontal spacing="medium" style={{ alignItems: 'flex-end' }}>
        {getMultiTypeFromValue(environmentTemplate) === MultiTypeInputType.RUNTIME ? (
          <ExperimentalInput
            tooltipProps={{ dataTooltipId: 'specifyYourEnvironment' }}
            label={getString('cd.pipelineSteps.environmentTab.specifyYourEnvironment')}
            name={`${pathPrefix}environment.environmentRef`}
            placeholder={getString('cd.pipelineSteps.environmentTab.selectEnvironment')}
            selectItems={selectOptions}
            useValue
            multiTypeInputProps={{
              allowableTypes: allowableTypes,
              selectProps: {
                addClearBtn: !inputSetData?.readonly,
                items: selectOptions
              },
              onChange: onEnvironmentRefChange
            }}
            disabled={inputSetData?.readonly}
            className={css.inputWidth}
            formik={formik}
          />
        ) : null}

        {isMultiEnvTemplate ? (
          <FormMultiTypeMultiSelectDropDown
            tooltipProps={{ dataTooltipId: 'specifyYourEnvironment' }}
            label={getString('cd.pipelineSteps.environmentTab.specifyYourEnvironment')}
            name={uniquePath.current}
            disabled={inputSetData?.readonly || loading}
            dropdownProps={{
              items: selectOptions,
              placeholder: getString('environments'),
              disabled: loading || inputSetData?.readonly
            }}
            onChange={handleEnvironmentsChange}
            multiTypeProps={{
              width: 300,
              allowableTypes
            }}
          />
        ) : null}

        {loading ? <Spinner className={css.inputSetSpinner} size={16} /> : null}
      </Layout.Horizontal>
      {Array.isArray(inputSetData?.template?.environment?.infrastructureDefinitions) && (
        <StepWidget
          factory={factory}
          initialValues={get(initialValues, 'environment')}
          template={get(inputSetData?.template, 'environment')}
          type={StepType.DeployInfrastructureEntity}
          stepViewType={stepViewType}
          path={`${inputSetData?.path}.environment`}
          allowableTypes={allowableTypes}
          readonly={inputSetData?.readonly}
          customStepProps={{
            deploymentType: deploymentType,
            environmentIdentifier: get(formik.values, `${pathPrefix}environment.environmentRef`)
          }}
        />
      )}
    </>
  )
}
