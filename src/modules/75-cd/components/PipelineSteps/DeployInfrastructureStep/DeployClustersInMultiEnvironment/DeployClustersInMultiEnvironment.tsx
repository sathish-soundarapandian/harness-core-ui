/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, get, isNil } from 'lodash-es'
import { connect, FormikProps } from 'formik'

import { FormInput, MultiTypeInputType, useToaster, MultiSelectWithSubmenuOption, AllowedTypes } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import { ClusterResponse, useGetClusterList } from 'services/cd-ng'

import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'

import useRBACError from '@rbac/utils/useRBACError/useRBACError'

import type { DeployStageConfig } from '@pipeline/utils/DeployStageInterface'

import css from './DeployClustersInMultiEnvironment.module.scss'

interface DeployClustersInMultiEnvironmentProps {
  formik?: FormikProps<DeployStageConfig>
  readonly?: boolean
  allowableTypes: AllowedTypes
}

function DeployClustersInMultiEnvironment({ formik }: DeployClustersInMultiEnvironmentProps): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<PipelinePathProps>()
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()

  const selectedEnvironments = useMemo(() => {
    return defaultTo(formik?.values?.environmentInEnvGroupRef, []) as MultiSelectWithSubmenuOption[]
  }, [formik?.values?.environmentInEnvGroupRef])

  const {
    data: clustersResponse,
    loading: clustersLoading,
    error: clustersError,
    refetch
  } = useGetClusterList({
    lazy: true
  })

  const [clusters, setClusters] = useState<ClusterResponse[]>()
  const [selectedEnvironment, setEnvironment] = useState<string>()
  const [clustersSelectOptions, setClustersSelectOptions] = useState<MultiSelectWithSubmenuOption[]>()

  useEffect(() => {
    if (!clustersLoading && !get(clustersResponse, 'data.empty')) {
      setClusters(get(clustersResponse, 'data.content', []))
    }
  }, [clustersLoading, clustersResponse])

  useEffect(() => {
    if (!isNil(clusters)) {
      setClustersSelectOptions([
        {
          label: getString('all'),
          value: getString('all'),
          parentLabel: selectedEnvironment,
          parentValue: selectedEnvironment
        },
        ...clusters.map(cluster => {
          return {
            label: defaultTo(cluster.clusterRef, ''),
            value: defaultTo(cluster.clusterRef, ''),
            parentLabel: selectedEnvironments.find(environment => environment.value === cluster.envRef)?.label,
            parentValue: cluster.envRef
          }
        })
      ])
    }
  }, [clusters])

  useEffect(() => {
    if (!isNil(clustersError)) {
      showError(getRBACErrorMessage(clustersError))
    }
  }, [clustersError])

  return (
    <FormInput.MultiSelectWithSubmenuTypeInput
      label={getString('cd.pipelineSteps.environmentTab.specifyGitOpsClusters')}
      name="clusterRef"
      placeholder={getString('cd.pipelineSteps.environmentTab.specifyGitOpsClusters')}
      multiSelectWithSubmenuTypeInputProps={{
        className: css.clusterMultiSelect,
        allowableTypes: [MultiTypeInputType.FIXED],
        multiSelectWithSubmenuProps: {
          items: selectedEnvironments.map(environment => ({
            label: environment.label,
            value: environment.value,
            submenuItems: defaultTo(clustersSelectOptions, [])
          })),
          onSubmenuOpen: (value?: string) => {
            setEnvironment(value)
            return refetch({
              queryParams: {
                accountIdentifier: accountId,
                orgIdentifier,
                projectIdentifier,
                environmentIdentifier: value
              }
            })
          }
        }
      }}
    />
  )
}

export default connect(DeployClustersInMultiEnvironment)
