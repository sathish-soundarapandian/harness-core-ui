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
import type { Infrastructure } from 'services/cd-ng'

import { useDeepCompareEffect } from '@common/hooks'
import { FormMultiTypeMultiSelectDropDown } from '@common/components/MultiTypeMultiSelectDropDown/MultiTypeMultiSelectDropDown'

import { useStageFormContext } from '@pipeline/context/StageFormContext'
import { clearRuntimeInput } from '@pipeline/utils/runPipelineUtils'
import { TEMPLATE_INPUT_PATH } from '@pipeline/utils/templateUtils'
import { infraDefinitionTypeMapping } from '@pipeline/utils/stageHelpers'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'

import ExperimentalInput from '../K8sServiceSpec/K8sServiceSpecForms/ExperimentalInput'
import { useGetInfrastructuresData } from '../DeployEnvironmentEntityStep/DeployInfrastructure/useGetInfrastructuresData'
import type { DeployEnvironmentEntityConfig } from '../DeployEnvironmentEntityStep/types'
import type { DeployInfrastructureEntityCustomStepProps } from './types'

import css from './DeployInfrastructureEntityStep.module.scss'

export interface DeployInfrastructureEntityInputStepProps extends Required<DeployInfrastructureEntityCustomStepProps> {
  initialValues: DeployEnvironmentEntityConfig['environment']
  readonly: boolean
  allowableTypes: AllowedTypes
  stepViewType: StepViewType
  inputSetData?: {
    template?: DeployEnvironmentEntityConfig['environment']
    path?: string
    readonly?: boolean
  }
}

export default function DeployInfrastructureEntityInputStep({
  initialValues,
  allowableTypes,
  inputSetData,
  deploymentType,
  stepViewType,
  environmentIdentifier,
  isMultipleInfrastructure
}: DeployInfrastructureEntityInputStepProps): React.ReactElement {
  const { getString } = useStrings()
  const formik = useFormikContext<DeployEnvironmentEntityConfig>()
  const { updateStageFormTemplate } = useStageFormContext()
  const uniquePath = React.useRef(`_pseudo_field_${uuid()}`)

  const pathPrefix = isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`
  const isStageTemplateInputSetForm = inputSetData?.path?.startsWith(TEMPLATE_INPUT_PATH)

  const infrastructureValue = get(initialValues, `infrastructureDefinitions.[0].identifier`)

  const infrastructureValues = get(initialValues, 'infrastructureDefinitions')

  const infrastructureIdentifiers: string[] = useMemo(() => {
    if (!isMultipleInfrastructure && infrastructureValue) {
      return [infrastructureValue]
    }

    if (isMultipleInfrastructure && Array.isArray(infrastructureValues)) {
      return infrastructureValues.map(infraValue => infraValue.identifier)
    }

    return []
  }, [isMultipleInfrastructure, infrastructureValue, infrastructureValues])

  const {
    infrastructuresList,
    infrastructuresData,
    loadingInfrastructuresList,
    loadingInfrastructuresData,
    // This is required only when updating the entities list
    updatingInfrastructuresData
  } = useGetInfrastructuresData({ infrastructureIdentifiers, environmentIdentifier, deploymentType })

  const selectOptions = useMemo(() => {
    /* istanbul ignore else */
    if (!isNil(infrastructuresList)) {
      return infrastructuresList.map(infrastructureInList => ({
        label: infrastructureInList.name,
        value: infrastructureInList.identifier
      }))
    }

    return []
  }, [infrastructuresList])

  const loading = loadingInfrastructuresList || loadingInfrastructuresData || updatingInfrastructuresData

  useDeepCompareEffect(() => {
    // if this is a multi infrastructures, then set up a dummy field,
    // so that infrastructures can be updated in this dummy field
    if (isMultipleInfrastructure) {
      formik.setFieldValue(
        uniquePath.current,
        infrastructureIdentifiers.map(infrastructureId => ({
          label: defaultTo(
            infrastructuresList.find(infrastructureInList => infrastructureInList.identifier === infrastructureId)
              ?.name,
            infrastructureId
          ),
          value: infrastructureId
        }))
      )
    }
  }, [infrastructuresList])

  useDeepCompareEffect(() => {
    // On load of data
    // if no value is selected, clear the inputs and template
    if (infrastructureIdentifiers.length === 0) {
      if (isMultipleInfrastructure) {
        updateStageFormTemplate(RUNTIME_INPUT_VALUE, `${pathPrefix}infrastructureDefinitions`)
        formik.setFieldValue(`${pathPrefix}infrastructureDefinitions`, [])
      } else {
        updateStageFormTemplate(
          [
            {
              identifier: '',
              inputs: RUNTIME_INPUT_VALUE
            }
          ],
          `${pathPrefix}infrastructureDefinitions`
        )

        formik.setFieldValue(`${pathPrefix}infrastructureDefinitions`, [])
      }
      return
    }

    // updated template based on selected infrastructures
    const newInfrastructuresTemplate = infrastructureIdentifiers.map(infraId => {
      return {
        identifier: infraId,
        inputs: infrastructuresData.find(infraTemplate => infraTemplate.infrastructureDefinition.identifier === infraId)
          ?.infrastructureInputs
      }
    })

    // updated values based on selected infrastructures
    const newInfrastructuresValues = infrastructureIdentifiers.map(infraId => {
      const infraTemplateValue = infrastructuresData.find(
        envTemplate => envTemplate.infrastructureDefinition.identifier === infraId
      )?.infrastructureInputs

      return {
        identifier: infraId,
        inputs: infraTemplateValue ? clearRuntimeInput(infraTemplateValue) : undefined
      }
    })

    if (isMultipleInfrastructure) {
      updateStageFormTemplate(newInfrastructuresTemplate, `${pathPrefix}infrastructureDefinitions`)
      formik.setFieldValue(`${pathPrefix}infrastructureDefinitions`, newInfrastructuresValues)
    } else {
      updateStageFormTemplate(newInfrastructuresTemplate[0], `${pathPrefix}infrastructureDefinitions[0]`)

      formik.setFieldValue(
        `${pathPrefix}infrastructureDefinitions[0]`,
        defaultTo(newInfrastructuresValues[0], isStageTemplateInputSetForm ? RUNTIME_INPUT_VALUE : [])
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infrastructuresData, infrastructureIdentifiers])

  const onInfrastructureRefChange = (value: SelectOption): void => {
    if (
      isStageTemplateInputSetForm &&
      getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME &&
      inputSetData?.path
    ) {
      return
    }
  }

  function handleInfrastructuresChange(values: SelectOption[]): void {
    const newValues = values.map(val => ({
      identifier: val.value as string,
      infrastructureInputs: RUNTIME_INPUT_VALUE
    }))

    formik.setFieldValue(`${pathPrefix}infrastructureDefinitions`, newValues)
  }

  const deploymentStageInputSet = get(formik?.values, pathPrefix, {})
  const infrastructureDefinitionsTemplate = inputSetData?.template?.infrastructureDefinitions

  return (
    <>
      <Layout.Horizontal spacing="medium" style={{ alignItems: 'flex-end' }}>
        {!isMultipleInfrastructure && (
          <ExperimentalInput
            tooltipProps={{ dataTooltipId: 'specifyYourInfrastructure' }}
            label={getString('cd.pipelineSteps.environmentTab.specifyYourInfrastructure')}
            name={`${pathPrefix}infrastructureDefinitions[0].identifier`}
            placeholder={getString('cd.pipelineSteps.environmentTab.selectInfrastructure')}
            selectItems={selectOptions}
            useValue
            multiTypeInputProps={{
              allowableTypes: allowableTypes,
              selectProps: {
                addClearBtn: !inputSetData?.readonly,
                items: selectOptions
              },
              onChange: onInfrastructureRefChange
            }}
            disabled={inputSetData?.readonly}
            className={css.inputWidth}
            formik={formik}
          />
        )}
        {isMultipleInfrastructure && (
          <FormMultiTypeMultiSelectDropDown
            tooltipProps={{ dataTooltipId: 'specifyYourInfrastructure' }}
            label={getString('cd.pipelineSteps.environmentTab.specifyYourInfrastructure')}
            name={uniquePath.current}
            disabled={inputSetData?.readonly || loading}
            dropdownProps={{
              items: selectOptions,
              placeholder: getString('common.infrastructures'),
              disabled: loading || inputSetData?.readonly
            }}
            onChange={handleInfrastructuresChange}
            multiTypeProps={{
              width: 300,
              allowableTypes
            }}
          />
        )}
        {loading ? <Spinner className={css.inputSetSpinner} size={16} /> : null}
      </Layout.Horizontal>
      {Array.isArray(infrastructureDefinitionsTemplate)
        ? infrastructureDefinitionsTemplate.map((infrastructureDefinitionTemplate, index) => {
            const infraInputs = infrastructureDefinitionTemplate.inputs

            return infraInputs?.identifier ? (
              <StepWidget<Infrastructure>
                key={infraInputs.identifier}
                factory={factory}
                template={infraInputs?.spec}
                initialValues={{
                  ...deploymentStageInputSet?.infrastructureDefinitions?.[index]?.inputs?.spec,
                  environmentRef: environmentIdentifier,
                  infrastructureRef: infraInputs.identifier
                }}
                allowableTypes={allowableTypes}
                allValues={{
                  // ...deploymentStage?.environment?.infrastructureDefinitions?.[0]?.inputs?.spec,
                  environmentRef: environmentIdentifier,
                  infrastructureRef: infraInputs.identifier
                }}
                type={(infraDefinitionTypeMapping[infraInputs.type as StepType] || infraInputs?.type) as StepType}
                path={`${pathPrefix}infrastructureDefinitions.${index}.inputs.spec`}
                readonly={inputSetData?.readonly}
                stepViewType={stepViewType}
                customStepProps={{
                  // ...getCustomStepProps((deploymentStage?.deploymentType as StepType) || '', getString),
                  // serviceRef: deploymentStage?.service?.serviceRef,
                  environmentRef: environmentIdentifier,
                  infrastructureRef: infraInputs.identifier
                }}
                onUpdate={data => {
                  /* istanbul ignore next */
                  if (deploymentStageInputSet?.infrastructureDefinitions?.[index]?.inputs?.spec) {
                    deploymentStageInputSet.infrastructureDefinitions[index].inputs.spec = data
                    formik.setValues(set(formik.values, pathPrefix, deploymentStageInputSet))
                  }
                }}
              />
            ) : null
          })
        : null}
    </>
  )
}
