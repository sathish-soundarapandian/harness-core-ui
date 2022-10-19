/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo, useState } from 'react'
import { defaultTo, get, isEmpty, isEqual, isNil } from 'lodash-es'
import { useFormikContext } from 'formik'
import { Spinner } from '@blueprintjs/core'
import { v4 as uuid } from 'uuid'

import { AllowedTypes, getMultiTypeFromValue, Layout, MultiTypeInputType, SelectOption } from '@harness/uicore'

import { useStrings } from 'framework/strings'

import { useDeepCompareEffect } from '@common/hooks'
import { FormMultiTypeMultiSelectDropDown } from '@common/components/MultiTypeMultiSelectDropDown/MultiTypeMultiSelectDropDown'

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
  deployToAllClusters
}: DeployClusterEntityInputStepProps): React.ReactElement {
  const { getString } = useStrings()
  const formik = useFormikContext<DeployEnvironmentEntityConfig>()
  const uniquePath = React.useRef(`_pseudo_field_${uuid()}`)

  const pathPrefix = isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`
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
    // if this is a multi clusters, then set up a dummy field,
    // so that clusters can be updated in this dummy field
    if (isMultipleCluster) {
      formik.setFieldValue(
        uniquePath.current,
        clusterIdentifiers.map(clusterId => ({
          label: defaultTo(clustersList.find(clusterInList => clusterInList.clusterRef === clusterId)?.name, clusterId),
          value: clusterId
        }))
      )
    }

    // update identifiers in state when deployToAll is true. This sets the clustersData
    if (clustersList.length && deployToAllClusters) {
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
    const newValues = values.map(val => ({
      identifier: val.value as string
    }))

    formik.setFieldValue(`${pathPrefix}gitOpsClusters`, newValues)
    if (!deployToAllClusters) {
      formik.setFieldValue(`${pathPrefix}deployToAll`, false)
    }
    setClusterIdentifiers(getClusterIdentifiers())
  }

  return (
    <>
      <Layout.Horizontal spacing="medium" style={{ alignItems: 'flex-end' }}>
        {!isMultipleCluster && (
          <ExperimentalInput
            tooltipProps={{ dataTooltipId: 'specifyGitOpsClusters' }}
            label={getString('cd.pipelineSteps.environmentTab.specifyGitOpsClusters')}
            name={`${pathPrefix}gitOpsClusters[0].identifier`}
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
        {isMultipleCluster && !deployToAllClusters && (
          <FormMultiTypeMultiSelectDropDown
            tooltipProps={{ dataTooltipId: 'specifyGitOpsClusters' }}
            label={getString('cd.pipelineSteps.environmentTab.specifyGitOpsClusters')}
            name={uniquePath.current}
            disabled={inputSetData?.readonly || loading}
            dropdownProps={{
              items: selectOptions,
              placeholder: getString('common.clusters'),
              disabled: loading || inputSetData?.readonly
            }}
            onChange={handleClustersChange}
            multiTypeProps={{
              width: 300,
              allowableTypes
            }}
          />
        )}
        {loading ? <Spinner className={css.inputSetSpinner} size={16} /> : null}
      </Layout.Horizontal>
    </>
  )
}
