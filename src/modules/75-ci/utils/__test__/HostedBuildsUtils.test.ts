/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import { get } from 'lodash-es'
import { Connectors } from '@connectors/constants'
import {
  getBackendServerUrl,
  isEnvironmentAllowedForOAuth
} from '@connectors/components/CreateConnector/CreateConnectorUtils'
import {
  getOAuthConnectorPayload,
  getPRTriggerActions,
  sortConnectorsByLastConnectedAtTsDescOrder
} from '../HostedBuildsUtils'
import {
  GitHubPRTriggerActions,
  GitlabPRTriggerActions,
  BitbucketPRTriggerActions
} from '../../pages/get-started-with-ci/InfraProvisioningWizard/Constants'

beforeAll(() => {
  jest.useFakeTimers('modern')
  jest.setSystemTime(new Date(2020, 3, 1))
})

afterAll(() => {
  jest.useRealTimers()
})

describe('Test HostedBuildsUtils methods', () => {
  test('Test getOAuthConnectorPayload method', () => {
    const oAuthConnectorPayloadForGithub = getOAuthConnectorPayload({
      tokenRef: 'secret-token',
      gitProviderType: 'Github'
    })
    expect(get(oAuthConnectorPayloadForGithub, 'connector.name')).toBe('Github OAuth')
    expect(get(oAuthConnectorPayloadForGithub, 'connector.identifier')).toBe('Github_OAuth_1585699200000')
    expect(get(oAuthConnectorPayloadForGithub, 'connector.spec.authentication.spec.spec.tokenRef')).toBe('secret-token')
    expect(get(oAuthConnectorPayloadForGithub, 'connector.spec.apiAccess.spec.tokenRef')).toBe('secret-token')

    const oAuthConnectorPayloadForGitlab = getOAuthConnectorPayload({
      tokenRef: 'secret-token',
      refreshTokenRef: 'secret-refresh-token',
      gitProviderType: 'Gitlab'
    })
    expect(get(oAuthConnectorPayloadForGitlab, 'connector.name')).toBe('Gitlab OAuth')
    expect(get(oAuthConnectorPayloadForGitlab, 'connector.identifier')).toBe('Gitlab_OAuth_1585699200000')
    expect(get(oAuthConnectorPayloadForGitlab, 'connector.spec.authentication.spec.spec.tokenRef')).toBe('secret-token')
    expect(get(oAuthConnectorPayloadForGitlab, 'connector.spec.authentication.spec.spec.refreshTokenRef')).toBe(
      'secret-refresh-token'
    )
    expect(get(oAuthConnectorPayloadForGitlab, 'connector.spec.apiAccess.spec.tokenRef')).toBe('secret-token')
    expect(get(oAuthConnectorPayloadForGitlab, 'connector.spec.apiAccess.spec.refreshTokenRef')).toBe(
      'secret-refresh-token'
    )

    const oAuthConnectorPayloadForBitbucket = getOAuthConnectorPayload({
      tokenRef: 'secret-token',
      refreshTokenRef: 'secret-refresh-token',
      gitProviderType: 'Bitbucket'
    })
    expect(get(oAuthConnectorPayloadForBitbucket, 'connector.name')).toBe('Bitbucket OAuth')
    expect(get(oAuthConnectorPayloadForBitbucket, 'connector.identifier')).toBe('Bitbucket_OAuth_1585699200000')
    expect(get(oAuthConnectorPayloadForBitbucket, 'connector.spec.authentication.spec.spec.tokenRef')).toBe(
      'secret-token'
    )
    expect(get(oAuthConnectorPayloadForBitbucket, 'connector.spec.authentication.spec.spec.refreshTokenRef')).toBe(
      'secret-refresh-token'
    )
    expect(get(oAuthConnectorPayloadForBitbucket, 'connector.spec.apiAccess.spec.tokenRef')).toBe('secret-token')
    expect(get(oAuthConnectorPayloadForBitbucket, 'connector.spec.apiAccess.spec.refreshTokenRef')).toBe(
      'secret-refresh-token'
    )
  })

  test('Test getBackendServerUrl method', () => {
    expect(getBackendServerUrl()).toBe('http://localhost')

    delete (window as any).location
    global.window.location = {
      ...window.location,
      protocol: 'https',
      hostname: 'app.harness.io'
    }
    expect(getBackendServerUrl()).toBe('https//app.harness.io')
  })

  test('Test isEnvironmentAllowedForOAuth method', () => {
    expect(isEnvironmentAllowedForOAuth()).toBe(true)
    delete (window as any).location

    global.window.location = {
      ...window.location,
      hostname: 'app.harness.io'
    }
    expect(isEnvironmentAllowedForOAuth()).toBe(true)

    global.window.location = {
      ...window.location,
      hostname: 'qa.harness.io'
    }
    expect(isEnvironmentAllowedForOAuth()).toBe(true)

    global.window.location = {
      ...window.location,
      hostname: 'pr.harness.io'
    }
    expect(isEnvironmentAllowedForOAuth()).toBe(true)

    global.window.location = {
      ...window.location,
      hostname: 'uat.harness.io'
    }
    expect(isEnvironmentAllowedForOAuth()).toBe(true)

    global.window.location = {
      ...window.location,
      hostname: 'stress.harness.io'
    }
    expect(isEnvironmentAllowedForOAuth()).toBe(true)

    global.window.location = {
      ...window.location,
      hostname: 'cloudflare.harness.io'
    }
    expect(isEnvironmentAllowedForOAuth()).toBe(false)
  })

  test('Test getPRTriggerActions method', () => {
    expect(getPRTriggerActions(Connectors.GITHUB)).toBe(GitHubPRTriggerActions)
    expect(getPRTriggerActions(Connectors.GITLAB)).toBe(GitlabPRTriggerActions)
    expect(getPRTriggerActions(Connectors.BITBUCKET)).toBe(BitbucketPRTriggerActions)
    expect(getPRTriggerActions(Connectors.KUBERNETES_CLUSTER)).toStrictEqual([])
  })

  test('Test sortConnectorsByLastConnectedAtTsDescOrder method', () => {
    let sortedItems = sortConnectorsByLastConnectedAtTsDescOrder([
      { status: { lastConnectedAt: 1668000000000 } },
      { status: { lastConnectedAt: 1658000000000 } }
    ])
    expect(
      new Number(get(sortedItems[0], 'status.lastConnectedAt')) >
        new Number(get(sortedItems[1], 'status.lastConnectedAt'))
    ).toBe(true)
    sortedItems = sortConnectorsByLastConnectedAtTsDescOrder([
      { status: {} },
      { status: { lastConnectedAt: 1658000000000 } }
    ])
    expect(
      new Number(get(sortedItems[0], 'status.lastConnectedAt')) >
        new Number(get(sortedItems[1], 'status.lastConnectedAt'))
    ).toBe(false)
  })
})
