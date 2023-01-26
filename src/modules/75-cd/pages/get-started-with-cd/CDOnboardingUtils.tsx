/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { set } from 'lodash-es'
import { customAlphabet } from 'nanoid'
import type { IconName } from '@harness/icons'
import { Connectors } from '@connectors/constants'
import { gitStoreTypes } from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { ManifestStores } from '@pipeline/components/ManifestSelection/ManifestInterface'
import type {
  ArtifactListConfig,
  ConnectorInfoDTO,
  ConnectorRequestBody,
  EnvironmentRequestDTO,
  EnvironmentResponseDTO,
  FileStoreNodeDTO,
  Infrastructure,
  InfrastructureRequestDTO,
  NGServiceV2InfoConfig,
  ServiceDefinition,
  ServiceRequestDTO,
  ServiceSpec,
  ServiceYamlV2,
  UserRepoResponse
} from 'services/cd-ng'
import type { TestStatus } from '@common/components/TestConnectionWidget/TestConnectionWidget'
import { StringUtils } from '@common/exports'
import type { IGitContextFormProps } from '@common/components/GitContextForm/GitContextForm'
import type { RestResponseDelegateSetupDetails } from 'services/portal'
import type { ArtifactType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import type { TextReferenceInterface } from '@secrets/components/TextReference/TextReference'
import type { SecretReferenceInterface } from '@secrets/utils/SecretField'
import type { UseSaveSuccessResponse } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import type { SelectAuthenticationMethodInterface } from './SelectInfrastructure/SelectAuthenticationMethod'
import type { SelectGitProviderInterface } from './ConfigureService/ManifestRepoTypes/SelectGitProvider'

export const DOCUMENT_URL = 'https://www.harness.io/technical-blog/deploy-in-5-minutes-with-a-delegate-first-approach'
export interface PipelineRefPayload {
  serviceRef: string
  environmentRef: string
  infraStructureRef: string
  deploymentType: string
}

export interface DelegateSuccessHandler {
  delegateCreated: boolean
  delegateInstalled?: boolean
  delegateYamlResponse?: RestResponseDelegateSetupDetails
}

export enum BinaryValue {
  YES = 'yes',
  NO = 'no'
}

export enum DrawerMode {
  Edit = 'EDIT',
  Preview = 'PREVIEW'
}

// FILE STORE
export const SAMPLE_MANIFEST_FOLDER = 'Sample Manifest Onboarding'
export const DEFAULT_PIPELINE_NAME = 'Sample Pipeline'
export const EMPTY_STRING = ''
export const ONBOARDING_PREFIX = 'onboarding'

const DEFAULT_STAGE_ID = 'Stage'
const DEFAULT_STAGE_TYPE = 'Deployment'

export const BinaryOptions = [
  { label: BinaryValue.YES, value: BinaryValue.YES },
  { label: BinaryValue.NO, value: BinaryValue.NO }
]
export interface ServiceData {
  workloadType: string
  artifactType: string
  gitValues: SelectGitProviderInterface
  gitConnectionStatus: TestStatus
  repoValues: UserRepoResponse
  gitopsEnabled: boolean
  manifestStoreType: ManifestStores
  connectorRef?: ConnectorInfoDTO & { gitDetails?: IGitContextFormProps }
  artifactToDeploy?: string
  artifactData?: ArtifactoryGenericFormInterface
  fileNodesData?: FileStoreNodeDTO[]
}

export interface RepoDataType {
  /**
   * Account Identifier for the Entity.
   */
  accountIdentifier?: string
  /**
   * Agent identifier for entity.
   */
  agentIdentifier?: string
  createdAt?: string
  hasRepo?: boolean
  identifier?: string
  lastModifiedAt?: string
  /**
   * Organization Identifier for the Entity.
   */
  orgIdentifier?: string
  /**
   * Project Identifier for the Entity.
   */
  projectIdentifier?: string
  repository?: RepositoriesRepository
  repositoryCredentialsId?: string
  stale?: boolean
}

export interface ArtifactoryGenericFormInterface {
  dockerRegistryUrl?: string
  authType?: string
  dockerProviderType?: string
  username?: TextReferenceInterface | void
  password?: SecretReferenceInterface | void
  name: string
  identifier: string
  connectivityMode: string
  delegateSelectors: string[]
  connectorResponse?: UseSaveSuccessResponse
}

export type ServiceDataType = NGServiceV2InfoConfig & { data: ServiceData }
export type InfrastructureDataType = InfrastructureRequestDTO & {
  infrastructureDefinition: Infrastructure
  data?: SelectAuthenticationMethodInterface
}

export const defaultManifestConfig = {
  manifest: {
    identifier: 'sample_manifest',
    spec: {
      store: {
        spec: {
          gitFetchType: 'Branch'
        }
      }
    },
    type: 'K8sManifest'
  }
}

export const defaultArtifactConfig = {
  primary: {
    identifier: 'sample_artifact',
    type: undefined,
    primaryArtifactRef: '<+input>',
    sources: [
      {
        identifier: 'sample_artifact',
        type: undefined,
        spec: {
          connectorRef: undefined,
          imagePath: 'harness/todolist-sample',
          tag: 'latest'
        }
      }
    ],
    spec: {
      connectorRef: undefined,
      imagePath: 'harness/todolist-sample',
      tag: 'latest'
    }
  }
} as ArtifactListConfig

export const newRepositoryData = {
  accountIdentifier: '',
  agentIdentifier: '',
  identifier: '',
  orgIdentifier: '',
  projectIdentifier: '',
  hasRepo: true,
  repository: {
    type: 'git'
  } as RepositoriesRepository
}
export interface RepositoriesRepository {
  connectionType?: string
  /**
   * EnableLFS specifies whether git-lfs support should be enabled for this repo. Only valid for Git repositories.
   */
  enableLfs?: boolean
  enableOCI?: boolean
  githubAppEnterpriseBaseUrl?: string
  githubAppID?: string
  githubAppInstallationID?: string
  githubAppPrivateKey?: string
  inheritedCreds?: boolean
  insecure?: boolean
  insecureIgnoreHostKey?: boolean
  name?: string
  password?: string
  project?: string
  proxy?: string
  repo?: string
  /**
   * SSHPrivateKey contains the PEM data for authenticating at the repo server. Only used with Git repos.
   */
  sshPrivateKey?: string
  tlsClientCertData?: string
  tlsClientCertKey?: string
  /**
   * Type specifies the type of the repo. Can be either "git" or "helm. "git" is assumed if empty or absent.
   */
  type?: string
  username?: string
}

export const newServiceState = {
  name: 'sample_service',
  identifier: '',
  description: '',
  tags: {},
  gitOpsEnabled: false,
  serviceDefinition: {
    type: 'Kubernetes' as ServiceDefinition['type'],
    spec: {
      manifests: [defaultManifestConfig],
      artifacts: defaultArtifactConfig
    } as ServiceSpec
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
  },

  connector: {
    name: 'K8s Cluster',
    description: '',
    projectIdentifier: '',
    orgIdentifier: '',
    identifier: 'K8s_Cluster',
    tags: {},
    type: 'K8sCluster',
    delegateType: 'InheritFromDelegate',
    spec: {
      delegateSelectors: [],
      credential: {
        type: 'InheritFromDelegate',
        spec: null
      }
    }
  }
}

export type EnvironmentEntities = {
  connector?: string
  delegate?: string
  environment?: string
  infrastructure?: string
  namespace?: string
}
export interface DelegateDataType {
  delegateType?: string
  delegateInstalled: boolean
  environmentEntities: EnvironmentEntities
  delegateYAMLResponse?: RestResponseDelegateSetupDetails
}
export const newDelegateState = {
  delegate: {
    delegateType: undefined,
    delegateInstalled: false,
    environmentEntities: {
      connector: '',
      delegate: '',
      environment: '',
      infrastructure: '',
      namespace: ''
    },
    delegateYAMLResponse: undefined
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
            service: { serviceRef: '' } as ServiceYamlV2,
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
                    type: 'K8sRollingDeploy',
                    name: 'Rolling Deployment',
                    identifier: 'Rolling_Deployment',
                    spec: { skipDryRun: false, pruningEnabled: false },
                    timeout: '10m'
                  }
                }
              ],
              rollbackSteps: []
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
  const UNIQUE_ENTITY_ID = new Date().getTime().toString()
  const newEntity = StringUtils.getIdentifierFromName(entity)
  return `${newEntity}_${UNIQUE_ENTITY_ID}`
}

export const generateDelegateName = (): string => {
  // should be lowercase and can include only dash(-) between letters and cannot start or end with a number
  const nanoUuid = customAlphabet('0123456789-abcdefghijklmnopqrstuvwxyz')
  return `dl-${nanoUuid()}-spl`
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
      executeOnDelegate: false,
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
  let updatedConnectorPayload: ConnectorRequestBody = {}
  updatedConnectorPayload = set(OAuthConnectorPayload, 'connector.name', `${gitProviderType} OAuth`)
  updatedConnectorPayload = set(
    OAuthConnectorPayload,
    'connector.identifier',
    `${gitProviderType}_OAuth_${new Date().getTime()}`
  )
  updatedConnectorPayload = set(OAuthConnectorPayload, 'connector.type', gitProviderType)
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

export const allowedArtifactTypesForOnboiarding: Record<string, Array<ArtifactType>> = {
  Kubernetes: [
    ENABLED_ARTIFACT_TYPES.DockerRegistry,
    ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry,
    ENABLED_ARTIFACT_TYPES.Ecr,
    ENABLED_ARTIFACT_TYPES.Acr
  ],
  NativeHelm: [
    ENABLED_ARTIFACT_TYPES.DockerRegistry,
    ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry,
    ENABLED_ARTIFACT_TYPES.Ecr,
    ENABLED_ARTIFACT_TYPES.Acr
  ]
}

export const ArtifactIconByType: Record<string, IconName> = {
  DockerRegistry: 'docker-step',
  ArtifactoryRegistry: 'service-artifactory',
  Ecr: 'ecr-step',
  Acr: 'service-azure'
}
