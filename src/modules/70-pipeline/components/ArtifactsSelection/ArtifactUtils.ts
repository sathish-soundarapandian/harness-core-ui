/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiTypeInputType, RUNTIME_INPUT_VALUE, SelectOption } from '@harness/uicore'
import type { FormikValues } from 'formik'
import { defaultTo, get, isEmpty, isObject, merge } from 'lodash-es'
import { isTASDeploymentType, RepositoryFormatTypes, ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import type {
  ArtifactConfig,
  ConnectorConfigDTO,
  PrimaryArtifact,
  ServiceDefinition,
  SidecarArtifact
} from 'services/cd-ng'
import { ENABLED_ARTIFACT_TYPES, ModalViewFor } from './ArtifactHelper'
import {
  ArtifactTagHelperText,
  ArtifactType,
  GoogleArtifactRegistryInitialValuesType,
  CustomArtifactSource,
  GithubPackageRegistryInitialValuesType,
  ImagePathTypes,
  JenkinsArtifactType,
  Nexus2InitialValuesType,
  RepositoryPortOrServer,
  TagTypes,
  AmazonMachineImageInitialValuesType,
  AzureArtifactsInitialValues
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

export const resetVersion = (formik: FormikValues): void => {
  formik.values.spec?.versionType === 'value' &&
    getMultiTypeFromValue(formik.values.spec?.version?.value) === MultiTypeInputType.FIXED &&
    formik.values.spec?.version?.value?.length &&
    formik.setFieldValue('spec.version', '')
}

export const resetArtifactPath = (formik: FormikValues): void => {
  getMultiTypeFromValue(formik.values.artifactPath?.value) === MultiTypeInputType.FIXED &&
    formik.values.artifactPath?.value?.length &&
    formik.setFieldValue('artifactPath', '')
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

export const getConnectorRefQueryData = (prevStepData: ConnectorConfigDTO | undefined): string => {
  return prevStepData?.connectorId?.value || prevStepData?.connectorId?.connector?.value || prevStepData?.identifier
}

export const helperTextData = (
  selectedArtifact: ArtifactType | null,
  formik: FormikValues,
  connectorIdValue: string
): ArtifactTagHelperText => {
  switch (selectedArtifact) {
    case ENABLED_ARTIFACT_TYPES.AzureArtifacts:
      return {
        package: formik.values?.package,
        project: formik.values?.project,
        feed: formik.values?.feed,
        connectorRef: connectorIdValue
      }
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
    case ENABLED_ARTIFACT_TYPES.CustomArtifact:
      return {
        artifactArrayPath: formik.values?.spec?.scripts?.fetchAllArtifacts?.artifactsArrayPath,
        versionPath: formik.values?.spec?.scripts?.fetchAllArtifacts?.versionPath,
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
    case ENABLED_ARTIFACT_TYPES.Nexus2Registry:
      return formik.values?.repositoryFormat === RepositoryFormatTypes.Maven
        ? {
            connectorRef: connectorIdValue,
            repository: formik.values?.repository,
            repositoryFormat: formik.values?.repositoryFormat,
            artifactId: formik.values?.spec?.artifactId,
            groupId: formik.values?.spec?.groupId
          }
        : formik.values?.repositoryFormat === RepositoryFormatTypes.Docker
        ? {
            connectorRef: connectorIdValue,
            artifactPath: formik.values?.artifactPath,
            repository: formik.values?.repository,
            repositoryPort: formik.values?.repositoryPort
          }
        : {
            connectorRef: connectorIdValue,
            repository: formik.values?.repository,
            repositoryFormat: formik.values?.repositoryFormat,
            packageName: formik.values?.spec?.packageName
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
export const shouldFetchFieldOptions = (
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
      ...tagData,
      digest: formData?.digest
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

const getTagValues = (
  specValues: any,
  isServerlessDeploymentTypeSelected = false
): ImagePathTypes & Nexus2InitialValuesType => {
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

const getDigestValues = (specValues: any): ImagePathTypes => {
  const values = { ...specValues }
  if (specValues?.digest && getMultiTypeFromValue(specValues?.digest) === MultiTypeInputType.FIXED) {
    if (getMultiTypeFromValue(specValues?.digest) === MultiTypeInputType.FIXED) {
      values.digest = { label: specValues?.digest, value: specValues?.digest }
    } else {
      values.digest = specValues?.digest
    }
  }
  return values
}

export type artifactInitialValueTypes =
  | ImagePathTypes
  | GithubPackageRegistryInitialValuesType
  | GoogleArtifactRegistryInitialValuesType
  | Nexus2InitialValuesType
  | CustomArtifactSource
  | JenkinsArtifactType
  | AmazonMachineImageInitialValuesType
  | AzureArtifactsInitialValues

export const getArtifactFormData = (
  initialValues: artifactInitialValueTypes,
  selectedArtifact: ArtifactType,
  isIdentifierAllowed: boolean,
  selectedDeploymentType?: ServiceDefinition['type'],
  isServerlessDeploymentTypeSelected = false
): artifactInitialValueTypes => {
  const specValues = get(initialValues, 'spec', null)
  const isTasDeploymentTypeSelected = isTASDeploymentType(selectedDeploymentType as string)

  if (selectedArtifact !== (initialValues as any)?.type || !specValues) {
    return defaultArtifactInitialValues(selectedArtifact, selectedDeploymentType)
  }

  let values: artifactInitialValueTypes | null = {} as artifactInitialValueTypes

  const getFixedArtifactValue = () => {
    const artifactFixedPaths = specValues.artifactPaths.map((artifactPath: string) => ({
      label: artifactPath,
      value: artifactPath
    }))
    return isTasDeploymentTypeSelected ? artifactFixedPaths[0] : artifactFixedPaths
  }
  switch (selectedArtifact) {
    case ENABLED_ARTIFACT_TYPES.CustomArtifact:
    case ENABLED_ARTIFACT_TYPES.Jenkins:
      values = initialValues
      break
    case ENABLED_ARTIFACT_TYPES.Bamboo:
      values = {
        ...initialValues,
        spec: {
          ...specValues,
          artifactPaths:
            getMultiTypeFromValue(specValues.artifactPaths) === MultiTypeInputType.FIXED &&
            specValues.artifactPaths &&
            specValues.artifactPaths.length
              ? getFixedArtifactValue()
              : specValues.artifactPaths
        }
      }
      break

    case ENABLED_ARTIFACT_TYPES.GoogleArtifactRegistry:
    case ENABLED_ARTIFACT_TYPES.GithubPackageRegistry:
    case ENABLED_ARTIFACT_TYPES.AmazonMachineImage:
      values = getVersionValues(specValues)
      break
    case ENABLED_ARTIFACT_TYPES.AzureArtifacts:
      values = getSpecForAzureArtifacts(specValues)
      break
    case ENABLED_ARTIFACT_TYPES.Nexus3Registry:
      values = getRepoValues(specValues)
      break
    case ENABLED_ARTIFACT_TYPES.Nexus2Registry:
      values = getRepoValuesForNexus2(specValues)
      break
    default:
      values = getTagValues(specValues, isServerlessDeploymentTypeSelected)
  }

  if (selectedArtifact === ENABLED_ARTIFACT_TYPES.DockerRegistry) {
    values = getDigestValues(values)
  }

  if (isIdentifierAllowed && initialValues?.identifier) {
    merge(values, { identifier: initialValues?.identifier })
  }
  return values
}

const getVersionValues = (
  specValues: any
): GithubPackageRegistryInitialValuesType &
  GoogleArtifactRegistryInitialValuesType &
  AmazonMachineImageInitialValuesType => {
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

const getSpecForAzureArtifacts = (specValues: any): AzureArtifactsInitialValues => {
  const formikInitialValues = {
    versionType: specValues?.version ? TagTypes.Value : TagTypes.Regex,
    ...specValues,
    version: specValues?.version,
    versionRegex: specValues?.versionRegex
  }
  return formikInitialValues
}

const getRepoValues = (specValues: Nexus2InitialValuesType): Nexus2InitialValuesType => {
  const formikInitialValues: Nexus2InitialValuesType = {
    ...specValues,
    tagType: specValues?.tag ? TagTypes.Value : TagTypes.Regex,
    spec: {
      ...specValues?.spec,
      repositoryPortorRepositoryURL: specValues?.spec?.repositoryUrl
        ? RepositoryPortOrServer.RepositoryUrl
        : RepositoryPortOrServer.RepositoryPort
    }
  }
  if (specValues?.tag && getMultiTypeFromValue(specValues?.tag) === MultiTypeInputType.FIXED) {
    formikInitialValues.tag = { label: specValues?.tag, value: specValues?.tag } as any
  }
  return formikInitialValues
}

const getRepoValuesForNexus2 = (specValues: Nexus2InitialValuesType): Nexus2InitialValuesType => {
  const formikInitialValues: Nexus2InitialValuesType = {
    ...specValues,
    tagType: specValues?.tag ? TagTypes.Value : TagTypes.Regex,
    ...specValues
  }
  if (specValues?.tag && getMultiTypeFromValue(specValues?.tag) === MultiTypeInputType.FIXED) {
    formikInitialValues.tag = { label: specValues?.tag, value: specValues?.tag } as any
  }
  return formikInitialValues
}

export const isFieldFixedAndNonEmpty = (field: string): boolean => {
  return getMultiTypeFromValue(field) === MultiTypeInputType.FIXED ? field?.length > 0 : true
}

export const formFillingMethod = {
  MANUAL: 'manual',
  SCRIPT: 'script'
}

export const customArtifactDefaultSpec = {
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

export const defaultArtifactInitialValues = (
  selectedArtifact: ArtifactType,
  selectedDeploymentType?: ServiceDefinition['type']
): any => {
  switch (selectedArtifact) {
    case ENABLED_ARTIFACT_TYPES.AzureArtifacts:
      return {
        identifier: '',
        versionType: TagTypes.Value,
        scope: 'project',
        project: '',
        feed: '',
        packageType: 'maven',
        package: '',
        version: RUNTIME_INPUT_VALUE
      }
    case ENABLED_ARTIFACT_TYPES.Bamboo:
      return {
        identifier: '',
        spec: {
          planKey: '',
          artifactPaths: [],
          build: ''
        }
      }
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
          version: RUNTIME_INPUT_VALUE
        }
      }
    case ENABLED_ARTIFACT_TYPES.AmazonMachineImage:
      return {
        identifier: '',
        versionType: TagTypes.Value,
        spec: {
          version: '',
          versionRegex: '',
          tags: null,
          filters: null,
          region: ''
        }
      }
    case ENABLED_ARTIFACT_TYPES.Nexus3Registry:
      return {
        identifier: '',
        tagType: TagTypes.Value,
        tag: RUNTIME_INPUT_VALUE,
        tagRegex: RUNTIME_INPUT_VALUE,
        repository: '',
        repositoryFormat: selectedDeploymentType === ServiceDeploymentType.AwsLambda ? 'maven' : 'docker',
        spec: {
          repositoryPortorRepositoryURL: RepositoryPortOrServer.RepositoryUrl,
          artifactPath: '',
          repositoryUrl: '',
          repositoryPort: '',
          artifactId: '',
          groupId: '',
          group: '',
          extension: '',
          classifier: '',
          packageName: ''
        }
      }
    case ENABLED_ARTIFACT_TYPES.Nexus2Registry:
      return {
        identifier: '',
        connectorRef: '',
        tagType: TagTypes.Value,
        tag: '',
        tagRegex: '',
        repository: '',
        repositoryFormat: 'maven',
        spec: {
          artifactId: '',
          groupId: '',
          extension: '',
          classifier: '',
          packageName: ''
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
    case ENABLED_ARTIFACT_TYPES.GithubPackageRegistry:
      return {
        identifier: '',
        versionType: TagTypes.Value,
        spec: {
          connectorRef: '',
          packageType: 'container',
          org: '',
          packageName: '',
          version: '',
          versionRegex: ''
        }
      }
    case ENABLED_ARTIFACT_TYPES.CustomArtifact:
      return {
        identifier: '',
        spec: {
          ...customArtifactDefaultSpec
        }
      }
    case ENABLED_ARTIFACT_TYPES.AmazonS3:
      return {
        identifier: '',
        bucketName: '',
        tagType: TagTypes.Value,
        filePath: ''
      }
    case ENABLED_ARTIFACT_TYPES.GoogleCloudStorage:
      return {
        identifier: '',
        project: '',
        bucket: '',
        artifactPath: ''
      }
    case ENABLED_ARTIFACT_TYPES.GoogleCloudSource:
      return {
        identifier: '',
        project: '',
        repository: '',
        fetchType: 'Branch',
        branch: undefined,
        commitId: undefined,
        tag: undefined,
        sourceDirectory: ''
      }
    case ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry:
      return {
        repositoryFormat: 'generic',
        repository: '',
        artifactPath: RUNTIME_INPUT_VALUE,
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
): string & SelectOption => {
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
    artifact.spec?.repository ??
    artifact.spec?.version ??
    artifact.spec?.versionRegex
  )
}

export const amiFilters = [
  {
    label: 'ami-image-id',
    value: 'ami-image-id'
  },
  {
    label: 'ami-name',
    value: 'ami-name'
  },
  {
    label: 'ami-owner-id',
    value: 'ami-owner-id'
  },
  {
    label: 'ami-platform',
    value: 'ami-platform'
  }
]

export const getInSelectOptionForm = (data?: { [key: string]: string } | string) => {
  if (isObject(data)) {
    return Object.entries(data)
      .filter(([_, value]) => Boolean(value))
      .map(([name, value]) => ({ name, value }))
  }

  return data
}

export const shouldHideHeaderAndNavBtns = (context: number): boolean =>
  [ModalViewFor.Template, ModalViewFor.CD_Onboarding].includes(context)

export const isTemplateView = (context: ModalViewFor): boolean => context === ModalViewFor.Template

export const hasFixedDefiniteValue = (value: any) => {
  return getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME || !value
}

export const resetFieldValue = (formik: FormikValues, fieldPath: string, resetValue: string | object = ''): void => {
  const fieldValue = get(formik.values, fieldPath, '')
  if (!isEmpty(fieldValue) && getMultiTypeFromValue(fieldValue) === MultiTypeInputType.FIXED) {
    formik.setFieldValue(fieldPath, resetValue)
  }
}

export const canFetchDigest = (imagePath: string, tag: string, connectorRefValue: string) => {
  return (
    getMultiTypeFromValue(imagePath) !== MultiTypeInputType.RUNTIME &&
    getMultiTypeFromValue(tag) !== MultiTypeInputType.RUNTIME &&
    getMultiTypeFromValue(connectorRefValue) !== MultiTypeInputType.RUNTIME
  )
}

export const canFetchAMITags = (repository: string, groupId?: string, artifactId?: string) => {
  return (
    getMultiTypeFromValue(repository) !== MultiTypeInputType.RUNTIME &&
    getMultiTypeFromValue(groupId) !== MultiTypeInputType.RUNTIME &&
    getMultiTypeFromValue(artifactId) !== MultiTypeInputType.RUNTIME
  )
}

export const isArtifactInMultiService = (services?: string[], path?: string): boolean => {
  // The first condition is for TemplateUsage and the second condition is for all other templatized views
  return !isEmpty(services) || !!path?.includes('services.values')
}

export const getConnectorListVersionQueryParam = (
  selectedArtifact: ArtifactType | null
): { version: string } | null => {
  switch (selectedArtifact) {
    case ENABLED_ARTIFACT_TYPES.Nexus3Registry:
      return { version: '3.x' }
    case ENABLED_ARTIFACT_TYPES.Nexus2Registry:
      return { version: '2.x' }
    default:
      return null
  }
}
