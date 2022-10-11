/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiTypeInputType, RUNTIME_INPUT_VALUE, SelectOption } from '@harness/uicore'
import type { FormikValues } from 'formik'
import { defaultTo, get, isEmpty, merge } from 'lodash-es'
import type { ArtifactConfig, ConnectorConfigDTO, PrimaryArtifact, SidecarArtifact } from 'services/cd-ng'
import { ENABLED_ARTIFACT_TYPES } from './ArtifactHelper'
import {
  ArtifactTagHelperText,
  ArtifactType,
  GoogleArtifactRegistryInitialValuesType,
  CustomArtifactSource,
  ImagePathTypes,
  JenkinsArtifactType,
  RepositoryPortOrServer,
  TagTypes
} from './ArtifactInterface'

export const shellScriptType: SelectOption[] = [
  { label: 'Bash', value: 'Bash' },
  { label: 'PowerShell', value: 'PowerShell' }
]

export enum RegistryHostNames {
  GCR_URL = 'gcr.io',
  US_GCR_URL = 'us.gcr.io',
  ASIA_GCR_URL = 'asia.gcr.io',
  EU_GCR_URL = 'eu.gcr.io',
  MIRROR_GCR_URL = 'mirror.gcr.io',
  K8S_GCR_URL = 'k8s.gcr.io',
  LAUNCHER_GCR_URL = 'launcher.gcr.io'
}

export const repositoryFormat = 'docker'
export const resetTag = (formik: FormikValues): void => {
  formik.values.tagType === 'value' &&
    getMultiTypeFromValue(formik.values.tag?.value) === MultiTypeInputType.FIXED &&
    formik.values.tag?.value?.length &&
    formik.setFieldValue('tag', '')
}

export const getConnectorIdValue = (prevStepData: ConnectorConfigDTO | undefined): string => {
  if (getMultiTypeFromValue(prevStepData?.connectorId) !== MultiTypeInputType.FIXED) {
    return prevStepData?.connectorId
  }
  if (prevStepData?.connectorId?.value) {
    return prevStepData?.connectorId?.value
  }
  return prevStepData?.identifier || ''
}

export const helperTextData = (
  selectedArtifact: ArtifactType,
  formik: FormikValues,
  connectorIdValue: string
): ArtifactTagHelperText => {
  switch (selectedArtifact) {
    case ENABLED_ARTIFACT_TYPES.GoogleArtifactRegistry:
      return {
        package: formik.values?.spec?.package,
        project: formik.values?.spec?.project,
        region: formik.values?.spec?.region,
        repositoryName: formik.values?.spec?.repositoryName,
        connectorRef: connectorIdValue
      }
    case ENABLED_ARTIFACT_TYPES.DockerRegistry:
      return {
        imagePath: formik.values?.imagePath,
        connectorRef: connectorIdValue
      }
    case ENABLED_ARTIFACT_TYPES.Ecr:
      return {
        imagePath: formik.values?.imagePath,
        region: formik.values?.region || '',
        connectorRef: connectorIdValue
      }
    case ENABLED_ARTIFACT_TYPES.Gcr:
      return {
        imagePath: formik.values?.imagePath,
        registryHostname: formik.values?.registryHostname || '',
        connectorRef: connectorIdValue
      }
    case ENABLED_ARTIFACT_TYPES.Nexus3Registry:
      return {
        artifactPath: formik.values?.artifactPath,
        repository: formik.values?.repository,
        repositoryPort: formik.values?.repositoryPort,
        connectorRef: connectorIdValue
      }
    case ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry:
      return {
        artifactPath: formik.values?.artifactPath,
        repository: formik.values?.repository,
        connectorRef: connectorIdValue,
        artifactDirectory: formik.values?.artifactDirectory
      }
    case ENABLED_ARTIFACT_TYPES.Acr:
      return {
        subscriptionId: formik.values?.subscriptionId,
        registry: formik.values?.registry,
        repository: formik.values?.repository,
        connectorRef: connectorIdValue
      }
    default:
      return {} as ArtifactTagHelperText
  }
}

export const checkIfQueryParamsisNotEmpty = (queryParamList: Array<string | number | undefined>): boolean => {
  return queryParamList.every(querydata => {
    if (typeof querydata !== 'number') {
      return !isEmpty(querydata)
    }
    return querydata !== undefined
  })
}
export const shouldFetchTags = (
  prevStepData: ConnectorConfigDTO | undefined,
  queryParamList: Array<string | number>
): boolean => {
  return (
    !isEmpty(getConnectorIdValue(prevStepData)) &&
    getMultiTypeFromValue(getConnectorIdValue(prevStepData)) === MultiTypeInputType.FIXED &&
    checkIfQueryParamsisNotEmpty(queryParamList) &&
    queryParamList.every(query => getMultiTypeFromValue(query) === MultiTypeInputType.FIXED)
  )
}

export const getFinalArtifactObj = (
  formData: ImagePathTypes & { connectorId?: string },
  isIdentifierAllowed: boolean
): ArtifactConfig => {
  const tagData =
    formData?.tagType === TagTypes.Value
      ? { tag: defaultTo(formData.tag?.value, formData.tag) }
      : { tagRegex: defaultTo(formData.tagRegex?.value, formData.tagRegex) }

  const artifactObj: ArtifactConfig = {
    spec: {
      connectorRef: formData?.connectorId,
      imagePath: formData?.imagePath,
      ...tagData
    }
  }
  if (isIdentifierAllowed) {
    merge(artifactObj, { identifier: formData?.identifier })
  }
  return artifactObj
}

const getServerlessArtifactFromObj = (formData: ImagePathTypes & { connectorId?: string }): ArtifactConfig => {
  const artifactPathData =
    formData?.tagType === TagTypes.Value
      ? { artifactPath: defaultTo(formData.tag?.value, formData.tag) }
      : {
          artifactPathFilter: defaultTo(formData.tagRegex?.value, formData.tagRegex)
        }

  return {
    spec: {
      connectorRef: formData?.connectorId,
      artifactDirectory: formData?.artifactDirectory,
      ...artifactPathData
    }
  }
}

export const getFinalArtifactFormObj = (
  formData: ImagePathTypes & { connectorId?: string },
  isIdentifierAllowed: boolean,
  isServerlessDeploymentTypeSelected = false
): ArtifactConfig => {
  let artifactObj: ArtifactConfig = {}

  if (isServerlessDeploymentTypeSelected) {
    artifactObj = getServerlessArtifactFromObj(formData)
  } else {
    const tagData =
      formData?.tagType === TagTypes.Value
        ? { tag: defaultTo(formData.tag?.value, formData.tag) }
        : { tagRegex: defaultTo(formData.tagRegex?.value, formData.tagRegex) }

    artifactObj = {
      spec: {
        connectorRef: formData?.connectorId,
        artifactPath: formData?.artifactPath,
        ...tagData
      }
    }
  }

  if (isIdentifierAllowed) {
    merge(artifactObj, { identifier: formData?.identifier })
  }
  return artifactObj
}

const getTagValues = (specValues: any, isServerlessDeploymentTypeSelected = false): ImagePathTypes => {
  if (isServerlessDeploymentTypeSelected) {
    // In serverless, we do not have concept of tag / tagRegex,
    // rather we have artifactPath and artifactPathFilter and hence below name for overall object
    // Inside object we have fields tag / tagRegex because we want to reuse exisint code which is there for Kubernetes
    const artifactPathValues = {
      ...specValues,
      tagType: specValues?.artifactPath ? TagTypes.Value : TagTypes.Regex,
      tag: specValues?.artifactPath,
      tagRegex: specValues?.artifactPathFilter
    }
    if (specValues?.artifactPath && getMultiTypeFromValue(specValues?.artifactPath) === MultiTypeInputType.FIXED) {
      artifactPathValues.tag = { label: specValues?.artifactPath, value: specValues?.artifactPath }
    }
    return artifactPathValues
  }
  const values = {
    ...specValues,
    tagType: specValues.tag ? TagTypes.Value : TagTypes.Regex
  }
  if (specValues?.tag && getMultiTypeFromValue(specValues?.tag) === MultiTypeInputType.FIXED) {
    values.tag = { label: specValues?.tag, value: specValues?.tag }
  }
  return values
}

export const getArtifactFormData = (
  initialValues: ImagePathTypes,
  selectedArtifact: ArtifactType,
  isIdentifierAllowed: boolean,
  isServerlessDeploymentTypeSelected = false
): ImagePathTypes => {
  const specValues = get(initialValues, 'spec', null)

  if (selectedArtifact !== (initialValues as any)?.type || !specValues) {
    return defaultArtifactInitialValues(selectedArtifact)
  }
  const values = getTagValues(specValues, isServerlessDeploymentTypeSelected)

  if (isIdentifierAllowed && initialValues?.identifier) {
    merge(values, { identifier: initialValues?.identifier })
  }
  return values
}

export const getCustomArtifactFormData = (
  initialValues: CustomArtifactSource,
  selectedArtifact: ArtifactType,
  isIdentifierAllowed: boolean
): CustomArtifactSource => {
  const specValues = get(initialValues, 'spec', null)
  if (selectedArtifact !== (initialValues as any)?.type || !specValues) {
    return defaultArtifactInitialValues(selectedArtifact)
  }

  if (isIdentifierAllowed && initialValues?.identifier) {
    merge(initialValues, { identifier: initialValues?.identifier })
  }
  return initialValues
}

export const getJenkinsFormData = (
  initialValues: JenkinsArtifactType,
  selectedArtifact: ArtifactType,
  isIdentifierAllowed: boolean
): JenkinsArtifactType => {
  const specValues = get(initialValues, 'spec', null)

  if (selectedArtifact !== (initialValues as any)?.type || !specValues) {
    return defaultArtifactInitialValues(selectedArtifact)
  }

  if (isIdentifierAllowed && initialValues?.identifier) {
    merge(initialValues, { identifier: initialValues?.identifier })
  }
  return initialValues
}

const getVersionValues = (specValues: any): GoogleArtifactRegistryInitialValuesType => {
  const formikInitialValues = {
    versionType: specValues?.version ? TagTypes.Value : TagTypes.Regex,
    spec: {
      ...specValues,
      version: specValues?.version,
      versionRegex: specValues?.versionRegex
    }
  }
  return formikInitialValues
}

export const getGoogleArtifactRegistryFormData = (
  initialValues: GoogleArtifactRegistryInitialValuesType,
  selectedArtifact: ArtifactType,
  isIdentifierAllowed: boolean
): GoogleArtifactRegistryInitialValuesType => {
  const specValues = get(initialValues, 'spec', null)

  if (selectedArtifact !== (initialValues as any)?.type || !specValues) {
    return defaultArtifactInitialValues(selectedArtifact)
  }

  const values = getVersionValues(specValues)

  if (isIdentifierAllowed && initialValues?.identifier) {
    merge(values, { identifier: initialValues?.identifier })
  }
  return values
}

export const isFieldFixedAndNonEmpty = (field: string): boolean => {
  return getMultiTypeFromValue(field) === MultiTypeInputType.FIXED && field?.length > 0
}

export const defaultArtifactInitialValues = (selectedArtifact: ArtifactType): any => {
  switch (selectedArtifact) {
    case ENABLED_ARTIFACT_TYPES.GoogleArtifactRegistry:
      return {
        identifier: '',
        versionType: TagTypes.Value,
        spec: {
          connectorRef: '',
          repositoryType: 'docker',
          project: '',
          region: '',
          repositoryName: '',
          package: '',
          version: ''
        }
      }
    case ENABLED_ARTIFACT_TYPES.Jenkins:
      return {
        identifier: '',
        spec: {
          jobName: '',
          artifactPath: '',
          build: RUNTIME_INPUT_VALUE
        }
      }
    case ENABLED_ARTIFACT_TYPES.Nexus3Registry:
      return {
        identifier: '',
        tagType: TagTypes.Value,
        tag: RUNTIME_INPUT_VALUE,
        tagRegex: RUNTIME_INPUT_VALUE,
        repositoryPortorRepositoryURL: RepositoryPortOrServer.RepositoryUrl
      }
    case ENABLED_ARTIFACT_TYPES.CustomArtifact:
      return {
        identifier: '',
        spec: {
          version: '',
          timeout: '',
          delegateSelectors: [],
          inputs: [],
          scripts: {
            fetchAllArtifacts: {
              artifactsArrayPath: '',
              attributes: [],
              versionPath: '',
              spec: {
                shell: shellScriptType[0].label,
                source: {
                  spec: {
                    script: ''
                  },
                  type: 'Inline'
                }
              }
            }
          }
        }
      }
    case ENABLED_ARTIFACT_TYPES.AmazonS3:
      return {
        identifier: '',
        bucketName: '',
        tagType: TagTypes.Value,
        filePath: ''
      }
    case ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry:
      return {
        repositoryFormat: 'generic',
        identifier: '',
        tag: RUNTIME_INPUT_VALUE,
        tagType: TagTypes.Value,
        tagRegex: RUNTIME_INPUT_VALUE
      }

    case ENABLED_ARTIFACT_TYPES.Acr:
    case ENABLED_ARTIFACT_TYPES.DockerRegistry:
    case ENABLED_ARTIFACT_TYPES.Gcr:
    case ENABLED_ARTIFACT_TYPES.Ecr:
    default:
      return {
        identifier: '',
        tag: RUNTIME_INPUT_VALUE,
        tagType: TagTypes.Value,
        tagRegex: RUNTIME_INPUT_VALUE
      }
  }
}

export const getArtifactPathToFetchTags = (
  formik: FormikValues,
  isArtifactPath = false,
  isServerlessDeploymentTypeSelected = false
): string => {
  if (isServerlessDeploymentTypeSelected) {
    return formik.values.artifactDirectory
  }
  if (isArtifactPath) {
    return formik.values.artifactPath
  }
  return formik.values.imagePath
}

export const showConnectorStep = (selectedArtifact: ArtifactType): boolean => {
  return selectedArtifact !== ENABLED_ARTIFACT_TYPES.CustomArtifact
}

export const isFieldFixed = (field: string): boolean => {
  return getMultiTypeFromValue(field) === MultiTypeInputType.FIXED
}
export const getArtifactLocation = (artifact: PrimaryArtifact | SidecarArtifact): string => {
  if (artifact.type === 'AmazonS3') {
    return artifact.spec?.filePath ?? artifact.spec?.filePathRegex
  }
  return (
    artifact.spec?.imagePath ??
    artifact.spec?.artifactPath ??
    artifact.spec?.artifactPathFilter ??
    artifact.spec?.repository
  )
}
