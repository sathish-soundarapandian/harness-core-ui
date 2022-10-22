/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'
import { ArtifactType, TagTypes } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'

export const props = {
  name: 'Artifact details',
  expressions: [],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  context: 2,
  handleSubmit: jest.fn(),
  artifactIdentifiers: [],
  selectedArtifact: 'Nexus3Registry' as ArtifactType,
  selectedDeploymentType: ServiceDeploymentType.Kubernetes
}

export const serverlessDeploymentTypeProps = {
  name: 'Artifact details',
  expressions: [],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  context: 1,
  handleSubmit: jest.fn(),
  artifactIdentifiers: [],
  selectedArtifact: 'ArtifactoryRegistry' as ArtifactType,
  selectedDeploymentType: ServiceDeploymentType.ServerlessAwsLambda,
  prevStepData: {
    connectorId: {
      value: 'connectorRef'
    }
  }
}

export const repoMock = {
  data: {
    repositories: {
      testRepo: 'generic-local',
      anotherRepo: 'generic repo'
    }
  }
}

export const useGetRepositoriesDetailsForArtifactoryFailure = {
  data: {
    status: 'FAILURE',
    errors: [
      {
        fieldId: 'repository',
        error: 'fetch failed'
      }
    ]
  }
}

export const useGetRepositoriesDetailsForArtifactoryError = {
  data: {
    status: 'ERROR',
    message: 'error'
  }
}

export const emptyRepoMockData = {
  data: {
    repositories: {}
  }
}

export const azureWebAppDeploymentTypeProps = {
  name: 'Artifact details',
  expressions: [],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  context: 1,
  handleSubmit: jest.fn(),
  artifactIdentifiers: [],
  selectedArtifact: 'ArtifactoryRegistry' as ArtifactType,
  selectedDeploymentType: ServiceDeploymentType.AzureWebApp,
  prevStepData: {
    connectorId: {
      value: 'connectorRef'
    }
  }
}

export const sshDeploymentTypeProps = {
  ...azureWebAppDeploymentTypeProps,
  selectedDeploymentType: ServiceDeploymentType.Ssh
}

export const winRmDeploymentTypeProps = {
  ...azureWebAppDeploymentTypeProps,
  selectedDeploymentType: ServiceDeploymentType.WinRm
}

export const genericArtifactoryInitialValues = {
  identifier: '',
  tag: '',
  tagRegex: '',
  artifactPath: '<+input>',
  tagType: TagTypes.Value,
  repository: '',
  artifactDirectory: ''
}

export const dockerArtifactoryInitialValues = {
  identifier: '',
  artifactPath: 'path',
  tag: '<+input>',
  tagType: TagTypes.Value,
  tagRegex: '',
  repository: 'repo',
  repositoryUrl: 'url',
  repositoryFormat: 'docker'
}
