/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Schema } from 'yup'
import type { IconName } from '@wings-software/uicore'
import type { IOptionProps } from '@blueprintjs/core'
import { isEmpty } from 'lodash-es'
import { NameSchema } from '@common/utils/Validation'
import { Connectors } from '@connectors/constants'
import type { ArtifactSource, ConnectorInfoDTO, PrimaryArtifact, ServiceDefinition } from 'services/cd-ng'
import type { StringKeys } from 'framework/strings'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import type { ArtifactType } from './ArtifactInterface'

export enum ModalViewFor {
  PRIMARY = 1,
  SIDECAR = 2
}

export const isAllowedCustomArtifactDeploymentTypes = (deploymentType: ServiceDefinition['type']): boolean => {
  return (
    deploymentType === ServiceDeploymentType.Kubernetes ||
    deploymentType === ServiceDeploymentType.NativeHelm ||
    deploymentType === ServiceDeploymentType.ECS
  )
}

export const isSidecarAllowed = (deploymentType: ServiceDefinition['type'], isReadOnly: boolean): boolean => {
  return (
    !isReadOnly &&
    !(
      deploymentType === ServiceDeploymentType.WinRm ||
      deploymentType === ServiceDeploymentType.Ssh ||
      deploymentType === ServiceDeploymentType.AzureWebApp ||
      deploymentType === ServiceDeploymentType.CustomDeployment
    )
  )
}
export const isPrimaryAdditionAllowed = (
  primaryArtifact: ArtifactSource[] | PrimaryArtifact,
  isMultiArtifactSource?: boolean
): boolean => {
  if (isMultiArtifactSource) {
    return true
  }
  return isEmpty(primaryArtifact)
}

export const ArtifactIconByType: Record<ArtifactType, IconName> = {
  DockerRegistry: 'service-dockerhub',
  Gcr: 'service-gcp',
  Ecr: 'ecr-step',
  Nexus3Registry: 'service-nexus',
  Nexus2Registry: 'service-nexus',
  ArtifactoryRegistry: 'service-artifactory',
  CustomArtifact: 'custom-artifact',
  Acr: 'service-azure',
  Jenkins: 'service-jenkins',
  AmazonS3: 'service-service-s3',
  GoogleArtifactRegistry: 'service-gar',
  GithubPackageRegistry: 'service-github',
  AzureArtifactsRegistry: 'service-github'
}

export const ArtifactTitleIdByType: Record<ArtifactType, StringKeys> = {
  DockerRegistry: 'dockerRegistry',
  Gcr: 'connectors.GCR.name',
  Ecr: 'connectors.ECR.name',
  Nexus3Registry: 'connectors.nexus.nexusLabel',
  Nexus2Registry: 'connectors.nexus.nexus2Label',
  ArtifactoryRegistry: 'connectors.artifactory.artifactoryLabel',
  CustomArtifact: 'common.repo_provider.customLabel',
  Acr: 'pipeline.ACR.name',
  Jenkins: 'connectors.jenkins.jenkins',
  AmazonS3: 'pipeline.artifactsSelection.amazonS3Title',
  GoogleArtifactRegistry: 'pipeline.artifactsSelection.googleArtifactRegistryTitle',
  GithubPackageRegistry: 'pipeline.artifactsSelection.githubPackageRegistryTitle',
  AzureArtifactsRegistry: 'pipeline.artifactsSelection.azureArtifactRegistryTitle'
}

export const ENABLED_ARTIFACT_TYPES: { [key: string]: ArtifactType } = {
  DockerRegistry: 'DockerRegistry',
  Gcr: 'Gcr',
  Ecr: 'Ecr',
  Nexus3Registry: 'Nexus3Registry',
  Nexus2Registry: 'Nexus2Registry',
  ArtifactoryRegistry: 'ArtifactoryRegistry',
  CustomArtifact: 'CustomArtifact',
  Acr: 'Acr',
  Jenkins: 'Jenkins',
  AmazonS3: 'AmazonS3',
  GoogleArtifactRegistry: 'GoogleArtifactRegistry',
  GithubPackageRegistry: 'GithubPackageRegistry'
}

export const ArtifactToConnectorMap: Record<string, ConnectorInfoDTO['type']> = {
  DockerRegistry: Connectors.DOCKER,
  Gcr: Connectors.GCP,
  Ecr: Connectors.AWS,
  Nexus3Registry: Connectors.NEXUS,
  Nexus2Registry: Connectors.NEXUS,
  ArtifactoryRegistry: Connectors.ARTIFACTORY,
  Acr: Connectors.AZURE,
  Jenkins: Connectors.JENKINS,
  AmazonS3: Connectors.AWS,
  GoogleArtifactRegistry: Connectors.GCP,
  GithubPackageRegistry: Connectors.GITHUB
}

export const ArtifactConnectorLabelMap: Record<string, string> = {
  DockerRegistry: 'Docker Registry',
  Gcr: 'GCP',
  Ecr: 'AWS',
  Nexus3Registry: 'Nexus3',
  Nexus2Registry: 'Nexus2',
  ArtifactoryRegistry: 'Artifactory',
  Acr: 'Azure',
  Jenkins: 'Jenkins',
  AmazonS3: 'AWS',
  GoogleArtifactRegistry: 'GCP',
  GithubPackageRegistry: 'Github'
}

export const allowedArtifactTypes: Record<ServiceDefinition['type'], Array<ArtifactType>> = {
  Kubernetes: [
    ENABLED_ARTIFACT_TYPES.DockerRegistry,
    ENABLED_ARTIFACT_TYPES.Gcr,
    ENABLED_ARTIFACT_TYPES.Ecr,
    ENABLED_ARTIFACT_TYPES.Nexus3Registry,
    ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry,
    ENABLED_ARTIFACT_TYPES.Acr
  ],
  NativeHelm: [
    ENABLED_ARTIFACT_TYPES.DockerRegistry,
    ENABLED_ARTIFACT_TYPES.Gcr,
    ENABLED_ARTIFACT_TYPES.Ecr,
    ENABLED_ARTIFACT_TYPES.Nexus3Registry,
    ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry,
    ENABLED_ARTIFACT_TYPES.Acr
  ],
  ServerlessAwsLambda: [
    ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry,
    ENABLED_ARTIFACT_TYPES.Ecr,
    ENABLED_ARTIFACT_TYPES.AmazonS3
  ],
  Ssh: [
    ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry,
    ENABLED_ARTIFACT_TYPES.Jenkins,
    ENABLED_ARTIFACT_TYPES.CustomArtifact,
    ENABLED_ARTIFACT_TYPES.Nexus3Registry,
    ENABLED_ARTIFACT_TYPES.AmazonS3
  ],
  WinRm: [
    ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry,
    ENABLED_ARTIFACT_TYPES.Jenkins,
    ENABLED_ARTIFACT_TYPES.CustomArtifact,
    ENABLED_ARTIFACT_TYPES.Nexus3Registry,
    ENABLED_ARTIFACT_TYPES.AmazonS3
  ],
  AzureWebApp: [
    ENABLED_ARTIFACT_TYPES.DockerRegistry,
    ENABLED_ARTIFACT_TYPES.Gcr,
    ENABLED_ARTIFACT_TYPES.Ecr,
    ENABLED_ARTIFACT_TYPES.Nexus3Registry,
    ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry,
    ENABLED_ARTIFACT_TYPES.Acr
  ],
  ECS: [
    ENABLED_ARTIFACT_TYPES.DockerRegistry,
    ENABLED_ARTIFACT_TYPES.Gcr,
    ENABLED_ARTIFACT_TYPES.Ecr,
    ENABLED_ARTIFACT_TYPES.Nexus3Registry,
    ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry,
    ENABLED_ARTIFACT_TYPES.Acr
  ],
  CustomDeployment: [
    ENABLED_ARTIFACT_TYPES.CustomArtifact,
    ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry,
    ENABLED_ARTIFACT_TYPES.Jenkins,
    ENABLED_ARTIFACT_TYPES.Nexus3Registry,
    ENABLED_ARTIFACT_TYPES.AmazonS3,
    ENABLED_ARTIFACT_TYPES.DockerRegistry,
    ENABLED_ARTIFACT_TYPES.Ecr,
    ENABLED_ARTIFACT_TYPES.Gcr,
    ENABLED_ARTIFACT_TYPES.Acr
  ]
}

export const tagOptions: IOptionProps[] = [
  {
    label: 'Value',
    value: 'value'
  },
  {
    label: 'Regex',
    value: 'regex'
  }
]

export const repositoryPortOrServer: IOptionProps[] = [
  {
    label: 'Repository URL',
    value: 'repositoryUrl'
  },
  {
    label: 'Repository Port',
    value: 'repositoryPort'
  }
]

export const ArtifactIdentifierValidation = (
  artifactIdentifiers: string[],
  id: string | undefined,
  validationMsg: string
): { identifier: Schema<unknown> } => {
  if (!id) {
    return {
      identifier: NameSchema().notOneOf(artifactIdentifiers, validationMsg)
    }
  }
  return {
    identifier: NameSchema()
  }
}

export const getArtifactsHeaderTooltipId = (selectedDeploymentType: ServiceDefinition['type']): string => {
  return `${selectedDeploymentType}DeploymentTypeArtifacts`
}
