/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import moment from 'moment'
import { Layout, Text, Icon, IconName, Card } from '@harness/uicore'
import { Color } from '@harness/design-system'

import type {
  ConnectorInfoDTO,
  VaultConnectorDTO,
  AwsKmsConnectorDTO,
  AwsSecretManagerDTO,
  AzureKeyVaultConnectorDTO,
  GcpKmsConnectorDTO
} from 'services/cd-ng'
import { useStrings, UseStringsReturn } from 'framework/strings'
import type { StringKeys } from 'framework/strings'
import { StringUtils } from '@common/exports'
import type { TagsInterface } from '@common/interfaces/ConnectorsInterface'
import TagsRenderer from '@common/components/TagsRenderer/TagsRenderer'
import { DelegateTypes } from '@common/components/ConnectivityMode/ConnectivityMode'
import { Connectors } from '@connectors/constants'
import { HashiCorpVaultAccessTypes } from '@connectors/interfaces/ConnectorInterface'
import { accessTypeOptionsMap } from '@connectors/components/CreateConnector/HashiCorpVault/views/VaultConnectorFormFields'
import {
  BackOffStrategy,
  backoffStrategyTypeLabelMapping,
  getLabelForAuthType,
  GitAuthTypes,
  IBackoffStrategyTypeLabelMapping
} from '../../utils/ConnectorHelper'
import { AzureSecretKeyType } from '../../utils/ConnectorUtils'
import css from './SavedConnectorDetails.module.scss'

interface SavedConnectorDetailsProps {
  connector: ConnectorInfoDTO
}
interface ActivityDetailsRowInterface {
  label: string
  value: string | TagsInterface | number | boolean | null | undefined
  iconData?: {
    textId: StringKeys
    icon: IconName
    color?: string
  }
}

interface RenderDetailsSectionProps {
  title: string
  data: Array<ActivityDetailsRowInterface>
}

interface ActivityDetailsData {
  createdAt: number
  lastTested: number
  lastUpdated: number
  lastConnectionSuccess?: number
  status: string | null
}

enum YesOrNo {
  YES = 'Yes',
  NO = 'No'
}

const getLabelByType = (type: string): string => {
  switch (type) {
    case Connectors.KUBERNETES_CLUSTER:
      return 'connectors.name_labels.Kubernetes'
    case Connectors.HttpHelmRepo:
      return 'connectors.name_labels.HttpHelmRepo'
    case Connectors.OciHelmRepo:
      return 'connectors.name_labels.OCIHelm'
    case Connectors.GIT:
      return 'connectors.name_labels.Git'
    case Connectors.GITHUB:
      return 'connectors.name_labels.Github'
    case Connectors.GITLAB:
      return 'connectors.name_labels.Gitlab'
    case Connectors.BITBUCKET:
      return 'connectors.name_labels.Bitbucket'
    case Connectors.DOCKER:
      return 'connectors.name_labels.Docker'
    case Connectors.GCP:
      return 'connectors.name_labels.GCP'
    case Connectors.PDC:
      return 'connectors.name_labels.PDC'
    case Connectors.AWS:
      return 'connectors.name_labels.AWS'
    case Connectors.AWS_CODECOMMIT:
      return 'connectors.name_labels.AwsCodeCommit'
    case Connectors.NEXUS:
      return 'connectors.name_labels.Nexus'
    case Connectors.ARTIFACTORY:
      return 'connectors.name_labels.Artifactory'
    case Connectors.APP_DYNAMICS:
      return 'connectors.name_labels.AppDynamics'
    case Connectors.SPLUNK:
      return 'connectors.name_labels.Splunk'
    case Connectors.Jira:
      return 'connectors.title.jira'
    case Connectors.SERVICE_NOW:
      return 'connectors.title.serviceNow'
    case Connectors.GCP_KMS:
      return 'connectors.name_labels.gcpKms'
    case Connectors.CUSTOM_SECRET_MANAGER:
      return 'connectors.title.customSecretManager'
    case Connectors.VAULT:
    case Connectors.LOCAL:
      return 'connectors.name_labels.SecretManager'
    case Connectors.SPOT:
      return 'connectors.name_labels.Spot'
    case Connectors.TAS:
      return 'connectors.name_labels.TAS'
    case Connectors.TERRAFORM_CLOUD:
      return 'connectors.name_labels.Terraform'
    default:
      return 'connector'
  }
}

const getKubernetesSchema = (connector: ConnectorInfoDTO): Array<ActivityDetailsRowInterface> => {
  return [
    {
      label: 'connectionMode',
      value: connector?.spec?.credential?.type
    },
    {
      label: 'connectors.k8.masterUrlLabel',
      value: connector?.spec?.credential?.spec?.masterUrl
    },
    {
      label: 'credType',
      value: getLabelForAuthType(connector?.spec?.credential?.spec?.auth?.type)
    },
    {
      label: 'username',
      value:
        connector?.spec?.credential?.spec?.auth?.spec?.username ||
        connector?.spec?.credential?.spec?.auth?.spec?.usernameRef
    },
    {
      label: 'password',
      value: connector?.spec?.credential?.spec?.auth?.spec?.passwordRef
    },
    {
      label: 'connectors.k8.serviceAccountToken',
      value: connector?.spec?.credential?.spec?.auth?.spec?.serviceAccountTokenRef
    },
    {
      label: 'connectors.k8.OIDCUsername',
      value: connector?.spec?.credential?.spec?.auth?.spec?.oidcUsername
    },
    {
      label: 'connectors.k8.OIDCPassword',
      value: connector?.spec?.credential?.spec?.auth?.spec?.oidcPasswordRef
    },
    {
      label: 'connectors.k8.OIDCIssuerUrl',
      value: connector?.spec?.credential?.spec?.auth?.spec?.oidcIssuerUrl
    },
    {
      label: 'connectors.k8.OIDCClientId',
      value: connector?.spec?.credential?.spec?.auth?.spec?.oidcClientIdRef
    },
    {
      label: 'connectors.k8.OIDCSecret',
      value: connector?.spec?.credential?.spec?.auth?.spec?.oidcSecretRef
    },
    {
      label: 'connectors.k8.OIDCScopes',
      value: connector?.spec?.credential?.spec?.auth?.spec?.oidcScopes
    },

    {
      label: 'connectors.k8.clientKey',
      value: connector?.spec?.credential?.spec?.auth?.spec?.clientKeyRef
    },
    {
      label: 'connectors.k8.clientCertificate',
      value: connector?.spec?.credential?.spec?.auth?.spec?.clientCertRef
    },
    {
      label: 'connectors.k8.clientKeyPassphrase',
      value: connector?.spec?.credential?.spec?.auth?.spec?.clientKeyPassphraseRef
    },
    {
      label: 'connectors.k8.clientKeyAlgorithm',
      value: connector?.spec?.credential?.spec?.auth?.spec?.clientKeyAlgo
    },
    {
      label: 'connectors.k8.clientKeyCACertificate',
      value: connector?.spec?.credential?.spec?.auth?.spec?.caCertRef
    }
  ]
}

const getGitSchema = (connector: ConnectorInfoDTO): Array<ActivityDetailsRowInterface> => {
  return [
    {
      label: 'common.git.urlType',
      value: connector?.spec?.connectionType
    },
    {
      label: 'common.git.connectionType',
      value: connector.spec?.type?.toUpperCase?.()
    },
    {
      label: 'UrlLabel',
      value: connector?.spec?.url
    },
    {
      label: 'username',
      value: connector?.spec?.spec?.username || connector?.spec?.spec?.usernameRef
    },
    {
      label: 'password',
      value: connector?.spec?.spec?.passwordRef
    },
    {
      label: 'SSH_KEY',
      value: connector?.spec?.spec?.sshKeyRef
    }
  ]
}

const getGithubSchema = (connector: ConnectorInfoDTO): Array<ActivityDetailsRowInterface> => {
  return [
    {
      label: 'common.git.urlType',
      value: connector?.spec?.type
    },
    {
      label: 'common.git.connectionType',
      value: connector?.spec?.authentication?.type?.toUpperCase?.()
    },
    {
      label: 'UrlLabel',
      value: connector?.spec?.url
    },
    {
      label: 'authentication',
      value: connector?.spec?.authentication?.spec?.type
    },
    {
      label: 'username',
      value:
        connector?.spec?.authentication?.spec?.spec?.username ||
        connector?.spec?.authentication?.spec?.spec?.usernameRef
    },
    {
      label: 'password',
      value: connector?.spec?.authentication?.spec?.spec?.passwordRef
    },
    ...(connector?.spec?.authentication?.spec?.type !== GitAuthTypes.OAUTH
      ? [
          {
            label: 'personalAccessToken',
            value: connector?.spec?.authentication?.spec?.spec?.tokenRef || connector?.spec?.apiAccess?.spec?.tokenRef
          }
        ]
      : []),
    {
      label: 'SSH_KEY',
      value: connector?.spec?.authentication?.spec?.sshKeyRef
    },
    {
      label: 'common.git.APIAuthentication',
      value: connector?.spec?.apiAccess?.type
    },
    {
      label: 'common.git.installationId',
      value: connector?.spec?.apiAccess?.spec?.installationId || connector?.spec?.apiAccess?.spec?.installationIdRef
    },
    {
      label: 'common.git.applicationId',
      value: connector?.spec?.apiAccess?.spec?.applicationId || connector?.spec?.apiAccess?.spec?.applicationIdRef
    },
    {
      label: 'common.git.privateKey',
      value: connector?.spec?.apiAccess?.spec?.privateKeyRef
    }
  ]
}

const getDockerSchema = (connector: ConnectorInfoDTO): Array<ActivityDetailsRowInterface> => {
  return [
    {
      label: 'connectors.docker.dockerProvideType',
      value: connector?.spec?.providerType
    },
    {
      label: 'connectors.docker.dockerRegistryURL',
      value: connector?.spec?.dockerRegistryUrl
    },
    {
      label: 'credType',
      value: getLabelForAuthType(connector?.spec?.auth?.type)
    },
    {
      label: 'username',
      value: connector?.spec?.auth?.spec?.username || connector?.spec?.auth?.spec?.usernameRef
    },
    {
      label: 'password',
      value: connector?.spec?.auth?.spec?.passwordRef
    }
  ]
}

const getAzureArtifactSchema = (connector: ConnectorInfoDTO): Array<ActivityDetailsRowInterface> => {
  return [
    {
      label: 'connectors.azureArtifacts.azureArtifactsUrl',
      value: connector?.spec?.azureArtifactsUrl
    },
    {
      label: 'personalAccessToken',
      value: connector?.spec?.auth?.spec?.spec?.tokenRef
    }
  ]
}

const getJenkinsSchema = (connector: ConnectorInfoDTO): Array<ActivityDetailsRowInterface> => {
  return [
    {
      label: 'connectors.jenkins.jenkinsUrl',
      value: connector?.spec?.jenkinsUrl
    },
    {
      label: 'credType',
      value: getLabelForAuthType(connector?.spec?.auth?.type)
    },
    {
      label: 'username',
      value: connector?.spec?.auth?.spec?.username || connector?.spec?.auth?.spec?.usernameRef
    },
    {
      label: 'connectors.jenkins.passwordAPIToken',
      value: connector?.spec?.auth?.spec?.passwordRef
    },
    {
      label: 'connectors.bearerToken',
      value: connector?.spec?.auth?.spec?.tokenRef
    }
  ]
}

const getBambooSchema = (connector: ConnectorInfoDTO): Array<ActivityDetailsRowInterface> => {
  return [
    {
      label: 'connectors.bamboo.bambooUrl',
      value: connector?.spec?.bambooUrl
    },
    {
      label: 'credType',
      value: getLabelForAuthType(connector?.spec?.auth?.type)
    },
    {
      label: 'username',
      value: connector?.spec?.auth?.spec?.username || connector?.spec?.auth?.spec?.usernameRef
    },
    {
      label: 'password',
      value: connector?.spec?.auth?.spec?.passwordRef
    }
  ]
}

const getGcpSMSchema = (connector: ConnectorInfoDTO): Array<ActivityDetailsRowInterface> => {
  const returnSchema: Array<ActivityDetailsRowInterface> = []
  if (connector?.spec?.credentialsRef) {
    returnSchema.push({
      label: 'connectors.gcpSecretManager.gcpSMSecretFile',
      value: connector?.spec?.credentialsRef
    })
  }
  if (connector?.spec?.assumeCredentialsOnDelegate) {
    returnSchema.push({
      label: 'connectionMode',
      value: DelegateTypes.DELEGATE_IN_CLUSTER
    })
  }
  return returnSchema
}

const getSpotSchema = (connector: ConnectorInfoDTO): Array<ActivityDetailsRowInterface> => {
  return [
    {
      label: 'connectors.spotAccountId',
      value: connector?.spec?.credential?.spec?.spotAccountId || connector?.spec?.credential?.spec?.spotAccountIdRef
    },
    {
      label: 'connectors.apiToken',
      value: connector?.spec?.credential?.spec?.apiTokenRef
    }
  ]
}

const getTasSchema = (connector: ConnectorInfoDTO): Array<ActivityDetailsRowInterface> => {
  return [
    {
      label: 'connectors.k8.masterUrlLabel',
      value: connector?.spec?.credential?.spec?.endpointUrl
    },
    {
      label: 'username',
      value: connector?.spec?.credential?.spec?.username || connector?.spec?.credential?.spec?.usernameRef
    },
    {
      label: 'password',
      value: connector?.spec?.credential?.spec?.passwordRef
    }
  ]
}

const getTerraformCloudSchema = (connector: ConnectorInfoDTO): Array<ActivityDetailsRowInterface> => {
  return [
    {
      label: 'connectors.terraformCloud.url',
      value: connector?.spec?.terraformCloudUrl
    },
    {
      label: 'connectors.apiToken',
      value: connector?.spec?.credential?.spec?.apiToken
    }
  ]
}

const getCustomSMSchema = (connector: ConnectorInfoDTO): Array<ActivityDetailsRowInterface> => {
  return [
    {
      label: 'connectors.customSM.templateRef',
      value: connector?.spec?.template?.templateRef
    },
    {
      label: 'connectors.customSM.templateVersion',
      value: connector?.spec?.template?.versionLabel
    },
    {
      label: 'connectors.customSM.executeOnDelegate',
      value: connector?.spec?.onDelegate
    },
    {
      label: 'common.hostLabel',
      value: connector?.spec?.host
    },
    {
      label: 'connectors.customSM.sshKey',
      value: connector?.spec?.connectorRef
    },
    {
      label: 'workingDirectory',
      value: connector?.spec?.workingDirectory
    }
  ]
}

const getJiraSchema = (connector: ConnectorInfoDTO): Array<ActivityDetailsRowInterface> => {
  return [
    {
      label: 'connectors.jira.jiraUrl',
      value: connector?.spec?.jiraUrl
    },

    {
      label: 'username',
      value: connector?.spec?.username || connector?.spec?.usernameRef || connector?.spec?.auth?.spec?.username
    },
    {
      label: 'password',
      value: connector?.spec?.passwordRef || connector?.spec?.auth?.spec?.passwordRef
    },
    {
      label: 'personalAccessToken',
      value: connector?.spec?.auth?.spec?.patRef
    }
  ]
}

const getHelmHttpSchema = (connector: ConnectorInfoDTO): Array<ActivityDetailsRowInterface> => {
  return [
    {
      label: 'connectors.httpHelm.httpHelmRepoUrl',
      value: connector?.spec?.helmRepoUrl
    },
    {
      label: 'credType',
      value: getLabelForAuthType(connector?.spec?.auth?.type)
    },
    {
      label: 'username',
      value: connector?.spec?.auth?.spec?.username || connector?.spec?.auth?.spec?.usernameRef
    },
    {
      label: 'password',
      value: connector?.spec?.auth?.spec?.passwordRef
    }
  ]
}

const getOCIHelmSchema = (connector: ConnectorInfoDTO): Array<ActivityDetailsRowInterface> => {
  return [
    {
      label: 'connectors.ociHelm.ociHelmUrl',
      value: connector?.spec?.helmRepoUrl
    },
    {
      label: 'credType',
      value: getLabelForAuthType(connector?.spec?.auth?.type)
    },
    {
      label: 'username',
      value: connector?.spec?.auth?.spec?.username || connector?.spec?.auth?.spec?.usernameRef
    },
    {
      label: 'password',
      value: connector?.spec?.auth?.spec?.passwordRef
    }
  ]
}

const getVaultSchema = (
  connector: ConnectorInfoDTO,
  getString: UseStringsReturn['getString']
): Array<ActivityDetailsRowInterface> => {
  const data = connector.spec as VaultConnectorDTO

  return [
    {
      label: 'connectors.hashiCorpVault.vaultUrl',
      value: data.vaultUrl
    },
    {
      label: 'authentication',
      value: data?.accessType ? getString(accessTypeOptionsMap[data.accessType]) : ''
    },
    {
      label: 'connectors.hashiCorpVault.engineName',
      value: data.secretEngineName
    },
    {
      label: 'connectors.hashiCorpVault.engineVersion',
      value: data.secretEngineVersion
    },
    {
      label: 'connectors.hashiCorpVault.renewal',
      value:
        data.accessType !== HashiCorpVaultAccessTypes.VAULT_AGENT &&
        data.accessType !== HashiCorpVaultAccessTypes.AWS_IAM &&
        data.accessType !== HashiCorpVaultAccessTypes.K8s_AUTH
          ? data.renewalIntervalMinutes?.toString()
          : undefined
    },
    {
      label: 'regionLabel',
      value: data.awsRegion
    },
    {
      label: 'common.role',
      value: data.vaultAwsIamRole
    },
    {
      label: 'connectors.hashiCorpVault.readOnly',
      value: data.readOnly
    },
    {
      label: 'connectors.hashiCorpVault.k8sAuthEndpoint',
      value: data.k8sAuthEndpoint
    },
    {
      label: 'connectors.hashiCorpVault.serviceAccountTokenPath',
      value: data.serviceAccountTokenPath
    },
    {
      label: 'connectors.hashiCorpVault.vaultK8sAuthRole',
      value: data.vaultK8sAuthRole
    }
  ]
}

const getAwsKmsSchema = (connector: ConnectorInfoDTO): Array<ActivityDetailsRowInterface> => {
  const data = connector.spec as AwsKmsConnectorDTO
  return [
    {
      label: 'credType',
      value: data.credential?.type
    },
    {
      label: 'regionLabel',
      value: data.region
    },
    {
      label: 'connectors.awsKms.roleArnLabel',
      value: data.credential?.spec?.roleArn
    },
    {
      label: 'connectors.aws.externalId',
      value: data.credential?.spec?.externalName
    },
    {
      label: 'connectors.awsKms.assumedRoleDuration',
      value: data.credential?.spec?.assumeStsRoleDuration
    },
    {
      label: 'connectors.hashiCorpVault.default',
      value: data.default ? YesOrNo.YES : YesOrNo.NO
    }
  ]
}

const getAwsSecretManagerSchema = (connector: ConnectorInfoDTO): Array<ActivityDetailsRowInterface> => {
  const data = connector.spec as AwsSecretManagerDTO
  return [
    {
      label: 'credType',
      value: data.credential.type
    },
    {
      label: 'connectors.awsKms.accessKeyLabel',
      value: data.credential.spec?.accessKey
    },
    {
      label: 'connectors.awsKms.secretKeyLabel',
      value: data.credential.spec?.secretKey
    },
    {
      label: 'connectors.awsSecretManager.secretNamePrefix',
      value: data.secretNamePrefix
    },
    {
      label: 'regionLabel',
      value: data.region
    },
    {
      label: 'connectors.awsKms.roleArnLabel',
      value: data.credential?.spec?.roleArn
    },
    {
      label: 'connectors.aws.externalId',
      value: data.credential?.spec?.externalId
    },
    {
      label: 'connectors.awsKms.assumedRoleDuration',
      value: data.credential?.spec?.assumeStsRoleDuration
    },
    {
      label: 'connectors.hashiCorpVault.default',
      value: data.default ? YesOrNo.YES : YesOrNo.NO
    }
  ]
}

const getAwsCodeCommitSchema = (connector: ConnectorInfoDTO): Array<ActivityDetailsRowInterface> => {
  return [
    {
      label: 'common.git.urlType',
      value: connector?.spec?.type
    },
    {
      label: 'connectors.awsCodeCommit.repoUrl',
      value: connector?.spec?.url
    },
    {
      label: 'connectors.aws.accessKey',
      value:
        connector?.spec?.authentication?.spec?.spec?.accessKey ||
        connector?.spec?.authentication?.spec?.spec?.accessKeyRef
    },
    {
      label: 'encryptedKeyLabel',
      value: connector?.spec?.authentication?.spec?.spec?.secretKeyRef
    }
  ]
}

const getGcpKmsSchema = (connector: ConnectorInfoDTO): Array<ActivityDetailsRowInterface> => {
  const data = connector.spec as GcpKmsConnectorDTO
  return [
    {
      label: 'pipelineSteps.projectIDLabel',
      value: data.projectId
    },
    {
      label: 'regionLabel',
      value: data.region
    },
    {
      label: 'connectors.gcpKms.keyRing',
      value: data.keyRing
    },
    {
      label: 'connectors.gcpKms.keyName',
      value: data.keyName
    },
    {
      label: 'connectors.hashiCorpVault.default',
      value: data.default ? YesOrNo.YES : YesOrNo.NO
    }
  ]
}

const getAzureKeyVaultSchema = (connector: ConnectorInfoDTO): Array<ActivityDetailsRowInterface> => {
  const connectorInfoSpec = connector.spec as AzureKeyVaultConnectorDTO

  const delegateInCluster = connectorInfoSpec?.useManagedIdentity
  const authType = connectorInfoSpec?.managedIdentityType

  const schema = [
    {
      label: 'connectors.azureKeyVault.labels.tenantId',
      value: connectorInfoSpec.tenantId
    },
    {
      label: 'connectors.azureKeyVault.labels.subscription',
      value: connectorInfoSpec.subscription
    },
    {
      label: 'connectors.azureKeyVault.labels.vaultName',
      value: connectorInfoSpec.vaultName
    },
    {
      label: 'connectors.hashiCorpVault.default',
      value: connectorInfoSpec.default ? YesOrNo.YES : YesOrNo.NO
    }
  ]

  return delegateInCluster
    ? [
        ...schema,
        {
          label: 'authentication',
          value: authType
        },
        {
          label: 'environment',
          value: connectorInfoSpec?.azureEnvironmentType
        },
        {
          label: 'common.clientId',
          value: connectorInfoSpec.managedClientId
        }
      ]
    : [
        ...schema,
        {
          label: 'common.clientId',
          value: connectorInfoSpec.clientId
        }
      ]
}

const getGCPSchema = (connector: ConnectorInfoDTO): Array<ActivityDetailsRowInterface> => {
  return [
    {
      label: 'credType',
      value: connector?.spec?.credential?.type
    },
    {
      label: 'encryptedKeyLabel',
      value: connector?.spec?.credential?.spec?.secretKeyRef
    }
  ]
}

const getPDCSchema = (connector: ConnectorInfoDTO): Array<ActivityDetailsRowInterface> => {
  return [
    {
      label: 'SSH_KEY',
      value: connector?.spec?.sshKeyRef
    }
  ]
}

const getAWSSchema = (connector: ConnectorInfoDTO): Array<ActivityDetailsRowInterface> => {
  return [
    {
      label: 'credType',
      value: connector?.spec?.credential?.type
    },
    {
      label: 'password',
      value: connector?.spec?.credential?.spec?.secretKeyRef
    },
    {
      label: 'connectors.aws.accessKey',
      value: connector?.spec?.credential?.spec?.accessKey || connector?.spec?.credential?.spec?.accessKeyRef
    },
    {
      label: 'connectors.aws.crossAccURN',
      value: connector?.spec?.credential?.crossAccountAccess?.crossAccountRoleArn
    },
    {
      label: 'connectors.aws.externalId',
      value: connector?.spec?.credential?.crossAccountAccess?.externalId
    }
  ]
}

const getAzureSchema = (connector: ConnectorInfoDTO): Array<ActivityDetailsRowInterface> => {
  const connectorInfoSpec = connector?.spec
  const delegateInCluster = connectorInfoSpec?.credential?.type === DelegateTypes.DELEGATE_IN_CLUSTER
  const authType = connectorInfoSpec?.credential?.spec?.auth?.type

  const schema = [
    {
      label: 'connectionMode',
      value: connectorInfoSpec?.credential?.type
    },
    {
      label: 'environment',
      value: connectorInfoSpec?.azureEnvironmentType
    },
    {
      label: 'connectors.azure.applicationId',
      value: connectorInfoSpec?.credential?.spec?.applicationId
    },
    {
      label: 'connectors.tenantId',
      value: connectorInfoSpec?.credential?.spec?.tenantId
    },
    {
      label: 'authentication',
      value: authType
    },
    {
      label: 'connectors.azure.clientId',
      value: connectorInfoSpec?.credential?.spec?.auth?.spec?.clientId
    }
  ]

  return delegateInCluster
    ? schema
    : [
        ...schema,
        {
          label: authType === AzureSecretKeyType.SECRET ? 'secretType' : 'connectors.azure.auth.certificate',
          value:
            authType === AzureSecretKeyType.SECRET
              ? connectorInfoSpec?.credential?.spec?.auth?.spec?.secretRef
              : connectorInfoSpec?.credential?.spec?.auth?.spec?.certificateRef
        }
      ]
}

const getNexusSchema = (connector: ConnectorInfoDTO): Array<ActivityDetailsRowInterface> => {
  return [
    {
      label: 'connectors.nexus.nexusServerUrl',
      value: connector.spec?.nexusServerUrl
    },
    {
      label: 'version',
      value: connector.spec?.version
    },
    {
      label: 'credType',
      value: getLabelForAuthType(connector.spec?.auth?.type)
    },
    {
      label: 'username',
      value: connector?.spec?.auth?.spec?.username || connector?.spec?.auth?.spec?.usernameRef
    },
    {
      label: 'password',
      value: connector?.spec?.auth?.spec?.passwordRef
    }
  ]
}

const getArtifactorySchema = (connector: ConnectorInfoDTO): Array<ActivityDetailsRowInterface> => {
  return [
    {
      label: 'connectors.artifactory.artifactoryServerUrl',
      value: connector.spec?.artifactoryServerUrl
    },
    {
      label: 'credType',
      value: getLabelForAuthType(connector.spec?.auth?.type)
    },
    {
      label: 'username',
      value: connector?.spec?.auth?.spec?.username || connector?.spec?.auth?.spec?.usernameRef
    },
    {
      label: 'password',
      value: connector?.spec?.auth?.spec?.passwordRef
    }
  ]
}

const getDataDogSchema = (connector: ConnectorInfoDTO): Array<ActivityDetailsRowInterface> => {
  return [
    {
      label: 'UrlLabel',
      value: connector?.spec?.url
    },
    {
      label: 'connectors.encryptedAPIKeyLabel',
      value: connector?.spec?.apiKeyRef
    },
    {
      label: 'connectors.datadog.encryptedAPPKeyLabel',
      value: connector?.spec?.applicationKeyRef
    }
  ]
}

const getSumologicSchema = (connector: ConnectorInfoDTO): Array<ActivityDetailsRowInterface> => {
  return [
    {
      label: 'connectors.sumologic.urlLabel',
      value: connector?.spec?.url
    },
    {
      label: 'connectors.sumologic.encryptedAccessIdLabel',
      value: connector?.spec?.accessIdRef
    },
    {
      label: 'connectors.sumologic.encryptedAccessKeyLabel',
      value: connector?.spec?.accessKeyRef
    }
  ]
}

const getServiceNowSchema = (connector: ConnectorInfoDTO): Array<ActivityDetailsRowInterface> => {
  return [
    {
      label: 'connectors.serviceNow.serviceNowUrl',
      value: connector?.spec?.serviceNowUrl
    },

    {
      label: 'username',
      value: connector?.spec?.username || connector?.spec?.usernameRef || connector?.spec?.auth?.spec?.username
    },
    {
      label: 'password',
      value: connector?.spec?.passwordRef || connector?.spec?.auth?.spec?.passwordRef
    },
    {
      label: 'connectors.serviceNow.resourceID',
      value: connector?.spec?.auth?.spec?.resourceIdRef
    },
    {
      label: 'common.certificate',
      value: connector?.spec?.auth?.spec?.certificateRef
    },
    {
      label: 'connectors.serviceNow.clientID',
      value: connector?.spec?.auth?.spec?.clientIdRef
    },
    {
      label: 'connectors.serviceNow.privateKey',
      value: connector?.spec?.auth?.spec?.privateKeyRef
    },
    {
      label: 'connectors.serviceNow.adfsUrl',
      value: connector?.spec?.auth?.spec?.adfsUrl
    }
  ]
}

const getRancherSchema = (connector: ConnectorInfoDTO): Array<ActivityDetailsRowInterface> => {
  return [
    {
      label: 'connectionMode',
      value: connector?.spec?.credential?.type
    },
    {
      label: 'connectors.rancher.rancherUrlLabel',
      value: connector?.spec?.credential?.spec?.rancherUrl
    },
    {
      label: 'credType',
      value: getLabelForAuthType(connector?.spec?.credential?.spec?.auth?.type)
    },

    {
      label: 'password',
      value: connector?.spec?.credential?.spec?.auth?.spec?.passwordRef
    }
  ]
}

const getSchemaByType = (
  connector: ConnectorInfoDTO,
  type: string,
  getString: UseStringsReturn['getString']
): Array<ActivityDetailsRowInterface> => {
  switch (type) {
    case Connectors.KUBERNETES_CLUSTER:
      return getKubernetesSchema(connector)
    case Connectors.Rancher:
      return getRancherSchema(connector)
    case Connectors.GIT:
      return getGitSchema(connector)
    case Connectors.Jira:
      return getJiraSchema(connector)
    case Connectors.GITHUB:
    case Connectors.GITLAB:
    case Connectors.BITBUCKET:
    case Connectors.AZURE_REPO:
      return getGithubSchema(connector) // GitHub schema will work for GitLab, Bitbucket and AzureRepos too
    case Connectors.DOCKER:
      return getDockerSchema(connector)
    case Connectors.HttpHelmRepo:
      return getHelmHttpSchema(connector)
    case Connectors.AZURE_ARTIFACTS:
      return getAzureArtifactSchema(connector)
    case Connectors.OciHelmRepo:
      return getOCIHelmSchema(connector)
    case Connectors.GCP:
      return getGCPSchema(connector)
    case Connectors.PDC:
      return getPDCSchema(connector)
    case Connectors.AWS:
      return getAWSSchema(connector)
    case Connectors.NEXUS:
      return getNexusSchema(connector)
    case Connectors.ARTIFACTORY:
      return getArtifactorySchema(connector)
    case Connectors.VAULT:
    case Connectors.LOCAL:
      return getVaultSchema(connector, getString)
    case Connectors.AWS_KMS:
      return getAwsKmsSchema(connector)
    case Connectors.AWS_SECRET_MANAGER:
      return getAwsSecretManagerSchema(connector)
    case Connectors.AWS_CODECOMMIT:
      return getAwsCodeCommitSchema(connector)
    case Connectors.GCP_KMS:
      return getGcpKmsSchema(connector)
    case Connectors.DATADOG:
      return getDataDogSchema(connector)
    case Connectors.AZURE_KEY_VAULT:
      return getAzureKeyVaultSchema(connector)
    case Connectors.SUMOLOGIC:
      return getSumologicSchema(connector)
    case Connectors.SERVICE_NOW:
      return getServiceNowSchema(connector)
    case Connectors.AZURE:
      return getAzureSchema(connector)
    case Connectors.JENKINS:
      return getJenkinsSchema(connector)
    case Connectors.Bamboo:
      return getBambooSchema(connector)

    case Connectors.CUSTOM_SECRET_MANAGER:
      return getCustomSMSchema(connector)
    case Connectors.GcpSecretManager:
      return getGcpSMSchema(connector)
    case Connectors.SPOT:
      return getSpotSchema(connector)
    case Connectors.TAS:
      return getTasSchema(connector)
    case Connectors.TERRAFORM_CLOUD:
      return getTerraformCloudSchema(connector)
    default:
      return []
  }
}

const getCommonCredentialsDetailsSchema = (
  connector: ConnectorInfoDTO,
  getString: UseStringsReturn['getString']
): Array<ActivityDetailsRowInterface> => {
  const delegateSelectors = connector.spec?.delegateSelectors
  const executeOnDelegate = connector.spec?.executeOnDelegate
  const schema = []
  if (executeOnDelegate !== null && executeOnDelegate !== undefined) {
    schema.push({
      label: 'connectors.connectivityMode.title',
      value: connector.spec?.executeOnDelegate
        ? getString('common.harnessDelegate')
        : getString('common.harnessPlatform')
    })
  }
  if (delegateSelectors && delegateSelectors.length) {
    schema.push({
      label: 'connectors.delegate.delegateSelectors',
      value: connector.spec?.delegateSelectors.join(', ')
    })
  }
  return schema
}

const getSchema = (props: SavedConnectorDetailsProps): Array<ActivityDetailsRowInterface> => {
  const { connector } = props
  return [
    {
      label: getLabelByType(connector?.type),
      value: connector?.name
    },
    {
      label: 'description',
      value: connector?.description
    },
    {
      label: 'identifier',
      value: connector?.identifier
    },
    {
      label: 'tagsLabel',
      value: connector?.tags
    }
  ]
}

const getBackoffStrategySchema = (
  connector: ConnectorInfoDTO,
  getString: UseStringsReturn['getString']
): Array<ActivityDetailsRowInterface> => {
  const backoffStrategyOverride = connector.spec?.awsSdkClientBackOffStrategyOverride
  const backoffStrategyType: keyof IBackoffStrategyTypeLabelMapping = backoffStrategyOverride?.type
  if (backoffStrategyType) {
    if (backoffStrategyType === BackOffStrategy.FixedDelayBackoffStrategy) {
      return [
        {
          label: 'connectors.aws.strategyType',
          value: getString(backoffStrategyTypeLabelMapping[backoffStrategyType])
        },
        {
          label: 'connectors.aws.fixedBackoff',
          value: backoffStrategyOverride?.spec.fixedBackoff
        },
        {
          label: 'connectors.aws.retryCount',
          value: backoffStrategyOverride?.spec.retryCount
        }
      ]
    } else {
      return [
        {
          label: 'connectors.aws.strategyType',
          value: getString(backoffStrategyTypeLabelMapping[backoffStrategyType])
        },
        {
          label: 'connectors.aws.baseDelay',
          value: backoffStrategyOverride?.spec.baseDelay
        },
        {
          label: 'connectors.aws.maxBackoffTime',
          value: backoffStrategyOverride?.spec.maxBackoffTime
        },
        {
          label: 'connectors.aws.retryCount',
          value: backoffStrategyOverride?.spec.retryCount
        }
      ]
    }
  }
  return []
}

const getDate = (value?: number): string | null => {
  return value ? moment.unix(value / 1000).format(StringUtils.DEFAULT_DATE_FORMAT) : null
}

export const getActivityDetails = (data: ActivityDetailsData): Array<ActivityDetailsRowInterface> => {
  const activityDetails: Array<ActivityDetailsRowInterface> = [
    {
      label: 'connectorCreated',
      value: getDate(data?.createdAt)
    },
    {
      label: 'lastUpdated',
      value: getDate(data?.lastUpdated)
    }
  ]

  if (data.status === 'FAILURE') {
    activityDetails.push({
      label: 'lastTested',
      value: getDate(data?.lastTested),
      iconData: {
        icon: 'warning-sign',
        textId: 'failed',
        color: Color.RED_500
      }
    })
  } else {
    activityDetails.push({
      label: 'lastTested',
      value: getDate(data?.lastConnectionSuccess),
      iconData: {
        icon: 'deployment-success-new',
        textId: 'success',
        color: Color.GREEN_500
      }
    })
    activityDetails.push({
      label: 'lastConnectionSuccess',
      value: getDate(data?.lastConnectionSuccess)
    })
  }

  return activityDetails
}

export const RenderDetailsSection: React.FC<RenderDetailsSectionProps> = props => {
  const { getString } = useStrings()
  return (
    <Card className={css.detailsSection}>
      <Text font={{ weight: 'bold', size: 'medium' }} color={Color.GREY_700} padding={{ bottom: '10px' }}>
        {props.title}
      </Text>
      {props.data.map((item, index) => {
        return item.value && (item.label === 'tagsLabel' ? Object.keys(item.value as TagsInterface).length : true) ? (
          <Layout.Vertical
            className={css.detailsSectionRowWrapper}
            spacing="xsmall"
            padding={{ top: 'medium', bottom: 'medium' }}
            key={`${item.value}${index}`}
          >
            <Text font={{ size: 'small' }}>{getString(item.label as StringKeys)}</Text>
            {item.label === 'tagsLabel' && typeof item.value === 'object' ? (
              <TagsRenderer tags={item.value} length={4} />
            ) : (
              <Layout.Horizontal spacing="small" className={css.detailsSectionRow}>
                <Text
                  inline
                  className={css.detailsValue}
                  color={item.value === 'encrypted' ? Color.GREY_350 : Color.BLACK}
                >
                  {item.value}
                </Text>
                {item.iconData?.icon ? (
                  <Layout.Horizontal spacing="small">
                    <Icon
                      inline={true}
                      name={item.iconData.icon}
                      size={14}
                      color={item.iconData.color}
                      title={getString(item.iconData.textId)}
                    />
                    <Text inline>{getString(item.iconData.textId)}</Text>
                  </Layout.Horizontal>
                ) : null}
              </Layout.Horizontal>
            )}
          </Layout.Vertical>
        ) : (
          <></>
        )
      })}
    </Card>
  )
}

const getPDCConnectorHosts = (connector: ConnectorInfoDTO) => {
  const hosts = connector.spec?.hosts.map((host: any) => host.hostname)
  return Array.isArray(hosts)
    ? [
        {
          label: 'connectors.pdc.hosts',
          value: hosts.join(',\r\n')
        }
      ]
    : []
}

enum SectionType {
  overview = 'overview',
  credentials = 'credentials',
  hosts = 'hosts',
  backoffStrategy = 'backoffStrategy'
}
interface SectionTitleMapping {
  [SectionType.overview]: string
  [SectionType.credentials]: string
  [SectionType.hosts]: string
  [SectionType.backoffStrategy]: string
}

const SavedConnectorDetails: React.FC<SavedConnectorDetailsProps> = props => {
  const { getString } = useStrings()
  const connectorDetailsSchema = getSchema(props)
  const credenatialsDetailsSchema = getSchemaByType(props.connector, props.connector?.type, getString)
  const backoffStrategyDetailsSchema = getBackoffStrategySchema(props.connector, getString)
  const commonCredentialsDetailsSchema = getCommonCredentialsDetailsSchema(props.connector, getString)

  const getRenderDetailsData = (sectionName: string) => {
    if (sectionName === SectionType.overview) {
      return connectorDetailsSchema
    }
    if (sectionName === SectionType.credentials) {
      return [...credenatialsDetailsSchema, ...commonCredentialsDetailsSchema]
    }
    if (sectionName === SectionType.hosts) {
      return [...getPDCConnectorHosts(props.connector)]
    }
    if (sectionName === SectionType.backoffStrategy) {
      return backoffStrategyDetailsSchema
    }
    return []
  }

  const sectionList: SectionType[] = [SectionType.overview]
  if (props.connector?.type !== Connectors.PDC) {
    sectionList.push(SectionType.credentials)
  }
  if (props.connector?.type === Connectors.PDC) {
    sectionList.push(SectionType.hosts)
  }
  if (!!props.connector?.spec?.awsSdkClientBackOffStrategyOverride?.type && backoffStrategyDetailsSchema?.length) {
    sectionList.push(SectionType.backoffStrategy)
  }

  const sectionTitleMapping: SectionTitleMapping = {
    overview: getString('overview'),
    credentials: getString('credentials'),
    hosts: getString('connectors.pdc.hosts'),
    backoffStrategy: getString('connectors.aws.awsBackOffStrategy')
  }

  return (
    <Layout.Horizontal className={css.detailsSectionContainer} spacing="xlarge">
      <Layout.Vertical className={css.detailsSectionContainerColumn} spacing="xlarge">
        {sectionList.map(
          (currSection: SectionType, index: number) =>
            index % 2 === 0 && (
              <RenderDetailsSection title={sectionTitleMapping[currSection]} data={getRenderDetailsData(currSection)} />
            )
        )}
      </Layout.Vertical>

      <Layout.Vertical className={css.detailsSectionContainerColumn} spacing="xlarge">
        {sectionList.map(
          (currSection: SectionType, index: number) =>
            index % 2 === 1 && (
              <RenderDetailsSection title={sectionTitleMapping[currSection]} data={getRenderDetailsData(currSection)} />
            )
        )}
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}
export default SavedConnectorDetails
