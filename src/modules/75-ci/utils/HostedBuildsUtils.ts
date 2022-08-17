/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { set } from 'lodash-es'
import type { ConnectorInfoDTO, ConnectorRequestBody, ConnectorResponse } from 'services/cd-ng'
import type { PipelineConfig } from 'services/pipeline-ng'
import { Connectors } from '@connectors/constants'
import {
  BitbucketPRTriggerActions,
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
      delegateSelectors: [DELEGATE_SELECTOR_FOR_HARNESS_PROVISIONED_DELEGATE],
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
