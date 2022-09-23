/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, queryByText } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import SavedConnectorDetails, { RenderDetailsSection, getActivityDetails } from '../SavedConnectorDetails'
import {
  Vault,
  VaultWithIamAMS,
  Docker,
  GitHttp,
  K8WithInheritFromDelegate,
  ManualK8s,
  GCP,
  AWS,
  Nexus,
  Artifactory,
  AwsCodeCommit,
  PDC,
  GithubRepo
} from '../../../__tests__/mockData'

describe('Saved Connector Details', () => {
  test('render for Inline K8s schema', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <SavedConnectorDetails connector={K8WithInheritFromDelegate.data.connector as ConnectorInfoDTO} />
      </TestWrapper>
    )
    await waitFor(() => queryByText(container, 'k8WithTags'))
    expect(getByText('k8WithTags')).toBeDefined()
    expect(getByText('InheritFromDelegate')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('render for Manual K8s schema', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <SavedConnectorDetails connector={ManualK8s.data.content[0].connector as ConnectorInfoDTO} />
      </TestWrapper>
    )
    await waitFor(() => queryByText(container, 'k8sId'))
    expect(getByText('K8sName')).toBeDefined()
    expect(getByText('ManualConfig')).toBeDefined()
    expect(container).toMatchSnapshot()
  })
  test('render for GitHttp schema', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <SavedConnectorDetails connector={GitHttp.data.content[0].connector as ConnectorInfoDTO} />
      </TestWrapper>
    )
    await waitFor(() => queryByText(container, 'GitHttpId'))
    expect(getByText('GitHttpName')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('render for Docker schema', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <SavedConnectorDetails connector={Docker.data.content[0].connector as ConnectorInfoDTO} />
      </TestWrapper>
    )
    await waitFor(() => queryByText(container, 'DockerId'))
    expect(getByText('DockerName')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('render for GCP schema', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <SavedConnectorDetails connector={GCP.data.content[0].connector as ConnectorInfoDTO} />
      </TestWrapper>
    )
    await waitFor(() => queryByText(container, 'GCP_for_demo'))
    expect(getByText('GCP for demo')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('render for AWS schema', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <SavedConnectorDetails connector={AWS.data.content[0].connector as ConnectorInfoDTO} />
      </TestWrapper>
    )

    await waitFor(() => queryByText(container, 'AWS_demo'))
    expect(getByText('AWS demo')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('render for Nexus schema', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <SavedConnectorDetails connector={Nexus.data.content[0].connector as ConnectorInfoDTO} />
      </TestWrapper>
    )

    await waitFor(() => queryByText(container, 'Nexus_one'))
    expect(getByText('https://nexus2.harness.io')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('render for Artifactory schema', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <SavedConnectorDetails connector={Artifactory.data.content[0].connector as ConnectorInfoDTO} />
      </TestWrapper>
    )

    await waitFor(() => queryByText(container, 'Artifacory_One'))
    expect(getByText('Artifacory One')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('render for Vault schema', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <SavedConnectorDetails connector={Vault.data.content[0].connector as ConnectorInfoDTO} />
      </TestWrapper>
    )

    await waitFor(() => queryByText(container, 'VaultId'))
    expect(getByText('VaultName')).toBeDefined()
    expect(container).toMatchSnapshot()
  })
  test('render for VaultWithIamAMS schema', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <SavedConnectorDetails connector={VaultWithIamAMS.data.content[0].connector as ConnectorInfoDTO} />
      </TestWrapper>
    )

    await waitFor(() => queryByText(container, 'VaultId'))
    expect(getByText('VaultNameWithAMS')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('render for AwsCodeCommit schema', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <SavedConnectorDetails connector={AwsCodeCommit.data.content[0].connector as ConnectorInfoDTO} />
      </TestWrapper>
    )

    await waitFor(() => queryByText(container, 'awscodecommit'))
    expect(getByText('aws-code-commit')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('render for PDC schema', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <SavedConnectorDetails connector={PDC.data.connector as ConnectorInfoDTO} />
      </TestWrapper>
    )

    await waitFor(() => queryByText(container, 'PDCX'))
    expect(getByText('PDC')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('render for Github Repo schema', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <SavedConnectorDetails connector={GithubRepo.connector as ConnectorInfoDTO} />
      </TestWrapper>
    )

    await waitFor(() => queryByText(container, 'github-identifier'))
    expect(getByText('github')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('render for connector activity details', async () => {
    const activityData = GitHttp.data.content[0].status
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <RenderDetailsSection
          title={'Connector Activity'}
          data={getActivityDetails({
            createdAt: GitHttp.data.content[0].createdAt,
            lastTested: activityData.lastTestedAt,
            lastUpdated: GitHttp.data.content[0].lastModifiedAt,
            lastConnectionSuccess: activityData.lastConnectedAt,
            status: activityData.status
          })}
        />
      </TestWrapper>
    )
    await waitFor(() => queryByText(container, 'Connector Activity'))
    expect(getByText('connectorCreated')).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
