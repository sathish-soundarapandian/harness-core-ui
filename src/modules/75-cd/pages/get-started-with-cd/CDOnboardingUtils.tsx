/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, set } from 'lodash-es'
import { customAlphabet } from 'nanoid'
import type { IconName } from '@harness/icons'
import { AllowedTypesWithRunTime, MultiTypeInputType, SelectOption } from '@harness/uicore'
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
import { CIBuildInfrastructureType } from '@pipeline/utils/constants'
import type {
  ApplicationsApplication,
  ApplicationsApplicationSyncRequest,
  ApplicationsRetryStrategy,
  ApplicationsSyncPolicyAutomated,
  RepositoriesRepoAppDetailsResponse,
  Servicev1Application
} from 'services/gitops'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import type { SelectAuthenticationMethodInterface } from './SelectInfrastructure/SelectAuthenticationMethod'
import type { SelectGitProviderInterface } from './ConfigureService/ManifestRepoTypes/SelectGitProvider'
import { CREDENTIALS_TYPE } from './ConfigureGitops/AuthTypeForm'

type ResourceStringType = 'group' | 'kind' | 'namespace' | 'name'
export type Resource = Partial<Record<ResourceStringType, string>>
export const DOCUMENT_URL = 'https://www.harness.io/technical-blog/deploy-in-5-minutes-with-a-delegate-first-approach'
export interface PipelineRefPayload {
  serviceRef: string
  environmentRef: string
  infraStructureRef: string
  deploymentType: string
}

export enum Scope {
  PROJECT = 'project',
  ORG = 'org',
  ACCOUNT = 'account'
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

export enum DeploymentType {
  K8s = 'K8s',
  GitOps = 'GitOps'
}

export const ALLOWABLE_TYPES = [MultiTypeInputType.FIXED] as AllowedTypesWithRunTime[]

// FILE STORE
export const SAMPLE_MANIFEST_FOLDER = 'Sample Manifest Onboarding'
export const DEFAULT_PIPELINE_NAME = 'Sample Pipeline'
export const EMPTY_STRING = ''
export const ONBOARDING_PREFIX = 'onboarding'
export const DEFAULT_SAMPLE_REPO = 'https://github.com/harness-apps/hosted-gitops-example-apps'
// export const DEFAULT_SAMPLE_REPO = 'https://github.com/argoproj/argoproj-deployments'

const DEFAULT_STAGE_ID = 'Stage'
const DEFAULT_STAGE_TYPE = 'Deployment'

export const SAMPLE_ARTIFACT_NAME = 'sample_artifact_source'
export const SAMPLE_DOCKER_CONNECTOR_NAME = 'sample_docker_connector'

export enum CustomType {
  Custom = 'Custom'
}

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
  accountIdentifier?: string
  agentIdentifier?: string
  createdAt?: string
  hasRepo?: boolean
  identifier?: string
  lastModifiedAt?: string
  orgIdentifier?: string
  projectIdentifier?: string
  repository?: RepositoryInterface
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

export interface SyncOptions {
  Validate?: boolean
  CreateNamespace?: boolean
  pruneLast?: boolean
  applyOutofSyncOnly?: boolean
  Replace?: boolean
  PrunePropagationPolicy?: 'background' | 'foreground' | 'orphan'
}

export interface FormValues {
  applyOnly: boolean
  force: boolean
  prune: boolean
  dryRun: boolean
  spec?: {
    syncPolicy?: {
      automated?: ApplicationsSyncPolicyAutomated
      retry?: ApplicationsRetryStrategy
      syncOptions?: SyncOptions
    }
  }
  retryCheckbox: boolean
  revision: string
  revisionType: 'branch' | 'tags'
  resources: Record<string, boolean>
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

export enum RevisionType {
  Branch = 'Branch',
  Tags = 'Tags'
}

export enum SourceCodeType {
  PROVIDE_MY_OWN = 'provideMyOwn',
  USE_SAMPLE = 'useSample'
}

export const revisionTypeArray: SelectOption[] = [
  {
    label: RevisionType.Branch,
    value: RevisionType.Branch
  },
  {
    label: RevisionType.Tags,
    value: RevisionType.Tags
  }
]

export interface RepositoriesRepository {
  connectionType?: string
  authType?: string
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

export type RepositoryInterface = RepositoriesRepository & {
  targetRevision?: string
  revisionType?: RevisionType
  path?: string
  sourceCodeType?: string
  isNewRepository?: boolean
  identifier?: string
}

export interface configInterface {
  password?: string
  username?: string
  tlsClientConfig?: { insecure?: boolean; certData?: string; keyData?: string }
  clusterConnectionType?: string
  bearerToken?: string
}

export interface ClusterInterface {
  bearerToken?: string
  username?: string
  password?: string
  agent?: string
  scope?: string
  repo?: string
  clusterType?: CIBuildInfrastructureType
  authType?: string
  clusterResources?: boolean
  certData?: string
  keyData?: string
  config?: configInterface
  name?: string
  identifier?: string
  namespaces?: string[]
  project?: string
  server?: string
  isNewCluster?: boolean
  serverVersion?: string
}

export interface APIError extends Error {
  data: {
    message: string
    error?: string
  }
}

export const newRepositoryData = {
  targetRevision: '',
  revisionType: RevisionType.Branch,
  path: '',
  repo: DEFAULT_SAMPLE_REPO,
  sourceCodeType: SourceCodeType.USE_SAMPLE,
  type: 'git',
  identifier: '',
  isNewRepository: false
} as RepositoryInterface

export const intialClusterData = {
  name: '',
  server: '',
  authType: CREDENTIALS_TYPE.USERNAME_PASSWORD,
  repo: '',
  bearerToken: '',
  certData: '',
  keyData: '',
  tags: {},
  identifier: '',
  agent: '',
  scope: '',
  clusterType: CIBuildInfrastructureType.Cloud,
  isNewCluster: false
} as ClusterInterface

export const initialApplicationData = {
  accountIdentifier: '',
  orgIdentifier: '',
  projectIdentifier: '',
  agentIdentifier: '',
  name: '',
  clusterIdentifier: '',
  repoIdentifier: '',
  app: {
    metadata: {
      name: '',
      namespace: '',
      uid: '',
      resourceVersion: '',
      generation: '',
      creationTimestamp: '',
      managedFields: []
    },
    spec: {
      source: {
        repoURL: '',
        path: '',
        targetRevision: ''
      },
      destination: {
        server: ''
      },
      project: ''
    },
    status: {
      sync: {
        comparedTo: {
          source: {},
          destination: {}
        }
      },
      health: {},
      summary: {}
    }
  }
} as Servicev1Application

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
    identifier: '',
    description: '',
    tags: {},
    type: 'PreProduction' as 'PreProduction' | 'Production'
  },
  infrastructure: {
    name: 'sample_infrastructure',
    identifier: '',
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
    identifier: '',
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
  delegateIdentifier?: string
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

export const SUBMIT_HANDLER_MAP_FOR_CLUSTER = {
  [CREDENTIALS_TYPE.USERNAME_PASSWORD]: (data: ClusterInterface): ClusterInterface | undefined => {
    const { config, server, name, namespaces, project } = data
    if (!config?.password || !config?.username || !server) {
      return
    }
    let clusterPayload: ClusterInterface = {
      config: {
        password: config?.password,
        username: config?.username,
        tlsClientConfig: { insecure: true },
        clusterConnectionType: 'USERNAME_PASSWORD'
      },
      server,
      name,
      namespaces,
      project
    }

    clusterPayload = { ...clusterPayload }
    return clusterPayload
  },
  [CREDENTIALS_TYPE.CLIENT_KEY_CERTIFICATE]: (data: ClusterInterface): ClusterInterface | undefined => {
    const { namespaces, server, name, certData, keyData, project } = data
    if (!certData || !keyData || !server) {
      return
    }
    let clusterPayload: ClusterInterface = {
      namespaces,
      project,
      config: {
        tlsClientConfig: {
          certData,
          keyData
        },
        clusterConnectionType: 'CLIENT_KEY_CERTIFICATE'
      },
      server,
      name
    }

    clusterPayload = { ...clusterPayload }
    return clusterPayload
  },
  [CREDENTIALS_TYPE.SERVICE_ACCOUNT]: (data: ClusterInterface): ClusterInterface | undefined => {
    const { namespaces, server, name, bearerToken, project } = data
    if (!bearerToken || !server) {
      return
    }
    let clusterPayload: ClusterInterface = {
      namespaces,
      project,
      config: {
        bearerToken,
        tlsClientConfig: { insecure: true },
        clusterConnectionType: 'SERVICE_ACCOUNT'
      },
      server,
      name
    }
    clusterPayload = { ...clusterPayload }
    return clusterPayload
  }
}

export interface PayloadInterface {
  repositoryData?: RepositoryInterface
  clusterData?: ClusterInterface
  name?: string
  appDetails?: RepositoriesRepoAppDetailsResponse
}

export enum ParameterType {
  Directory = 'Directory',
  Helm = 'Helm',
  Kustomize = 'Kustomize',
  Ksonnet = 'Ksonnet'
}

export const getAppPayload = (props: PayloadInterface) => {
  const { repositoryData, clusterData, name, appDetails } = props
  const imagesArr = defaultTo(appDetails?.kustomize?.images, [])
  const helmParameters: string[] = []
  const helmValueFiles: string[] = appDetails?.helm?.valueFiles || []

  const payload: any = {
    application: {
      kind: 'Application',
      apiVersion: 'argoproj.io/v1alpha1',
      metadata: {
        annotations: {},
        labels: {},
        name
      },
      spec: {
        syncPolicy: {
          syncOptions: [
            'PrunePropagationPolicy=undefined',
            'CreateNamespace=false',
            'Validate=false',
            'skipSchemaValidations=false',
            'autoCreateNamespace=false',
            'pruneLast=false',
            'applyOutofSyncOnly=false',
            'Replace=false',
            'retry=false'
          ]
        },
        source: {
          repoURLType: repositoryData?.type,
          revisionType: repositoryData?.revisionType,
          targetRevision: repositoryData?.targetRevision,
          repoURL: repositoryData?.repo,
          path: repositoryData?.path,
          kustomize: {
            images: imagesArr
          },
          helm: {
            valueFiles: helmValueFiles,
            parameters: helmParameters
          },
          repoId: repositoryData?.identifier
        },
        destination: {
          namespace: 'default',
          server: clusterData?.server
        }
      }
    }
  }

  if (appDetails?.type === ParameterType.Directory) {
    delete payload.application.spec.source.helm
  }
  if (appDetails?.type === ParameterType.Helm) {
    delete payload.application.spec.source.directory
    delete payload.application.spec.source.kustomize
  }
  if (appDetails?.type === ParameterType.Kustomize) {
    delete payload.application.spec.source.directory
    delete payload.application.spec.source.helm
  }
  return payload
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
    orgIdentifier: '',
    projectIdentifier: '',
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

export function getFullAgentWithScope(agent: string, scope?: Scope): string {
  return scope === Scope.PROJECT || !scope ? agent : `${scope}.${agent}`
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
  const connectorName = `${gitProviderType}_${ONBOARDING_PREFIX}`
  updatedConnectorPayload = set(OAuthConnectorPayload, 'connector.name', connectorName)
  updatedConnectorPayload = set(
    OAuthConnectorPayload,
    'connector.identifier',
    `${StringUtils.getIdentifierFromName(connectorName)}`
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

export const allowedArtifactTypesForOnboarding: Record<string, Array<ArtifactType>> = {
  Kubernetes: [ENABLED_ARTIFACT_TYPES.DockerRegistry, ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry],
  NativeHelm: [ENABLED_ARTIFACT_TYPES.DockerRegistry, ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry]
}

export const ArtifactIconByType: Record<string, IconName> = {
  DockerRegistry: 'docker-step',
  ArtifactoryRegistry: 'service-artifactory',
  Ecr: 'ecr-step',
  Acr: 'service-azure'
}

export const sampleRepositorySourceSteps = [
  'cd.getStartedWithCD.sampleRule1',
  'cd.getStartedWithCD.sampleRule2',
  'cd.getStartedWithCD.sampleRule3',
  'cd.getStartedWithCD.sampleRule4',
  'cd.getStartedWithCD.sampleRule5'
]

export enum SyncStatus {
  Unknown = 'Unknown',
  Synced = 'Synced',
  OutOfSync = 'OutOfSync'
}

export const resourceStatusSortOrder = {
  [SyncStatus.OutOfSync]: 1,
  [SyncStatus.Unknown]: 2,
  [SyncStatus.Synced]: 3
}

export function getResourceKey(resource: Resource): string {
  return [
    defaultTo(resource.group, ''),
    defaultTo(resource.kind, ''),
    defaultTo(resource.namespace, ''),
    defaultTo(resource.name, '')
  ]
    .join('/')
    .replace('//', '/')
}

export const getApplicationPayloadForSync = (
  data: ApplicationsApplication | null,
  resources: string[],
  revision: string
): FormValues => {
  const rawSyncOptions = data?.spec?.syncPolicy?.syncOptions
  const parsedSyncOptions: Record<string, any> = {} // eslint-disable-line @typescript-eslint/no-explicit-any
  const syncOptions: SyncOptions = {}

  if (rawSyncOptions && Object.keys(rawSyncOptions).length) {
    for (const syncOption of rawSyncOptions) {
      const [key, value] = syncOption.split('=')
      parsedSyncOptions[key] = key === 'PrunePropagationPolicy' ? value : value === 'true'
    }
  }

  ;(Object.keys(parsedSyncOptions) as Array<keyof SyncOptions>).forEach(syncOptionKey => {
    syncOptions[syncOptionKey] = parsedSyncOptions[syncOptionKey]
  })

  return {
    prune: false,
    dryRun: false,
    applyOnly: false,
    force: false,
    spec: {
      syncPolicy: {
        ...data?.spec?.syncPolicy,
        syncOptions: {
          ...syncOptions
        }
      }
    },
    retryCheckbox: !!Object.keys(data?.spec?.syncPolicy?.retry || {}).length,
    revision,
    revisionType: 'branch',
    resources: resources.reduce((acc, key) => ({ ...acc, [key]: true }), {})
  }
}

export function getSyncBody(formData: FormValues, sortedResources: any, data: ApplicationsApplication): any {
  const body: ApplicationsApplicationSyncRequest = {
    name: data?.metadata?.name,
    revision: formData.revision,
    dryRun: false,
    prune: false
  }

  const ensureSyncOptionsItems = (): void => {
    if (!Array.isArray(body.syncOptions?.items)) {
      set(body, 'syncOptions.items', [])
    }
  }

  if (formData.applyOnly && formData.force) {
    set(body, 'strategy.apply.force', true)
  } else if (formData.applyOnly) {
    set(body, 'strategy.apply.force', false)
  } else if (formData.force) {
    set(body, 'strategy.hook.force', true)
  } else {
    set(body, 'strategy.hook.force', false)
  }

  if (formData.dryRun) {
    body.dryRun = true
  }

  if (formData.prune) {
    body.prune = true
  }

  if (formData.spec?.syncPolicy?.syncOptions?.Validate) {
    ensureSyncOptionsItems()
    body.syncOptions?.items?.push('Validate=false')
  }

  if (formData.spec?.syncPolicy?.syncOptions?.CreateNamespace) {
    ensureSyncOptionsItems()
    body.syncOptions?.items?.push('CreateNamespace=true')
  }

  if (formData.spec?.syncPolicy?.syncOptions?.pruneLast) {
    ensureSyncOptionsItems()
    body.syncOptions?.items?.push('pruneLast=true')
  }

  if (formData.spec?.syncPolicy?.syncOptions?.applyOutofSyncOnly) {
    ensureSyncOptionsItems()
    body.syncOptions?.items?.push('ApplyOutOfSyncOnly=true')
  }

  if (formData.spec?.syncPolicy?.syncOptions?.PrunePropagationPolicy) {
    ensureSyncOptionsItems()
    body.syncOptions?.items?.push(
      `PrunePropagationPolicy=${formData.spec?.syncPolicy?.syncOptions?.PrunePropagationPolicy}`
    )
  }

  if (formData.spec?.syncPolicy?.syncOptions?.Replace) {
    ensureSyncOptionsItems()
    body.syncOptions?.items?.push('Replace=true')
  }

  if (formData.resources) {
    const allSelected = Object.values(formData.resources).every(v => v)

    if (!allSelected) {
      body.resources = Object.entries(formData.resources)
        .filter(([_key, value]) => value)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .map(([key]) => sortedResources.get(key)!)
    }
  }

  if (formData.retryCheckbox && formData.spec?.syncPolicy?.retry) {
    body.retryStrategy = { ...formData.spec.syncPolicy.retry }
  }

  return body
}

export const getTelemetryDeploymentType = (selectedDeploymentType?: string): DeploymentType => {
  return selectedDeploymentType === ServiceDeploymentType.KubernetesGitops ? DeploymentType.GitOps : DeploymentType.K8s
}

export type AccordionStatus = 'open' | 'close' | null
export const getDerivedStateForAccordions = (
  activeIds: string[],
  prevActiveIds: string[]
): { k8sStatus: AccordionStatus; delegateStatus: AccordionStatus } => {
  const hasK8sInCurrent = activeIds.includes('k8sCluster')
  const hasDelegateInCurrent = activeIds.includes('delegateInfo')
  const hasK8sInPrev = prevActiveIds.includes('k8sCluster')
  const hasDelegateInPrev = prevActiveIds.includes('delegateInfo')
  let k8sStatus: AccordionStatus = null
  let delegateStatus: AccordionStatus = null
  if (hasK8sInPrev && !hasK8sInCurrent) {
    k8sStatus = 'close'
  }
  if (hasK8sInCurrent && !hasK8sInPrev) {
    k8sStatus = 'open'
  }

  if (hasDelegateInPrev && !hasDelegateInCurrent) {
    delegateStatus = 'close'
  }
  if (hasDelegateInCurrent && !hasDelegateInPrev) {
    delegateStatus = 'open'
  }

  return { k8sStatus, delegateStatus }
}
