/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@harness/uicore'
import { once } from 'lodash-es'
import type { ConnectorInfoDTO, ServiceDefinition, ServiceHookWrapper } from 'services/cd-ng'
import { Connectors } from '@connectors/constants'
import type { StringKeys, UseStringsReturn } from 'framework/strings'
import type { ServiceHookStoreType, ConfigStoreWithoutConnector } from './ServiceHooksInterface'

type HookValueType = keyof ServiceHookWrapper

export const hookTypes = once(
  (getString: UseStringsReturn['getString']): Array<{ label: string; value: HookValueType }> => [
    { label: getString('pipeline.serviceHooks.preHook'), value: 'preHook' },
    { label: getString('pipeline.serviceHooks.postHook'), value: 'postHook' }
  ]
)

export const ServiceHooksMap: { [key: string]: ServiceHookStoreType } = {
  Inline: 'Inline'
}

export const ServiceHookStoreIconByType: Record<ServiceHookStoreType, IconName> = {
  Inline: 'custom-artifact'
}

export const ServiceHookStoreTypeTitle: Record<ServiceHookStoreType, StringKeys> = {
  Inline: 'inline'
}

export const allowedServiceHooksTypes: Record<ServiceDefinition['type'], Array<ServiceHookStoreType>> = {
  Kubernetes: [ServiceHooksMap.Inline],
  NativeHelm: [ServiceHooksMap.Inline],
  ServerlessAwsLambda: [],
  AzureWebApp: [],
  Ssh: [],
  WinRm: [],
  ECS: [],
  CustomDeployment: [],
  Elastigroup: [],
  TAS: [],
  Asg: [],
  GoogleCloudFunctions: [],
  AwsLambda: [],
  AWS_SAM: []
}

export const ServiceHooksToConnectorLabelMap: Record<ConfigStoreWithoutConnector, StringKeys> = {
  Git: 'pipeline.manifestType.gitConnectorLabel',
  Github: 'common.repo_provider.githubLabel',
  Gitlab: 'common.repo_provider.gitlabLabel',
  Bitbucket: 'common.repo_provider.bitbucketLabel'
}

export const ServiceHooksToConnectorMap: Record<ServiceHookStoreType | string, ConnectorInfoDTO['type']> = {
  Git: Connectors.GIT,
  Github: Connectors.GITHUB,
  GitLab: Connectors.GITLAB,
  Bitbucket: Connectors.BITBUCKET,
  Harness: 'Harness' as ConnectorInfoDTO['type']
}

export const getServiceHooksHeaderTooltipId = (selectedDeploymentType: ServiceDefinition['type']): string => {
  return `${selectedDeploymentType}DeploymentTypeServiceHooks`
}

export const doesStoreHasConnector = (selectedStore: ServiceHookStoreType): boolean => {
  return [ServiceHooksMap.Inline].includes(selectedStore)
}
