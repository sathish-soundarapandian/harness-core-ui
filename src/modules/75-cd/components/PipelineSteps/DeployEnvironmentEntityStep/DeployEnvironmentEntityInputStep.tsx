/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo, useRef, useState } from 'react'
import { cloneDeep, defaultTo, get, isBoolean, isEmpty, isEqual, isNil, pick, set } from 'lodash-es'
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
import { isValueRuntimeInput } from '@common/utils/utils'
import { SELECT_ALL_OPTION } from '@common/components/MultiTypeMultiSelectDropDown/MultiTypeMultiSelectDropDownUtils'

import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useStageFormContext } from '@pipeline/context/StageFormContext'

import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { MultiTypeEnvironmentField } from '@pipeline/components/FormMultiTypeEnvironmentField/FormMultiTypeEnvironmentField'
import type { DeployEnvironmentEntityConfig, DeployEnvironmentEntityCustomInputStepProps } from './types'
import ExperimentalInput from '../K8sServiceSpec/K8sServiceSpecForms/ExperimentalInput'
import { useGetEnvironmentsData } from './DeployEnvironment/useGetEnvironmentsData'
import { createEnvTemplate, createEnvValues } from './DeployEnvironmentEntityInputStepUtils'

import css from './DeployEnvironmentEntityStep.module.scss'

export interface DeployEnvironmentEntityInputStepProps extends Required<DeployEnvironmentEntityCustomInputStepProps> {
  initialValues: DeployEnvironmentEntityConfig
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  inputSetData?: {
    template?: DeployEnvironmentEntityConfig
    path?: string
    readonly?: boolean
  }
}

export default function DeployEnvironmentEntityInputStep({
  initialValues,
  inputSetData,
  allowableTypes,
  pathToEnvironments,
  envGroupIdentifier,
  isMultiEnvironment,
  deployToAllEnvironments,
  gitOpsEnabled,
  stepViewType,
  areFiltersAdded
}: DeployEnvironmentEntityInputStepProps): React.ReactElement {
  const { getString } = useStrings()
  const { getStageFormTemplate, updateStageFormTemplate } = useStageFormContext()
  const formik = useFormikContext<DeployEnvironmentEntityConfig>()
  const uniquePath = useRef(`_pseudo_field_${uuid()}`)

  // pathPrefix contains the outer formik path but does not include the path to environments
  const pathPrefix = isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`
  // fullPath contains the outer formik path and the path to environments
  const fullPath = pathPrefix + pathToEnvironments

  const mainEntityPath = pathToEnvironments.split('.')[0]
  const pathForDeployToAll = `${mainEntityPath}.deployToAll`

  const environmentValue = get(initialValues, `environment.environmentRef`)
  const environmentValues: EnvironmentYamlV2[] = get(initialValues, pathToEnvironments)

  // environmentsSelectedType is to handle deployToAll/runtime envs
  // 'all' is for deployToAll, 'runtime' when envs is marked runtime
  const [environmentsSelectedType, setEnvironmentsSelectedType] = useState<'all' | 'runtime' | 'other' | undefined>(
    get(formik.values, pathForDeployToAll) === true ? 'all' : undefined
  )
  const { CDS_OrgAccountLevelServiceEnvEnvGroup } = useFeatureFlags()

  const getEnvironmentIdentifiers = useCallback(() => {
    if (environmentValue) {
      return [environmentValue]
    }

    if (Array.isArray(environmentValues)) {
      return environmentValues.map(envValue => envValue.environmentRef)
    }

    return []
  }, [environmentValue, environmentValues])

  const [environmentIdentifiers, setEnvironmentIdentifiers] = useState<string[]>(getEnvironmentIdentifiers())

  const {
    environmentsList,
    environmentsData,
    loadingEnvironmentsList,
    loadingEnvironmentsData,
    // This is required only when updating the entities list
    updatingEnvironmentsData
  } = useGetEnvironmentsData({ envIdentifiers: environmentIdentifiers, envGroupIdentifier })

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
  const disabled = inputSetData?.readonly || loading

  useDeepCompareEffect(() => {
    if (!environmentsList.length) {
      return
    }

    // if this is a multi environment template, then set up a dummy field,
    // so that environments can be updated in this dummy field
    if (isMultiEnvironment) {
      if (isValueRuntimeInput(get(formik.values, pathToEnvironments))) {
        formik.setFieldValue(uniquePath.current, RUNTIME_INPUT_VALUE)
      } else {
        formik.setFieldValue(
          uniquePath.current,
          get(formik.values, pathForDeployToAll) === true
            ? [SELECT_ALL_OPTION]
            : environmentIdentifiers.map(environmentId => ({
                label: defaultTo(
                  environmentsList.find(environmentInList => environmentInList.identifier === environmentId)?.name,
                  environmentId
                ),
                value: environmentId
              }))
        )
      }
    }

    // update identifiers in state when deployToAll is true. This sets the environmentsData
    if (deployToAllEnvironments === true) {
      const newIdentifiers = environmentsList.map(environmentInList => environmentInList.identifier)
      if (!isEqual(newIdentifiers, environmentIdentifiers)) {
        setEnvironmentsSelectedType('other')
        setEnvironmentIdentifiers(newIdentifiers)
      }
    }
  }, [environmentsList])

  // ! This effect should only run when environments are selected and their data has completely loaded
  useDeepCompareEffect(() => {
    // if no environments are selected when not under env group
    if (environmentIdentifiers.length === 0) {
      // 'runtime' is for when field is marked runtime, whereas 'other' is for emptying selection
      if (environmentsSelectedType === 'runtime' || environmentsSelectedType === 'other') {
        updateStageFormTemplate(RUNTIME_INPUT_VALUE, fullPath)

        const newFormikValues = { ...formik.values }
        set(newFormikValues, pathToEnvironments, environmentsSelectedType === 'runtime' ? RUNTIME_INPUT_VALUE : [])

        if (!isBoolean(deployToAllEnvironments) && envGroupIdentifier) {
          set(newFormikValues, pathForDeployToAll, environmentsSelectedType === 'runtime' ? RUNTIME_INPUT_VALUE : false)
        }

        formik.setValues(newFormikValues)
      }
      // This condition is required when there exist no environments but user selects all
      else if (!isBoolean(deployToAllEnvironments) && envGroupIdentifier && environmentsSelectedType === 'all') {
        formik.setFieldValue(pathForDeployToAll, true)
      }
      return
    }

    // If selected environments data has not loaded.
    // The 2nd condition is to prevent update until environments data load for all environments
    if (!environmentsData.length || environmentIdentifiers.length !== environmentsData.length) {
      return
    }

    // updated template based on selected environments
    const existingTemplate = getStageFormTemplate<EnvironmentYamlV2[]>(fullPath)
    const newEnvironmentsTemplate: EnvironmentYamlV2[] = createEnvTemplate(
      existingTemplate as EnvironmentYamlV2[],
      environmentIdentifiers,
      cloneDeep(environmentsData),
      isMultiEnvironment,
      gitOpsEnabled ? 'gitOpsClusters' : 'infrastructureDefinitions'
    )

    // updated values based on selected environments
    const existingEnvironmentValues = get(formik.values, pathToEnvironments)
    const newEnvironmentsValues = createEnvValues(
      existingEnvironmentValues,
      environmentIdentifiers,
      cloneDeep(environmentsData),
      deployToAllEnvironments,
      gitOpsEnabled ? 'gitOpsClusters' : 'infrastructureDefinitions',
      stepViewType
    )

    const areEnvironmentsRuntimeUnderEnvGroup = !isBoolean(deployToAllEnvironments) && envGroupIdentifier
    if (isMultiEnvironment) {
      const newFormikValues = { ...formik.values }
      if (areFiltersAdded) {
        set(
          newFormikValues,
          pathToEnvironments,
          newEnvironmentsValues.map(envValue => pick(envValue, 'environmentRef'))
        )
      } else {
        updateStageFormTemplate(newEnvironmentsTemplate, fullPath)

        // update form values
        set(newFormikValues, pathToEnvironments, newEnvironmentsValues)
      }

      if (areEnvironmentsRuntimeUnderEnvGroup) {
        set(newFormikValues, pathForDeployToAll, environmentsSelectedType === 'all')
      }
      formik.setFieldValue(mainEntityPath, get(newFormikValues, mainEntityPath))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentsData, environmentIdentifiers, environmentsSelectedType, envGroupIdentifier])

  function handleEnvironmentsChange(items: SelectOption[]): void {
    if (isValueRuntimeInput(items)) {
      setEnvironmentsSelectedType('runtime')
      setEnvironmentIdentifiers([])
    } else if (items?.at(0)?.value === 'All') {
      const newIdentifiers = environmentsList.map(environmentInList => environmentInList.identifier)
      setEnvironmentsSelectedType('all')
      setEnvironmentIdentifiers(newIdentifiers)
    } else if (Array.isArray(items)) {
      setEnvironmentsSelectedType('other')
      setEnvironmentIdentifiers(items.map(item => item.value as string))
    }
  }

  const placeHolderForEnvironment = loading
    ? getString('loading')
    : getString('cd.pipelineSteps.environmentTab.selectEnvironment')

  const placeHolderForEnvironments = loading
    ? getString('loading')
    : get(formik.values, pathForDeployToAll) === true
    ? getString('common.allEnvironments')
    : environmentIdentifiers.length
    ? getString('environments')
    : getString('cd.pipelineSteps.environmentTab.selectEnvironments')

  const commonProps = {
    name: isMultiEnvironment ? uniquePath.current : `${pathPrefix}environment.environmentRef`,
    tooltipProps: isMultiEnvironment
      ? { dataTooltipId: 'specifyYourEnvironments' }
      : { dataTooltipId: 'specifyYourEnvironment' },
    label: isMultiEnvironment
      ? getString('cd.pipelineSteps.environmentTab.specifyYourEnvironments')
      : getString('cd.pipelineSteps.environmentTab.specifyYourEnvironment'),
    disabled: disabled
  }

  return (
    <>
      <Layout.Horizontal spacing="medium" style={{ alignItems: 'flex-end' }}>
        {getMultiTypeFromValue(inputSetData?.template?.environment?.environmentRef) === MultiTypeInputType.RUNTIME ? (
          CDS_OrgAccountLevelServiceEnvEnvGroup ? (
            <MultiTypeEnvironmentField
              {...commonProps}
              placeholder={placeHolderForEnvironment}
              setRefValue={true}
              isNewConnectorLabelVisible={false}
              width={300}
              multiTypeProps={{
                allowableTypes: allowableTypes,
                defaultValueToReset: ''
              }}
            />
          ) : (
            <ExperimentalInput
              {...commonProps}
              placeholder={placeHolderForEnvironment}
              selectItems={selectOptions}
              useValue
              multiTypeInputProps={{
                allowableTypes: allowableTypes,
                selectProps: {
                  addClearBtn: !disabled,
                  items: selectOptions
                }
              }}
              className={css.inputWidth}
              formik={formik}
            />
          )
        ) : null}

        {/* If we have multiple environments to select individually or under env group, 
          and we are deploying to all environments from pipeline studio.
          Then we should hide this field and just update the formik values */}
        {isMultiEnvironment && deployToAllEnvironments !== true ? (
          CDS_OrgAccountLevelServiceEnvEnvGroup ? (
            <MultiTypeEnvironmentField
              {...commonProps}
              placeholder={placeHolderForEnvironments}
              isMultiSelect
              onMultiSelectChange={handleEnvironmentsChange}
              isNewConnectorLabelVisible={false}
              width={300}
              multiTypeProps={{
                allowableTypes: (allowableTypes as MultiTypeInputType[])?.filter(
                  item => item !== MultiTypeInputType.EXPRESSION && item !== MultiTypeInputType.EXECUTION_TIME
                ) as AllowedTypes
              }}
            />
          ) : (
            <FormMultiTypeMultiSelectDropDown
              tooltipProps={{ dataTooltipId: 'specifyYourEnvironments' }}
              label={getString('cd.pipelineSteps.environmentTab.specifyYourEnvironments')}
              name={uniquePath.current}
              disabled={disabled}
              dropdownProps={{
                items: selectOptions,
                placeholder: placeHolderForEnvironments,
                disabled,
                // checking for a non-boolean value as it is undefined in case of multi environments
                isAllSelectionSupported: !!envGroupIdentifier
              }}
              onChange={handleEnvironmentsChange}
              multiTypeProps={{
                width: 300,
                height: 32,
                allowableTypes: (allowableTypes as MultiTypeInputType[])?.filter(
                  item => item !== MultiTypeInputType.EXPRESSION && item !== MultiTypeInputType.EXECUTION_TIME
                ) as AllowedTypes
              }}
            />
          )
        ) : null}

        {loading ? <Spinner className={css.inputSetSpinner} size={16} /> : null}
      </Layout.Horizontal>
    </>
  )
}
