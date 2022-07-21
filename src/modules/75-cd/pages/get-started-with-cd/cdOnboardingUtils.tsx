import { defaultTo, get, set } from 'lodash-es'
import { Connectors } from '@connectors/constants'
import { gitStoreTypes } from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { ManifestStores } from '@pipeline/components/ManifestSelection/ManifestInterface'
import type {
  ConnectorInfoDTO,
  ConnectorRequestBody,
  EnvironmentRequestDTO,
  EnvironmentResponseDTO,
  ServiceDefinition,
  ServiceRequestDTO
} from 'services/cd-ng'
import { AuthTypes } from '@connectors/pages/connectors/utils/ConnectorHelper'
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

export const newServiceState = {
  service: {
    name: 'sample_service',
    identifier: 'sample_service',
    description: '',
    tags: {},
    gitOpsEnabled: false,
    serviceDefinition: {
      type: '' as ServiceDefinition['type'],
      spec: {}
    },
    data: {}
  }
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
    type: '', //infraType
    environmentRef: '',
    infrastructureDefinition: {
      spec: {
        connectorRef: '',
        namespace: '',
        releaseName: 'release-<+INFRA_KEY>'
      }
    },
    data: {}
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

export const defaultInitialAuthFormData = (infrastructureData: any): SelectAuthenticationMethodInterface => {
  const initialAuthValues = {
    authType: AuthTypes.USER_PASSWORD,
    delegateType: defaultTo(get(infrastructureData, 'data.connectorAuthValues.delegateType'), ''),
    masterUrl: defaultTo(get(infrastructureData, 'data.connectorAuthValues.masterUrl'), ''),
    username: defaultTo(get(infrastructureData, 'data.connectorAuthValues.username'), ''),
    password: defaultTo(get(infrastructureData, 'data.connectorAuthValues.password'), undefined),
    serviceAccountToken: defaultTo(get(infrastructureData, 'data.connectorAuthValues.serviceAccountToken'), undefined),
    oidcIssuerUrl: defaultTo(get(infrastructureData, 'data.connectorAuthValues.oidcIssueUrl'), ''),
    oidcUsername: defaultTo(get(infrastructureData, 'data.connectorAuthValues.oidcIssueUsername'), undefined),
    oidcPassword: defaultTo(get(infrastructureData, 'data.connectorAuthValues.oidcPassword'), undefined),
    oidcCleintId: defaultTo(get(infrastructureData, 'data.connectorAuthValues.oidcCleintId'), undefined),
    oidcCleintSecret: defaultTo(get(infrastructureData, 'data.connectorAuthValues.oidcCleintSecret'), undefined),
    oidcScopes: defaultTo(get(infrastructureData, 'data.connectorAuthValues.oidcScopes'), ''),
    clientKey: defaultTo(get(infrastructureData, 'data.connectorAuthValues.clientKey'), undefined),
    clientKeyCertificate: defaultTo(
      get(infrastructureData, 'data.connectorAuthValues.clientKeyCertificate'),
      undefined
    ),
    clientKeyPassphrase: undefined,
    clientKeyAlgo: defaultTo(get(infrastructureData, 'data.connectorAuthValues.clientKeyAlgo'), ''),
    clientKeyCACertificate: undefined,
    connectorName: defaultTo(get(infrastructureData, 'infrastructure.infrastructureDefinition.spec.connectorRef'), ''),
    connectorIdentifier: defaultTo(
      get(infrastructureData, 'infrastructure.infrastructureDefinition.spec.connectorIdentifier'),
      ''
    ),
    delegateSelectors: []
  }
  return initialAuthValues
}
