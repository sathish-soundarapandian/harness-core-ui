/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, findByText, fireEvent, waitFor, findAllByText } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import {
  PipelineContext,
  PipelineContextInterface
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import ArtifactsSelection from '../ArtifactsSelection'
import pipelineContextMock from './pipelineContext.json'
import connectorsData from './connectors_mock.json'
import ArtifactListView from '../ArtifactListView/ArtifactListView'
import type { ArtifactListViewProps } from '../ArtifactInterface'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const getContextValue = (): PipelineContextInterface => {
  return {
    ...pipelineContextMock,
    getStageFromPipeline: jest.fn(() => {
      return { stage: pipelineContextMock.state.pipeline.stages[0], parent: undefined }
    })
  } as any
}
const fetchConnectors = (): Promise<unknown> => Promise.resolve({})

jest.mock('services/cd-ng', () => ({
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectors })),

  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null }
  })
}))

describe('ArtifactsSelection tests', () => {
  test(`renders without crashing`, () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ArtifactsSelection deploymentType="Kubernetes" isForOverrideSets={false} />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test(`renders artifact without crashing`, async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ArtifactsSelection deploymentType="Kubernetes" isForOverrideSets={false} />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const primaryArtifactContainer = await findByText(container, 'primary')
    expect(primaryArtifactContainer).toBeDefined()
  })

  test(`renders artifact when isForOverrideSets is true`, async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ArtifactsSelection
            deploymentType="Kubernetes"
            isForOverrideSets={true}
            identifierName={'overrideSetIdentifier'}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const primaryArtifact =
      pipelineContextMock.state.pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.spec.artifactOverrideSets.map(
        elem => elem.overrideSet.artifacts.primary
      )[0]
    expect(primaryArtifact.type).toBe('Dockerhub')
    const primaryArtifactContainer = await findByText(container, 'primary')
    expect(primaryArtifactContainer).toBeDefined()
  })

  test(`renders artifact when isPropagating is true`, async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ArtifactsSelection
            deploymentType="Kubernetes"
            isForOverrideSets={false}
            identifierName={'overrideSetIdentifier'}
            isPropagating={true}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const addPrimaryArtifact = await findByText(container, 'pipelineSteps.serviceTab.artifactList.addPrimary')
    expect(addPrimaryArtifact).toBeDefined()
  })

  test(`renders artifact when  isForPredefinedSets is true`, async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ArtifactsSelection
            deploymentType="Kubernetes"
            isForOverrideSets={false}
            identifierName={'overrideSetIdentifier'}
            isPropagating={false}
            isForPredefinedSets={true}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const addPrimaryArtifact = await findByText(container, 'pipelineSteps.serviceTab.artifactList.addPrimary')
    expect(addPrimaryArtifact).toBeDefined()
  })

  test(`renders artifact when overrideSetIdentifier and identifierName has some value`, async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ArtifactsSelection
            deploymentType="Kubernetes"
            isForOverrideSets={false}
            identifierName={'identifierName'}
            isPropagating={false}
            isForPredefinedSets={false}
            overrideSetIdentifier={'overrideSetIdentifier'}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders add Artifact option without crashing`, async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ArtifactsSelection deploymentType="Kubernetes" isForOverrideSets={false} isForPredefinedSets={false} />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const addFileButton = await findByText(container, 'pipelineSteps.serviceTab.artifactList.addSidecar')
    expect(addFileButton).toBeDefined()
    fireEvent.click(addFileButton)
    const portal = document.getElementsByClassName('bp3-dialog')[0]
    const artifacttLabel = await waitFor(() => findByText(portal as HTMLElement, 'connectors.artifactRepoType'))
    expect(artifacttLabel).toBeDefined()

    const closeButton = portal.querySelector("button[class*='bp3-dialog-close-button']") as Element
    fireEvent.click(closeButton)
    expect(container).toMatchSnapshot()
  })

  test(`renders Artifact Connector popover`, async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ArtifactsSelection deploymentType="Kubernetes" isForOverrideSets={false} isForPredefinedSets={false} />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const addFileButton = await findByText(container, 'pipelineSteps.serviceTab.artifactList.addSidecar')
    expect(addFileButton).toBeDefined()
    fireEvent.click(addFileButton)
    const portal = document.getElementsByClassName('bp3-dialog')[0]
    const artifacttLabel = await waitFor(() => findByText(portal as HTMLElement, 'connectors.artifactRepoType'))
    expect(artifacttLabel).toBeDefined()
    const artifactTypes = await waitFor(() => findAllByText(portal as HTMLElement, 'dockerRegistry'))
    expect(artifactTypes).toBeDefined()
    fireEvent.click(artifactTypes[0])
    const continueButton = await findByText(portal as HTMLElement, 'continue')
    expect(continueButton).toBeDefined()
  })

  test(`renders edit modal without crashing`, async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ArtifactsSelection deploymentType="Kubernetes" isForOverrideSets={false} />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const primaryArtifactContainer = await findByText(container, 'primary')
    expect(primaryArtifactContainer).toBeDefined()
    const editButton = container.querySelector('[data-icon="Edit"]')
    expect(editButton).toBeDefined()
    fireEvent.click(editButton as HTMLElement)
    const artifactEditModalTitle = await waitFor(() => findByText(container, 'artifactRepository'))
    expect(artifactEditModalTitle).toBeDefined()
  })

  test(`renders Artifact Listview without crashing`, () => {
    const props: ArtifactListViewProps = {
      primaryArtifact: {
        spec: {},
        type: 'DockerRegistry' as 'DockerRegistry' | 'Gcr' | 'Ecr'
      },
      sideCarArtifact: [],
      stage: pipelineContextMock.state.pipeline.stages[0] as any,
      addNewArtifact: jest.fn(),
      editArtifact: jest.fn(),
      removePrimary: jest.fn(),
      removeSidecar: jest.fn(),
      fetchedConnectorResponse: undefined,
      accountId: 'test',
      refetchConnectors: jest.fn(),
      isReadonly: false
    }

    const { container } = render(
      <TestWrapper>
        <ArtifactListView {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders Artifact Listview with connectors Data`, () => {
    const props: ArtifactListViewProps = {
      primaryArtifact: {
        spec: {},
        type: 'Gcr' as 'DockerRegistry' | 'Gcr' | 'Ecr'
      },
      sideCarArtifact: [],
      stage: pipelineContextMock.state.pipeline.stages[0] as any,
      addNewArtifact: jest.fn(),
      editArtifact: jest.fn(),
      removePrimary: jest.fn(),
      removeSidecar: jest.fn(),
      fetchedConnectorResponse: connectorsData.data as any,
      accountId: 'test',
      refetchConnectors: jest.fn(),
      isReadonly: false
    }
    const { container } = render(
      <TestWrapper>
        <ArtifactListView {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`artifact list renders with proper payload`, async () => {
    const props: ArtifactListViewProps = {
      primaryArtifact: {
        type: 'Ecr' as 'DockerRegistry' | 'Gcr' | 'Ecr',
        spec: {
          connectorRef: 'Test',
          imagePath: '<+input>',
          region: 'us-west-1',
          tag: '<+input>'
        }
      },
      sideCarArtifact: [
        {
          sidecar: {
            type: 'DockerRegistry' as 'DockerRegistry' | 'Gcr' | 'Ecr',
            identifier: 'sidecarId',
            spec: {
              connectorRef: 'connectorRef',
              imagePath: '<+input>',
              tag: '<+input>'
            }
          }
        }
      ],
      stage: pipelineContextMock.state.pipeline.stages[0] as any,
      addNewArtifact: jest.fn(),
      editArtifact: jest.fn(),
      removePrimary: jest.fn(),
      removeSidecar: jest.fn(),
      fetchedConnectorResponse: connectorsData.data as any,
      accountId: 'test',
      refetchConnectors: jest.fn(),
      overrideSetIdentifier: '',
      isReadonly: false
    }
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ArtifactListView {...props} />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const deleteArtifactBtn = container.querySelector('[data-icon="main-trash"]') as Element
    expect(deleteArtifactBtn).toBeDefined()
    fireEvent.click(deleteArtifactBtn)

    expect(container).toMatchSnapshot()
  })

  test(`delete artifact list works correctly`, async () => {
    const props: ArtifactListViewProps = {
      primaryArtifact: {
        spec: {},
        type: 'Gcr' as 'DockerRegistry' | 'Gcr' | 'Ecr'
      },
      sideCarArtifact: [],
      stage: pipelineContextMock.state.pipeline.stages[0] as any,
      addNewArtifact: jest.fn(),
      editArtifact: jest.fn(),
      removePrimary: jest.fn(),
      removeSidecar: jest.fn(),
      fetchedConnectorResponse: connectorsData.data as any,
      accountId: 'test',
      refetchConnectors: jest.fn(),
      overrideSetIdentifier: '',
      isReadonly: false
    }
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ArtifactListView {...props} />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const deleteArtifactBtn = container.querySelector('[data-icon="main-trash"]') as Element
    expect(deleteArtifactBtn).toBeDefined()
    fireEvent.click(deleteArtifactBtn)

    expect(container).toMatchSnapshot()
  })

  test(`edit artifact list works correctly`, async () => {
    const props: ArtifactListViewProps = {
      primaryArtifact: {
        spec: {},
        type: 'Gcr' as 'DockerRegistry' | 'Gcr' | 'Ecr'
      },
      sideCarArtifact: [],
      stage: pipelineContextMock.state.pipeline.stages[0] as any,
      addNewArtifact: jest.fn(),
      editArtifact: jest.fn(),
      removePrimary: jest.fn(),
      removeSidecar: jest.fn(),
      fetchedConnectorResponse: connectorsData.data as any,
      accountId: 'test',
      refetchConnectors: jest.fn(),
      overrideSetIdentifier: '',
      isReadonly: false
    }
    const { container } = render(
      <TestWrapper>
        <ArtifactListView {...props} />
      </TestWrapper>
    )

    const editArtifactBtn = container.querySelector('[data-icon="Edit"]') as Element
    expect(editArtifactBtn).toBeDefined()
    fireEvent.click(editArtifactBtn)

    expect(container).toMatchSnapshot()
  })

  test(`remove artifact list works correctly`, async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ArtifactsSelection deploymentType="Kubernetes" isForOverrideSets={false} />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const deleteArtifactList = container.querySelectorAll('[data-icon="main-trash"]')
    expect(deleteArtifactList.length).toBe(3)
    const remove = container.querySelectorAll('[data-icon="main-trash"]')[1]

    expect(remove).toBeDefined()
  })
})
