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
      deploymentType === ServiceDeploymentType.AzureWebApp
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
  ArtifactoryRegistry: 'service-artifactory',
  CustomArtifact: 'custom-artifact',
  Acr: 'service-azure',
  Jenkins: 'service-jenkins',
  AmazonS3: 'service-service-s3',
  GoogleArtifactRegistry: 'service-gar'
}

export const ArtifactTitleIdByType: Record<ArtifactType, StringKeys> = {
  DockerRegistry: 'dockerRegistry',
  Gcr: 'connectors.GCR.name',
  Ecr: 'connectors.ECR.name',
  Nexus3Registry: 'connectors.nexus.nexusLabel',
  ArtifactoryRegistry: 'connectors.artifactory.artifactoryLabel',
  CustomArtifact: 'common.repo_provider.customLabel',
  Acr: 'pipeline.ACR.name',
  Jenkins: 'connectors.jenkins.jenkins',
  AmazonS3: 'pipeline.artifactsSelection.amazonS3Title',
  GoogleArtifactRegistry: 'pipeline.artifactsSelection.googleArtifactRegistryTitle'
}

export const ENABLED_ARTIFACT_TYPES: { [key: string]: ArtifactType } = {
  DockerRegistry: 'DockerRegistry',
  Gcr: 'Gcr',
  Ecr: 'Ecr',
  Nexus3Registry: 'Nexus3Registry',
  ArtifactoryRegistry: 'ArtifactoryRegistry',
  CustomArtifact: 'CustomArtifact',
  Acr: 'Acr',
  Jenkins: 'Jenkins',
  AmazonS3: 'AmazonS3',
  GoogleArtifactRegistry: 'GoogleArtifactRegistry'
}

export const ArtifactToConnectorMap: Record<string, ConnectorInfoDTO['type']> = {
  DockerRegistry: Connectors.DOCKER,
  Gcr: Connectors.GCP,
  Ecr: Connectors.AWS,
  Nexus3Registry: Connectors.NEXUS,
  ArtifactoryRegistry: Connectors.ARTIFACTORY,
  Acr: Connectors.AZURE,
  Jenkins: Connectors.JENKINS,
  AmazonS3: Connectors.AWS,
  GoogleArtifactRegistry: Connectors.GCP
}

export const ArtifactConnectorLabelMap: Record<string, string> = {
  DockerRegistry: 'Docker Registry',
  Gcr: 'GCP',
  Ecr: 'AWS',
  Nexus3Registry: 'Nexus',
  ArtifactoryRegistry: 'Artifactory',
  Acr: 'Azure',
  Jenkins: 'Jenkins',
  AmazonS3: 'AWS',
  GoogleArtifactRegistry: 'GCP'
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
    ENABLED_ARTIFACT_TYPES.Ecr
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

export const regions = [
  {
    label: 'asia',
    value: 'asia'
  },
  {
    label: 'asia-east1',
    value: 'asia-east1'
  },
  {
    label: 'asia-east2',
    value: 'asia-east2'
  },
  {
    label: 'asia-northeast1',
    value: 'asia-northeast1'
  },
  {
    label: 'asia-northeast2',
    value: 'asia-northeast2'
  },
  {
    label: 'asia-northeast3',
    value: 'asia-northeast3'
  },
  {
    label: 'asia-south1',
    value: 'asia-south1'
  },
  {
    label: 'asia-south2',
    value: 'asia-south2'
  },
  {
    label: 'asia-southeast1',
    value: 'asia-southeast1'
  },
  {
    label: 'asia-southeast2',
    value: 'asia-southeast2'
  },
  {
    label: 'australia-southeast1',
    value: 'australia-southeast1'
  },
  {
    label: 'australia-southeast2',
    value: 'australia-southeast2'
  },
  {
    label: 'europe',
    value: 'europe'
  },
  {
    label: 'europe-central2',
    value: 'europe-central2'
  },
  {
    label: 'europe-north1',
    value: 'europe-north1'
  },
  {
    label: 'europe-southwest1',
    value: 'europe-southwest1'
  },
  {
    label: 'europe-west1',
    value: 'europe-west1'
  },
  {
    label: 'europe-west2',
    value: 'europe-west2'
  },
  {
    label: 'europe-west3',
    value: 'europe-west3'
  },
  {
    label: 'europe-west4',
    value: 'europe-west4'
  },
  {
    label: 'europe-west6',
    value: 'europe-west6'
  },
  {
    label: 'europe-west8',
    value: 'europe-west8'
  },
  {
    label: 'europe-west9',
    value: 'europe-west9'
  },
  {
    label: 'northamerica-northeast1',
    value: 'northamerica-northeast1'
  },
  {
    label: 'northamerica-northeast2',
    value: 'northamerica-northeast2'
  },
  {
    label: 'southamerica-east1',
    value: 'southamerica-east1'
  },
  {
    label: 'southamerica-west1',
    value: 'southamerica-west1'
  },
  {
    label: 'us',
    value: 'us'
  },
  {
    label: 'us-central1',
    value: 'us-central1'
  },
  {
    label: 'us-east1',
    value: 'us-east1'
  },
  {
    label: 'us-east4',
    value: 'us-east4'
  },
  {
    label: 'us-east5',
    value: 'us-east5'
  },
  {
    label: 'us-south1',
    value: 'us-south1'
  },
  {
    label: 'us-west1',
    value: 'us-west1'
  },
  {
    label: 'us-west2',
    value: 'us-west2'
  },
  {
    label: 'us-west3',
    value: 'us-west3'
  },
  {
    label: 'us-west4',
    value: 'us-west4'
  }
]
