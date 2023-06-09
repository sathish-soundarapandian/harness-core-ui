/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, get } from 'lodash-es'
import {
  useGetLastSuccessfulBuildForGoogleArtifactRegistry,
  useGetLastSuccessfulBuildForGoogleArtifactRegistryV2
} from 'services/cd-ng'
import { getFqnPath, getYamlData } from '@cd/components/PipelineSteps/K8sServiceSpec/ArtifactSource/artifactSourceUtils'
import { useMutateAsGet } from '@common/hooks'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { K8SDirectServiceStep } from '@cd/components/PipelineSteps/K8sServiceSpec/K8sServiceSpecInterface'
import { isArtifactInMultiService } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'

export interface Params {
  connectorRef?: string
  version?: string
  project?: string
  region?: string
  repositoryName?: string
  packageValue?: string
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

export function useGetDigestDetailsForGar(params: Params) {
  const {
    connectorRef,
    version,
    project,
    region,
    repositoryName,
    packageValue,
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
    data: garV1DigestData,
    loading: fetchingV1Digest,
    refetch: fetchV1Digest,
    error: fetchV1DigestError
  } = useMutateAsGet(useGetLastSuccessfulBuildForGoogleArtifactRegistry, {
    queryParams: {
      connectorRef,
      project,
      region,
      repositoryName,
      package: packageValue,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    lazy: true,
    body: {
      version: version
    }
  })

  const isMultiService = isArtifactInMultiService(formik?.values?.services, path)

  const {
    data: garV2DigestData,
    loading: fetchingV2Digest,
    refetch: fetchV2Digest,
    error: fetchV2DigestError
  } = useMutateAsGet(useGetLastSuccessfulBuildForGoogleArtifactRegistryV2, {
    body: {
      version: version,
      runtimeInputYaml: getYamlData(formik?.values, stepViewType as StepViewType, path as string)
    },
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
      project,
      region,
      repositoryName,
      package: packageValue,
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
        'digest',
        serviceId as string,
        isMultiService
      )
    },
    lazy: true
  })

  return useArtifactV1Data
    ? {
        fetchDigest: fetchV1Digest,
        fetchingDigest: fetchingV1Digest,
        fetchDigestError: fetchV1DigestError,
        garDigestData: garV1DigestData
      }
    : {
        fetchDigest: fetchV2Digest,
        fetchingDigest: fetchingV2Digest,
        fetchDigestError: fetchV2DigestError,
        garDigestData: garV2DigestData
      }
}
