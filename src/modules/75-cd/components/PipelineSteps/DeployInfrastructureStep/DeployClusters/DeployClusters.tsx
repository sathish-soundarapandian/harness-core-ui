/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, get, isEmpty, isEqual, isNil, uniqBy } from 'lodash-es'
import { connect, FormikProps } from 'formik'

import {
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  RUNTIME_INPUT_VALUE,
  SelectOption,
  useToaster
} from '@harness/uicore'

import { useStrings } from 'framework/strings'
import { ClusterResponse, useGetClusterList } from 'services/cd-ng'

import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'

import useRBACError from '@rbac/utils/useRBACError/useRBACError'

import type { DeployStageConfig } from '@pipeline/utils/DeployStageInterface'

import css from './DeployClusters.module.scss'

interface DeployClusterProps {
  formik?: FormikProps<DeployStageConfig>
  readonly?: boolean
  environmentIdentifier: string
  allowableTypes: MultiTypeInputType[]
}

function DeployClusters({ formik, readonly, environmentIdentifier, allowableTypes }: DeployClusterProps) {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<PipelinePathProps>()
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()

  const [clustersRefType, setClustersRefType] = useState<MultiTypeInputType>(
    getMultiTypeFromValue(formik?.values?.clusterRef)
  )

  const {
    data: clustersResponse,
    loading: clustersLoading,
    error: clustersError
  } = useGetClusterList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier
    }
  })

  const [clusters, setClusters] = useState<ClusterResponse[]>()
  const [clustersSelectOptions, setClustersSelectOptions] = useState<SelectOption[]>()

  useEffect(() => {
    if (!clustersLoading && !get(clustersResponse, 'data.empty')) {
      setClusters(get(clustersResponse, 'data.content', []))
    }
  }, [clustersLoading, clustersResponse])

  useEffect(() => {
    if (!isNil(clusters)) {
      setClustersSelectOptions([
        { label: getString('cd.pipelineSteps.environmentTab.allClustersSelected'), value: getString('all') },
        ...clusters.map(cluster => {
          return { label: defaultTo(cluster.clusterRef, ''), value: defaultTo(cluster.clusterRef, '') }
        })
      ])
    }
  }, [clusters])

  useEffect(() => {
    if (!isEmpty(clustersSelectOptions) && !isNil(clustersSelectOptions) && formik?.values?.clusterRef) {
      if (getMultiTypeFromValue(formik?.values?.clusterRef) === MultiTypeInputType.FIXED) {
        const allClusterOptions = [...clustersSelectOptions]
        allClusterOptions.push(...(formik?.values?.clusterRef as SelectOption[]))
        const filteredClusterOptions = uniqBy(allClusterOptions, 'value')

        if (!isEqual(clustersSelectOptions, filteredClusterOptions)) {
          setClustersSelectOptions(filteredClusterOptions)
        }
      }
    }
  }, [clustersSelectOptions])

  useEffect(() => {
    if (!isNil(clustersError)) {
      showError(getRBACErrorMessage(clustersError))
    }
  }, [clustersError])

  return (
    <FormInput.MultiSelectTypeInput
      label={getString('cd.pipelineSteps.environmentTab.specifyGitOpsClusters')}
      tooltipProps={{ dataTooltipId: 'specifyGitOpsClusters' }}
      name="clusterRef"
      className={css.clusterMultiSelect}
      disabled={readonly || (clustersRefType === MultiTypeInputType.FIXED && clustersLoading)}
      placeholder={
        clustersLoading ? getString('loading') : getString('cd.pipelineSteps.environmentTab.specifyGitOpsClusters')
      }
      multiSelectTypeInputProps={{
        onTypeChange: setClustersRefType,
        width: 280,
        multiSelectProps: {
          items: defaultTo(clustersSelectOptions, [])
        },
        allowableTypes,
        onChange: items => {
          if (items !== RUNTIME_INPUT_VALUE && (items as SelectOption[]).length !== 1) {
            const selectAllItemIndex = (items as SelectOption[]).findIndex(item => item.value === getString('all'))

            if (selectAllItemIndex === 0) {
              formik?.setFieldValue('clusterRef', (items as SelectOption[]).slice(1))
            } else if (selectAllItemIndex === (items as SelectOption[]).length - 1) {
              formik?.setFieldValue('clusterRef', (items as SelectOption[]).slice(-1))
            } else {
              formik?.setFieldValue('clusterRef', items)
            }
          } else {
            formik?.setFieldValue('clusterRef', items)
          }
        }
      }}
      selectItems={defaultTo(clustersSelectOptions, [])}
    />
  )
}

export default connect(DeployClusters)
