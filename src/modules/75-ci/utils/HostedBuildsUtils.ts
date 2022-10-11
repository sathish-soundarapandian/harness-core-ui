/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { set } from 'lodash-es'
import { parse } from 'yaml'
import type { ConnectorInfoDTO, ConnectorRequestBody, ConnectorResponse, UserRepoResponse } from 'services/cd-ng'
import type { PipelineConfig } from 'services/pipeline-ng'
import type { UseStringsReturn } from 'framework/strings'
import { StringUtils } from '@common/exports'
import { Connectors } from '@connectors/constants'
import {
  ACCOUNT_SCOPE_PREFIX,
  BitbucketPRTriggerActions,
  getCloudPipelinePayloadWithCodebase,
  getPipelinePayloadWithCodebase,
  GitHubPRTriggerActions,
  GitlabPRTriggerActions
} from '../pages/get-started-with-ci/InfraProvisioningWizard/Constants'

export const DELEGATE_SELECTOR_FOR_HARNESS_PROVISIONED_DELEGATE = 'harness-kubernetes-delegate'

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

export const getPRTriggerActions = (gitProviderType: ConnectorInfoDTO['type']) => {
  switch (gitProviderType) {
    case Connectors.GITHUB:
      return GitHubPRTriggerActions

    case Connectors.GITLAB:
      return GitlabPRTriggerActions

    case Connectors.BITBUCKET:
      return BitbucketPRTriggerActions

    default:
      return []
  }
}

export const sortConnectorsByLastConnectedAtTsDescOrder = (
  unsortedConnectorItems: ConnectorResponse[]
): ConnectorResponse[] => {
  const itemsCloneArr = [...unsortedConnectorItems]
  return [...itemsCloneArr].sort((ctr1, ctr2) => {
    const lastTestedAt1: number =
      ctr1?.status?.lastConnectedAt && !isNaN(ctr1.status.lastConnectedAt) ? ctr1.status.lastConnectedAt : 0
    const lastTestedAt2: number =
      ctr2?.status?.lastConnectedAt && !isNaN(ctr2.status.lastConnectedAt) ? ctr2.status.lastConnectedAt : 0
    return lastTestedAt2 - lastTestedAt1
  })
}

export const addDetailsToPipeline = ({
  originalPipeline,
  name,
  identifier,
  projectIdentifier,
  orgIdentifier,
  connectorRef,
  repoName
}: {
  originalPipeline: PipelineConfig
  name: string
  identifier: string
  projectIdentifier: string
  orgIdentifier: string
  connectorRef?: string
  repoName?: string
}): PipelineConfig => {
  let updatedPipeline = { ...originalPipeline }
  updatedPipeline = set(updatedPipeline, 'pipeline.name', name)
  updatedPipeline = set(updatedPipeline, 'pipeline.identifier', identifier)
  updatedPipeline = set(updatedPipeline, 'pipeline.projectIdentifier', projectIdentifier)
  updatedPipeline = set(updatedPipeline, 'pipeline.orgIdentifier', orgIdentifier)
  if (connectorRef && repoName) {
    updatedPipeline = set(updatedPipeline, 'pipeline.properties.ci.codebase.connectorRef', connectorRef)
    updatedPipeline = set(updatedPipeline, 'pipeline.properties.ci.codebase.repoName', repoName)
  }
  return updatedPipeline
}

export const getFullRepoName = (repository: UserRepoResponse): string => {
  const { name: repositoryName, namespace } = repository
  return namespace && repositoryName ? `${namespace}/${repositoryName}` : repositoryName ?? ''
}

export const getPayloadForPipelineCreation = ({
  pipelineYaml,
  pipelineName,
  isUsingHostedVMsInfra,
  isUsingAStarterPipeline,
  getString,
  projectIdentifier,
  orgIdentifier,
  repository,
  configuredGitConnector
}: {
  pipelineYaml: string
  pipelineName: string
  isUsingHostedVMsInfra?: boolean
  isUsingAStarterPipeline: boolean
  getString: UseStringsReturn['getString']
  projectIdentifier: string
  orgIdentifier: string
  repository: UserRepoResponse
  configuredGitConnector: ConnectorInfoDTO
}): PipelineConfig => {
  const UNIQUE_PIPELINE_ID = new Date().getTime().toString()
  return addDetailsToPipeline({
    originalPipeline: isUsingHostedVMsInfra
      ? isUsingAStarterPipeline
        ? parse(pipelineYaml)
        : getCloudPipelinePayloadWithCodebase()
      : isUsingAStarterPipeline
      ? parse(pipelineYaml)
      : getPipelinePayloadWithCodebase(),
    name: `${getString('buildText')} ${isUsingAStarterPipeline ? pipelineName : repository.name}`,
    identifier: `${getString('buildText')}_${
      isUsingAStarterPipeline ? StringUtils.getIdentifierFromName(pipelineName) : repository.name?.replace(/-/g, '_')
    }_${UNIQUE_PIPELINE_ID}`,
    projectIdentifier,
    orgIdentifier,
    connectorRef: `${ACCOUNT_SCOPE_PREFIX}${configuredGitConnector?.identifier}`,
    repoName: getFullRepoName(repository)
  })
}
