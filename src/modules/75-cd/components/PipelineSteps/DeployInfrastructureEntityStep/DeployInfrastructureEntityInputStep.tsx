/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo, useRef, useState } from 'react'
import { cloneDeep, defaultTo, get, isBoolean, isEmpty, isEqual, isNil, isUndefined, pick, set } from 'lodash-es'
import { useFormikContext } from 'formik'
import { Spinner } from '@blueprintjs/core'
import { v4 as uuid } from 'uuid'
import produce from 'immer'

import {
  AllowedTypes,
  ExpressionAndRuntimeTypeProps,
  FormInput,
  Layout,
  MultiTypeInputType,
  MultiTypeInputValue,
  RUNTIME_INPUT_VALUE,
  SelectOption
} from '@harness/uicore'

import { useStrings } from 'framework/strings'

import type { InfraStructureDefinitionYaml } from 'services/cd-ng'

import { useDeepCompareEffect } from '@common/hooks'
import { FormMultiTypeMultiSelectDropDown } from '@common/components/MultiTypeMultiSelectDropDown/MultiTypeMultiSelectDropDown'
import { SELECT_ALL_OPTION } from '@common/components/MultiTypeMultiSelectDropDown/MultiTypeMultiSelectDropDownUtils'
import { isMultiTypeExpression, isValueExpression, isValueRuntimeInput } from '@common/utils/utils'
import { getScopeAppendedToIdentifier } from '@common/utils/StringUtils'

import { useStageFormContext } from '@pipeline/context/StageFormContext'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { useGetInfrastructuresData } from '../DeployEnvironmentEntityStep/DeployInfrastructure/useGetInfrastructuresData'
import type { DeployEnvironmentEntityConfig } from '../DeployEnvironmentEntityStep/types'
import type { DeployInfrastructureEntityCustomInputStepProps } from './types'
import { createInfraTemplate, createInfraValues } from './utils'

import css from './DeployInfrastructureEntityStep.module.scss'

export interface DeployInfrastructureEntityInputStepProps
  extends Required<DeployInfrastructureEntityCustomInputStepProps> {
  initialValues: DeployEnvironmentEntityConfig['environment']
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
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
  customDeploymentRef,
  environmentIdentifier,
  isMultipleInfrastructure,
  deployToAllInfrastructures,
  scope,
  stepViewType,
  areEnvironmentFiltersAdded,
  lazyInfrastructure
}: DeployInfrastructureEntityInputStepProps): React.ReactElement {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const formik = useFormikContext<DeployEnvironmentEntityConfig>()
  const { getStageFormTemplate, updateStageFormTemplate } = useStageFormContext()
  const uniquePath = useRef(`_pseudo_field_${uuid()}`)

  // This is the full path that is part of the outer formik
  const fullPathPrefix = isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`
  const localPath = 'infrastructureDefinitions'
  const pathForDeployToAll = 'deployToAll'

  // Start - Custom Deployment Template specific
  const { templateRef: deploymentTemplateIdentifier, versionLabel } = customDeploymentRef || {}
  const shouldAddCustomDeploymentData =
    deploymentType === ServiceDeploymentType.CustomDeployment && deploymentTemplateIdentifier
  // End - Custom Deployment Template specific

  const infrastructureValue = get(initialValues, `infrastructureDefinitions.[0].identifier`)
  const infrastructureValues = get(initialValues, 'infrastructureDefinitions')

  // infrastructuresSelectedType is to handle deployToAll/runtime envs
  // 'all' is for deployToAll, 'runtime' when envs is marked runtime
  const [infrastructuresSelectedType, setInfrastructuresSelectedType] = useState<
    'all' | 'runtime' | 'other' | 'expression' | undefined
  >(
    get(formik.values, pathForDeployToAll) === true
      ? 'all'
      : isValueRuntimeInput(get(formik.values, localPath)) &&
        (isMultipleInfrastructure ? isValueRuntimeInput(get(formik.values, pathForDeployToAll)) : true)
      ? 'runtime'
      : isValueExpression(get(formik.values, `${localPath}.0.identifier`))
      ? 'expression'
      : undefined
  )

  const getInfrastructureIdentifiers = useCallback(() => {
    if (!isMultipleInfrastructure && infrastructureValue) {
      return [infrastructureValue]
    }

    if (isMultipleInfrastructure && Array.isArray(infrastructureValues)) {
      return infrastructureValues.map(infraValue => infraValue.identifier)
    }

    return []
  }, [isMultipleInfrastructure, infrastructureValue, infrastructureValues])

  const [infrastructureIdentifiers, setInfrastructureIdentifiers] = useState<string[]>(getInfrastructureIdentifiers())

  const {
    infrastructuresList,
    infrastructuresData,
    loadingInfrastructuresList,
    loadingInfrastructuresData,
    // This is required only when updating the entities list
    updatingInfrastructuresData
  } = useGetInfrastructuresData({
    infrastructureIdentifiers:
      // This is required to prevent the API call when expression is being typed
      infrastructuresSelectedType === 'expression' || isValueExpression(infrastructureIdentifiers[0])
        ? []
        : infrastructureIdentifiers,
    environmentIdentifier: getScopeAppendedToIdentifier(environmentIdentifier, scope),
    deploymentType,
    ...(shouldAddCustomDeploymentData && {
      deploymentTemplateIdentifier,
      versionLabel
    }),
    lazyInfrastructure
  })

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
    if (!infrastructuresList.length) {
      return
    }

    // update identifiers in state when deployToAll is true. This sets the infrastructuresData
    if (deployToAllInfrastructures === true) {
      const newIdentifiers = infrastructuresList.map(infrastructureInList => infrastructureInList.identifier)
      if (!isEqual(newIdentifiers, infrastructureIdentifiers)) {
        setInfrastructuresSelectedType('other')
        setInfrastructureIdentifiers(newIdentifiers)
      }
    }
  }, [infrastructuresList])

  useDeepCompareEffect(() => {
    if (infrastructuresSelectedType === 'expression') {
      updateStageFormTemplate(RUNTIME_INPUT_VALUE, `${fullPathPrefix}infrastructureDefinitions`)

      formik.setValues(
        produce(formik.values, draft => {
          if (!(uniquePath.current in draft)) {
            set(draft, uniquePath.current, get(draft, `${localPath}.0.identifier`))
          } else {
            // We need to have the entire object with identifier as we want to overwrite the infra values if made from fixed to expression
            set(draft, `${localPath}.0`, { identifier: infrastructureIdentifiers[0] })
          }
        })
      )

      return
    }

    // On load of data
    // if no value is selected, clear the inputs and template
    if (infrastructureIdentifiers.length === 0) {
      // 'runtime' is for when field is marked runtime, whereas 'other' is for emptying selection
      if (infrastructuresSelectedType === 'runtime' || infrastructuresSelectedType === 'other') {
        updateStageFormTemplate(RUNTIME_INPUT_VALUE, `${fullPathPrefix}infrastructureDefinitions`)

        const newFormikValues = { ...formik.values }
        set(newFormikValues, localPath, infrastructuresSelectedType === 'runtime' ? RUNTIME_INPUT_VALUE : [])

        if (isMultipleInfrastructure) {
          if (!isBoolean(deployToAllInfrastructures)) {
            set(
              newFormikValues,
              pathForDeployToAll,
              infrastructuresSelectedType === 'runtime' ? RUNTIME_INPUT_VALUE : false
            )
          }
        }

        let uniquePathValue = get(formik.values, uniquePath.current)
        if (!(uniquePath.current in formik.values)) {
          if (isValueRuntimeInput(get(formik.values, localPath))) {
            uniquePathValue = RUNTIME_INPUT_VALUE
          }
          set(newFormikValues, uniquePath.current, uniquePathValue)
        }

        formik.setValues(newFormikValues)
      }
      // This condition is required when there exist no infrastructures but user selects all
      else if (!isBoolean(deployToAllInfrastructures) && infrastructuresSelectedType === 'all') {
        const newFormikValues = { ...formik.values }
        set(newFormikValues, localPath, undefined)

        set(newFormikValues, pathForDeployToAll, true)
        formik.setValues(newFormikValues)
      }

      return
    }

    // If selected infrastructures data has not loaded.
    // The 2nd condition is to prevent update until infrastructures data load for all infrastructures
    if (!infrastructuresData.length || infrastructureIdentifiers.length !== infrastructuresData.length) {
      return
    }

    // updated template based on selected infrastructures
    const existingTemplate = getStageFormTemplate<InfraStructureDefinitionYaml[]>(
      `${fullPathPrefix}infrastructureDefinitions`
    )
    const newInfrastructuresTemplate = createInfraTemplate(
      existingTemplate as InfraStructureDefinitionYaml[],
      infrastructureIdentifiers,
      cloneDeep(infrastructuresData)
    )

    // updated values based on selected infrastructures
    const existingInfrastructureValues = get(formik.values, localPath)
    const newInfrastructuresValues = createInfraValues(
      existingInfrastructureValues,
      infrastructureIdentifiers,
      cloneDeep(infrastructuresData),
      deployToAllInfrastructures,
      stepViewType
    )

    if (isMultipleInfrastructure) {
      if (areEnvironmentFiltersAdded) {
        formik.setFieldValue(
          localPath,
          newInfrastructuresValues.map(infraValue => pick(infraValue, 'identifier'))
        )
      } else {
        updateStageFormTemplate(newInfrastructuresTemplate, `${fullPathPrefix}infrastructureDefinitions`)

        // update form values
        const newFormikValues = { ...formik.values }

        set(newFormikValues, localPath, newInfrastructuresValues)

        if (!isBoolean(deployToAllInfrastructures)) {
          set(newFormikValues, pathForDeployToAll, infrastructuresSelectedType === 'all')
        }

        // if this is multi infrastructures, then set up a dummy field,
        // so that infrastructures can be updated in this dummy field
        let uniquePathValue = get(formik.values, uniquePath.current)
        if (isNil(uniquePathValue)) {
          const isDeployToAll = get(formik.values, pathForDeployToAll)

          uniquePathValue = isDeployToAll
            ? [SELECT_ALL_OPTION]
            : infrastructureIdentifiers.map(infrastructureId => ({
                label: defaultTo(
                  infrastructuresList.find(infrastructureInList => infrastructureInList.identifier === infrastructureId)
                    ?.name,
                  infrastructureId
                ),
                value: infrastructureId
              }))

          set(newFormikValues, uniquePath.current, uniquePathValue)
        }

        formik.setValues(newFormikValues)
      }
    } else {
      updateStageFormTemplate(newInfrastructuresTemplate, `${fullPathPrefix}infrastructureDefinitions`)

      // update form values
      const newFormikValues = { ...formik.values }

      set(newFormikValues, localPath, newInfrastructuresValues)

      const uniquePathValue = get(formik.values, uniquePath.current)
      if (isNil(uniquePathValue)) {
        set(newFormikValues, uniquePath.current, infrastructureIdentifiers[0])
      }

      formik.setValues(newFormikValues)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infrastructuresData, infrastructureIdentifiers, infrastructuresSelectedType])

  function handleSingleInfrastructureChange(
    item?: ExpressionAndRuntimeTypeProps['value'],
    _?: MultiTypeInputValue,
    type?: MultiTypeInputType
  ): void {
    if (isValueRuntimeInput(item)) {
      setInfrastructuresSelectedType('runtime')
      setInfrastructureIdentifiers([])
    } else if (isMultiTypeExpression(type as MultiTypeInputType)) {
      setInfrastructuresSelectedType('expression')
      setInfrastructureIdentifiers(item ? [item as string] : [])
    } else {
      setInfrastructuresSelectedType('other')
      setInfrastructureIdentifiers((item as SelectOption)?.value ? [(item as SelectOption).value as string] : [])
    }
  }

  function handleInfrastructuresChange(items: SelectOption[]): void {
    if (isValueRuntimeInput(items)) {
      setInfrastructuresSelectedType('runtime')
      setInfrastructureIdentifiers([])
    } else if (items?.at(0)?.value === 'All') {
      const newIdentifiers = infrastructuresList.map(infrastructureInList => infrastructureInList.identifier)
      setInfrastructuresSelectedType('all')
      setInfrastructureIdentifiers(newIdentifiers)
    } else if (Array.isArray(items)) {
      setInfrastructuresSelectedType('other')
      setInfrastructureIdentifiers(items.map(item => item.value as string))
    }
  }

  const placeHolderForInfrastructures = loading
    ? getString('loading')
    : get(formik.values, pathForDeployToAll) === true
    ? getString('cd.pipelineSteps.environmentTab.allInfrastructures')
    : infrastructureIdentifiers.length
    ? getString('common.infrastructures')
    : getString('cd.pipelineSteps.environmentTab.selectInfrastructures')

  const showSingleInfraMultiTypeInput =
    !isMultipleInfrastructure &&
    // This check is required to ensure that the component has the actual type set on mount
    // We need to do this because of the way the FormInput.MultiTypeInput is written
    (infrastructuresSelectedType === 'expression' || infrastructuresSelectedType === 'runtime'
      ? !isUndefined(get(formik.values, uniquePath.current)) || get(formik.touched, uniquePath.current)
      : true)

  return (
    <>
      <Layout.Horizontal spacing="medium" style={{ alignItems: 'flex-end' }}>
        {showSingleInfraMultiTypeInput && (
          <FormInput.MultiTypeInput
            tooltipProps={{ dataTooltipId: 'specifyYourInfrastructure' }}
            label={getString('cd.pipelineSteps.environmentTab.specifyYourInfrastructure')}
            name={uniquePath.current}
            placeholder={getString('cd.pipelineSteps.environmentTab.selectInfrastructure')}
            selectItems={selectOptions}
            useValue
            multiTypeInputProps={{
              expressions,
              allowableTypes: (allowableTypes as MultiTypeInputType[])?.filter(
                item => item !== MultiTypeInputType.EXECUTION_TIME
              ) as AllowedTypes,
              selectProps: {
                addClearBtn: !inputSetData?.readonly,
                items: selectOptions
              },
              onChange: handleSingleInfrastructureChange
            }}
            disabled={inputSetData?.readonly}
            className={css.inputWidth}
          />
        )}
        {/**
         * Hide if:
         * 1. if deploy to all environments is true, either by default or after selection from input field
         * 2. if deploy to all infrastructures is true
         */}
        {isMultipleInfrastructure && deployToAllInfrastructures !== true && (
          <FormMultiTypeMultiSelectDropDown
            tooltipProps={{ dataTooltipId: 'specifyYourInfrastructures' }}
            label={getString('cd.pipelineSteps.environmentTab.specifyYourInfrastructures')}
            name={uniquePath.current}
            disabled={inputSetData?.readonly || loading}
            dropdownProps={{
              items: selectOptions,
              placeholder: placeHolderForInfrastructures,
              disabled: loading || inputSetData?.readonly,
              isAllSelectionSupported: !!environmentIdentifier
            }}
            onChange={handleInfrastructuresChange}
            multiTypeProps={{
              width: 300,
              height: 32,
              allowableTypes: (allowableTypes as MultiTypeInputType[])?.filter(
                item => item !== MultiTypeInputType.EXPRESSION && item !== MultiTypeInputType.EXECUTION_TIME
              ) as AllowedTypes
            }}
          />
        )}
        {loading ? <Spinner className={css.inputSetSpinner} size={16} /> : null}
      </Layout.Horizontal>
    </>
  )
}
