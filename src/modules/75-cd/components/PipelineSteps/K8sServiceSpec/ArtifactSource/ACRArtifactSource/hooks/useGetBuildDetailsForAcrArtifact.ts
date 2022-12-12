/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, get } from 'lodash-es'
import { useGetBuildDetailsForAcrArtifactWithYaml, useGetBuildDetailsForACRRepository } from 'services/cd-ng'
import { getFqnPath, getYamlData } from '@cd/components/PipelineSteps/K8sServiceSpec/ArtifactSource/artifactSourceUtils'
import { useMutateAsGet } from '@common/hooks'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { K8SDirectServiceStep } from '@cd/components/PipelineSteps/K8sServiceSpec/K8sServiceSpecInterface'

export interface Params {
  connectorRef?: string
  subscriptionId?: string
  registry?: string
  repository?: string
  accountId: string
  projectIdentifier: string
  orgIdentifier: string
  repoIdentifier?: string
  branch?: string
  useArtifactV1Data?: boolean
  formik?: any
  path?: string
  initialValues: K8SDirectServiceStep
  isPropagatedStage?: boolean
  serviceId?: string
  isSidecar?: boolean
  artifactPath?: string
  stageIdentifier: string
  pipelineIdentifier?: string
  stepViewType?: StepViewType
}

export function useGetBuildDetailsForAcrArtifact(params: Params) {
  const {
    connectorRef,
    subscriptionId,
    registry,
    repository,
    accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch,
    useArtifactV1Data,
    formik,
    path,
    initialValues,
    isPropagatedStage,
    serviceId,
    isSidecar,
    artifactPath,
    stageIdentifier,
    pipelineIdentifier,
    stepViewType
  } = params

  const {
    data: acrV1TagsData,
    loading: fetchingV1Tags,
    refetch: fetchV1Tags,
    error: fetchV1TagsError
  } = useGetBuildDetailsForACRRepository({
    queryParams: {
      connectorRef,
      subscriptionId,
      registry,
      repository,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    },
    lazy: true
  })

  const {
    data: acrV2TagsData,
    loading: fetchingV2Tags,
    refetch: fetchV2Tags,
    error: fetchV2TagsError
  } = useMutateAsGet(useGetBuildDetailsForAcrArtifactWithYaml, {
    body: getYamlData(formik?.values, stepViewType as StepViewType, path as string),
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      repoIdentifier,
      branch,
      connectorRef,
      subscriptionId,
      registry,
      repository,
      pipelineIdentifier: defaultTo(pipelineIdentifier, formik?.values?.identifier),
      serviceId,
      fqnPath: getFqnPath(
        path as string,
        !!isPropagatedStage,
        stageIdentifier,
        defaultTo(
          isSidecar
            ? artifactPath?.split('[')[0].concat(`.${get(initialValues?.artifacts, `${artifactPath}.identifier`)}`)
            : artifactPath,
          ''
        ),
        'tag'
      )
    },
    lazy: true
  })

  return useArtifactV1Data
    ? {
        fetchTags: fetchV1Tags,
        fetchingTags: fetchingV1Tags,
        fetchTagsError: fetchV1TagsError,
        acrTagsData: acrV1TagsData
      }
    : {
        fetchTags: fetchV2Tags,
        fetchingTags: fetchingV2Tags,
        fetchTagsError: fetchV2TagsError,
        acrTagsData: acrV2TagsData
      }
}
