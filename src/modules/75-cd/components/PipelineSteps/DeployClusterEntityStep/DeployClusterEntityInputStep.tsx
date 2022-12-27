/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo, useState } from 'react'
import { defaultTo, get, isBoolean, isEqual, isNil, set, unset } from 'lodash-es'
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

import { useDeepCompareEffect } from '@common/hooks'
import { SELECT_ALL_OPTION } from '@common/components/MultiTypeMultiSelectDropDown/MultiTypeMultiSelectDropDownUtils'
import { FormMultiTypeMultiSelectDropDown } from '@common/components/MultiTypeMultiSelectDropDown/MultiTypeMultiSelectDropDown'
import { isValueRuntimeInput } from '@common/utils/utils'

import { TEMPLATE_INPUT_PATH } from '@pipeline/utils/templateUtils'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import ExperimentalInput from '../K8sServiceSpec/K8sServiceSpecForms/ExperimentalInput'
import { useGetClustersData } from '../DeployEnvironmentEntityStep/DeployCluster/useGetClustersData'
import type { DeployEnvironmentEntityConfig } from '../DeployEnvironmentEntityStep/types'
import type { DeployClusterEntityCustomInputStepProps } from './types'

import css from './DeployClusterEntityStep.module.scss'

export interface DeployClusterEntityInputStepProps extends Required<DeployClusterEntityCustomInputStepProps> {
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

export default function DeployClusterEntityInputStep({
  initialValues,
  allowableTypes,
  inputSetData,
  environmentIdentifier,
  isMultipleCluster,
  deployToAllClusters,
  showEnvironmentsSelectionInputField
}: DeployClusterEntityInputStepProps): React.ReactElement {
  const { getString } = useStrings()
  const formik = useFormikContext<DeployEnvironmentEntityConfig>()
  const uniquePath = React.useRef(`_pseudo_field_${uuid()}`)

  const pathForDeployToAll = 'deployToAll'

  const isStageTemplateInputSetForm = inputSetData?.path?.startsWith(TEMPLATE_INPUT_PATH)

  const clusterValue = get(initialValues, `gitOpsClusters.[0].identifier`)
  const clusterValues = get(initialValues, 'gitOpsClusters')

  const getClusterIdentifiers = useCallback(() => {
    if (!isMultipleCluster && clusterValue) {
      return [clusterValue]
    }

    if (isMultipleCluster && Array.isArray(clusterValues)) {
      return clusterValues.map(val => val.identifier)
    }

    return []
  }, [isMultipleCluster, clusterValue, clusterValues])

  const [clusterIdentifiers, setClusterIdentifiers] = useState<string[]>(getClusterIdentifiers())

  const { clustersList, loadingClustersList } = useGetClustersData({ environmentIdentifier })

  const selectOptions = useMemo(() => {
    /* istanbul ignore else */
    if (!isNil(clustersList)) {
      return clustersList.map(clusterInList => ({
        label: clusterInList.name,
        value: clusterInList.clusterRef
      }))
    }

    return []
  }, [clustersList])

  const loading = loadingClustersList

  useDeepCompareEffect(() => {
    if (!clustersList.length) {
      return
    }

    // if this is a multi clusters, then set up a dummy field,
    // so that clusters can be updated in this dummy field
    if (isMultipleCluster) {
      if (isValueRuntimeInput(get(formik.values, 'gitOpsClusters')) && !showEnvironmentsSelectionInputField) {
        formik.setFieldValue(uniquePath.current, RUNTIME_INPUT_VALUE)
      } else {
        const isDeployToAll = get(formik.values, pathForDeployToAll)

        formik.setFieldValue(
          uniquePath.current,
          isDeployToAll
            ? [SELECT_ALL_OPTION]
            : clusterIdentifiers.map(clusterId => ({
                label: defaultTo(
                  clustersList.find(clusterInList => clusterInList.clusterRef === clusterId)?.name,
                  clusterId
                ),
                value: clusterId
              }))
        )
      }
    }

    // update identifiers in state when deployToAll is true. This sets the clustersData
    if (deployToAllClusters === true) {
      const newIdentifiers = clustersList.map(clusterInList => clusterInList.clusterRef)
      if (!isEqual(newIdentifiers, clusterIdentifiers)) {
        setClusterIdentifiers(newIdentifiers)
      }
    }
  }, [clustersList])

  const onClusterRefChange = (value: SelectOption): void => {
    if (
      isStageTemplateInputSetForm &&
      getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME &&
      inputSetData?.path
    ) {
      return
    }
    setClusterIdentifiers(getClusterIdentifiers())
  }

  function handleClustersChange(values: SelectOption[]): void {
    if (isValueRuntimeInput(values)) {
      setClusterIdentifiers([])

      const newFormikValues = { ...formik.values }
      set(newFormikValues, 'gitOpsClusters', RUNTIME_INPUT_VALUE)

      if (!isBoolean(deployToAllClusters)) {
        set(newFormikValues, pathForDeployToAll, RUNTIME_INPUT_VALUE)
      }

      formik.setValues(newFormikValues)
    } else if (values?.at(0)?.value === 'All') {
      const newIdentifiers = clustersList.map(clusterInList => clusterInList.clusterRef)
      setClusterIdentifiers(newIdentifiers)

      const newFormikValues = { ...formik.values }
      set(newFormikValues, pathForDeployToAll, true)
      unset(newFormikValues, `gitOpsClusters`)
      formik.setValues(newFormikValues)
    } else {
      const newValues = values.map(val => ({
        identifier: val.value as string
      }))

      const newFormikValues = { ...formik.values }

      set(newFormikValues, `gitOpsClusters`, newValues)
      if (!isBoolean(deployToAllClusters)) {
        set(newFormikValues, pathForDeployToAll, false)
      }

      setClusterIdentifiers(getClusterIdentifiers())
      formik.setValues(newFormikValues)
    }
  }

  const placeHolderForClusters = loading
    ? getString('loading')
    : get(formik.values, pathForDeployToAll) === true
    ? getString('common.allClusters')
    : clusterIdentifiers.length
    ? getString('common.clusters')
    : getString('cd.pipelineSteps.environmentTab.specifyGitOpsClusters')

  return (
    <>
      <Layout.Horizontal spacing="medium" style={{ alignItems: 'flex-end' }}>
        {!isMultipleCluster && (
          <ExperimentalInput
            tooltipProps={{ dataTooltipId: 'specifyGitOpsClusters' }}
            label={getString('cd.pipelineSteps.environmentTab.specifyGitOpsClusters')}
            name={'gitOpsClusters[0].identifier'}
            placeholder={getString('cd.pipelineSteps.environmentTab.specifyGitOpsClusters')}
            selectItems={selectOptions}
            useValue
            multiTypeInputProps={{
              allowableTypes: allowableTypes,
              selectProps: {
                addClearBtn: !inputSetData?.readonly,
                items: selectOptions
              },
              onChange: onClusterRefChange
            }}
            disabled={inputSetData?.readonly}
            className={css.inputWidth}
            formik={formik}
          />
        )}
        {/**
         * Hide if:
         * 1. if deploy to all environments is true, either by default or after selection from input field
         * 2. if deploy to all clusters is true
         */}
        {isMultipleCluster && deployToAllClusters !== true && (
          <FormMultiTypeMultiSelectDropDown
            tooltipProps={{ dataTooltipId: 'specifyGitOpsClusters' }}
            label={getString('cd.pipelineSteps.environmentTab.specifyGitOpsClusters')}
            name={uniquePath.current}
            disabled={inputSetData?.readonly || loading}
            dropdownProps={{
              items: selectOptions,
              placeholder: placeHolderForClusters,
              disabled: loading || inputSetData?.readonly,
              isAllSelectionSupported: !!environmentIdentifier
            }}
            onChange={handleClustersChange}
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
