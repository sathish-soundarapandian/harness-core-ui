/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { set } from 'lodash-es'
import { Connectors } from '@connectors/constants'
import { gitStoreTypes } from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { ManifestStores } from '@pipeline/components/ManifestSelection/ManifestInterface'
import type {
  ConnectorInfoDTO,
  ConnectorRequestBody,
  EnvironmentRequestDTO,
  EnvironmentResponseDTO,
  Infrastructure,
  InfrastructureRequestDTO,
  NGServiceV2InfoConfig,
  ServiceDefinition,
  ServiceRequestDTO,
  UserRepoResponse
} from 'services/cd-ng'
import type { TestStatus } from '@common/components/TestConnectionWidget/TestConnectionWidget'
import type { SelectGitProviderInterface } from './SelectArtifact/SelectGitProvider'
import type { SelectAuthenticationMethodInterface } from './SelectInfrastructure/SelectAuthenticationMethod'

export interface PipelineRefPayload {
  serviceRef: string
  environmentRef: string
  infraStructureRef: string
  deploymentType: string
}

export const DefaultNewStageName = 'Stage Name'
export const DefaultNewStageId = 'stage_id'
export const DefaultNewServiceId = '-1'

const DEFAULT_STAGE_ID = 'Stage'
const DEFAULT_STAGE_TYPE = 'Deployment'

export interface ServiceData {
  workloadType: string
  artifactType: string
  gitValues: SelectGitProviderInterface
  gitConnectionStatus: TestStatus
  repoValues: UserRepoResponse
}

export type ServiceDataType = NGServiceV2InfoConfig & { data: ServiceData }
export type InfrastructureDataType = InfrastructureRequestDTO & {
  infrastructureDefinition: Infrastructure
  data?: SelectAuthenticationMethodInterface
}

export const newServiceState = {
  name: 'sample_service',
  identifier: 'sample_service',
  description: '',
  tags: {},
  gitOpsEnabled: false,
  serviceDefinition: {
    type: '' as ServiceDefinition['type'],
    spec: {}
  },
  data: {} as ServiceData
}

export const newEnvironmentState = {
  environment: {
    name: 'sample_environment',
    identifier: 'sample_environment',
    description: '',
    tags: {},
    type: 'PreProduction' as 'PreProduction' | 'Production'
  },
  infrastructure: {
    name: 'sample_infrastructure',
    identifier: 'sample_infrastructure',
    description: '',
    tags: {},
    type: '' as InfrastructureRequestDTO['type'],
    environmentRef: '',
    infrastructureDefinition: {
      spec: {
        connectorRef: '',
        namespace: '',
        releaseName: 'release-<+INFRA_KEY>'
      },
      type: '' as InfrastructureRequestDTO['type']
    },
    data: {} as SelectAuthenticationMethodInterface
  }
}

export const DEFAULT_PIPELINE_PAYLOAD = {
  pipeline: {
    name: '',
    identifier: '',
    projectIdentifier: '',
    orgIdentifier: '',
    tags: {},
    stages: [
      {
        stage: {
          name: DEFAULT_STAGE_ID,
          identifier: DEFAULT_STAGE_ID,
          description: '',
          type: DEFAULT_STAGE_TYPE,
          spec: {
            deploymentType: '',
            service: { serviceRef: '' },
            environment: {
              environmentRef: '',
              deployToAll: false,
              infrastructureDefinitions: [{ identifier: '' }]
            },
            execution: {
              steps: [
                {
                  step: {
                    type: 'ShellScript',
                    name: 'Echo Welcome Message',
                    identifier: 'shell_ID',
                    spec: {
                      shell: 'Bash',
                      onDelegate: true,
                      source: { type: 'Inline', spec: { script: 'echo "Welcome to Harness CD" ' } },
                      environmentVariables: [],
                      outputVariables: [],
                      executionTarget: {}
                    }
                  }
                },
                {
                  step: {
                    type: 'K8sRollingRollback',
                    name: 'Rolling Rollback',
                    identifier: 'Rolling_Rollback',
                    spec: { skipDryRun: false },
                    timeout: '10m'
                  }
                }
              ]
            }
          },
          tags: {},
          failureStrategies: [
            {
              onFailure: {
                errors: ['AllErrors'],
                action: {
                  type: 'StageRollback'
                }
              }
            }
          ]
        }
      }
    ]
  }
}

export const cleanServiceDataUtil = (values: ServiceRequestDTO): ServiceRequestDTO => {
  const newDescription = values.description?.toString().trim()
  const newId = values.identifier?.toString().trim()
  const newName = values.name?.toString().trim()
  return {
    name: newName,
    identifier: newId,
    orgIdentifier: values.orgIdentifier,
    projectIdentifier: values.projectIdentifier,
    description: newDescription,
    tags: values.tags
  }
}

export const cleanEnvironmentDataUtil = (values: EnvironmentResponseDTO): EnvironmentRequestDTO => {
  const newDescription = values.description?.toString().trim()
  const newId = values.identifier?.toString().trim()
  const newName = values.name?.toString().trim()
  const newType = values.type?.toString().trim()

  return {
    name: newName,
    identifier: newId,
    orgIdentifier: values.orgIdentifier,
    projectIdentifier: values.projectIdentifier,
    description: newDescription,
    tags: values.tags,
    type: newType as 'PreProduction' | 'Production'
  }
}

export const getUniqueEntityIdentifier = (entity = ''): string => {
  const UNIQUE_PIPELINE_ID = new Date().getTime().toString()
  return `${entity.replace(/-/g, '_')}_${UNIQUE_PIPELINE_ID}`
}

export const getStoreType = (gitProviderType?: ConnectorInfoDTO['type']): ManifestStores | undefined => {
  return gitStoreTypes.find(store => {
    return store.toLowerCase() === gitProviderType?.toLowerCase()
  })
}

const OAuthConnectorPayload: ConnectorRequestBody = {
  connector: {
    name: '',
    identifier: '',
    type: 'Github',
    spec: {
      authentication: {
        type: 'Http',
        spec: {
          type: 'OAuth',
          spec: {
            tokenRef: ''
          }
        }
      },
      apiAccess: {
        type: 'OAuth',
        spec: {
          tokenRef: ''
        }
      },
      executeOnDelegate: true,
      type: 'Account'
    }
  }
}

export const getOAuthConnectorPayload = ({
  tokenRef,
  refreshTokenRef,
  gitProviderType
}: {
  tokenRef: string
  refreshTokenRef?: string
  gitProviderType?: ConnectorInfoDTO['type']
}): ConnectorRequestBody => {
  /*istanbul ignore next */
  let updatedConnectorPayload: ConnectorRequestBody = {}
  /*istanbul ignore next */
  updatedConnectorPayload = set(OAuthConnectorPayload, 'connector.name', `${gitProviderType} OAuth`)
  /*istanbul ignore next */
  updatedConnectorPayload = set(
    OAuthConnectorPayload,
    'connector.identifier',
    `${gitProviderType}_OAuth_${new Date().getTime()}`
  )
  /*istanbul ignore next */
  updatedConnectorPayload = set(OAuthConnectorPayload, 'connector.type', gitProviderType)
  /*istanbul ignore next */
  switch (gitProviderType) {
    case Connectors.GITHUB:
      updatedConnectorPayload = set(OAuthConnectorPayload, 'connector.spec.authentication.spec.spec', { tokenRef })
      updatedConnectorPayload = set(OAuthConnectorPayload, 'connector.spec.apiAccess.spec', { tokenRef })
      return updatedConnectorPayload
    case Connectors.GITLAB:
    case Connectors.BITBUCKET:
      updatedConnectorPayload = set(OAuthConnectorPayload, 'connector.spec.authentication.spec.spec', {
        tokenRef,
        refreshTokenRef
      })
      updatedConnectorPayload = set(OAuthConnectorPayload, 'connector.spec.apiAccess.spec', {
        tokenRef,
        refreshTokenRef
      })
      return updatedConnectorPayload
    default:
      return updatedConnectorPayload
  }
}
