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
import pipelineV2ContextData from './pipelineV2Context.json'
import ServiceV2ArtifactsSelection from '../ServiceV2ArtifactsSelection'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const getContextValue = (): PipelineContextInterface => {
  return {
    ...pipelineV2ContextData,
    getStageFromPipeline: jest.fn(() => {
      return { stage: pipelineV2ContextData.state.pipeline.stages[0], parent: undefined }
    })
  } as any
}
const fetchConnectors = (): Promise<unknown> => Promise.resolve({})

jest.mock('services/cd-ng', () => ({
  useGetImagePathsForArtifactory: jest.fn().mockImplementation(() => {
    return {
      data: {},
      error: null,
      loading: false
    }
  }),
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectors })),
  useGetServiceV2: jest.fn().mockImplementation(() => ({ loading: false, data: {}, refetch: jest.fn() })),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null }
  }),
  useGetBuildDetailsForArtifactoryArtifact: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetRepositoriesDetailsForArtifactory: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetV2BucketListForS3: jest.fn().mockImplementation(() => {
    return { data: { data: ['bucket1'] }, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetFilePathsForS3: jest.fn().mockImplementation(() => {
    return {
      data: {
        data: {
          buildDetails: { number: 'folderName/filePath1.yaml' }
        }
      },
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })
}))

jest.mock('services/template-ng', () => ({
  useGetTemplate: jest.fn().mockImplementation(() => {
    return { data: { data: {} }, loading: false }
  })
}))

jest.mock('services/portal', () => ({
  useListAwsRegions: jest.fn().mockImplementation(() => {
    return { data: { data: ['region1'] }, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('ServiceV2ArtifactsSelection Tests:', () => {
  test(`Renders without crashing`, async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ServiceV2ArtifactsSelection deploymentType="Kubernetes" isReadonlyServiceMode={false} readonly={false} />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const addArtifactSourceButton = await findByText(container, 'pipeline.artifactsSelection.addArtifactSource')
    expect(addArtifactSourceButton).toBeDefined()

    const addSidecar = await findByText(container, 'pipeline.artifactsSelection.addSidecar')
    expect(addSidecar).toBeDefined()

    const useTemplate = await findAllByText(container, 'common.useTemplate')
    expect(useTemplate.length).toBe(2)

    const toggleButton = container.querySelectorAll('.Toggle--toggleIcon')
    expect(toggleButton.length).toBe(4)

    const editButton = container.querySelectorAll('[data-icon="Edit"]')
    expect(editButton.length).toBe(7)

    const deleteButton = container.querySelectorAll('[data-icon="main-trash"]')
    expect(deleteButton.length).toBe(7)

    expect(container).toMatchSnapshot()
  })

  test(`Renders Add Artifact Source option without crashing`, async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ServiceV2ArtifactsSelection isReadonlyServiceMode={false} readonly={false} deploymentType="Kubernetes" />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const addArtifactSourceButton = await findByText(container, 'pipeline.artifactsSelection.addArtifactSource')
    expect(addArtifactSourceButton).toBeDefined()
    fireEvent.click(addArtifactSourceButton)
    const portal = document.getElementsByClassName('bp3-portal')[0]
    const artifactLabel = await waitFor(() => findByText(portal as HTMLElement, 'connectors.artifactRepoType'))
    expect(artifactLabel).toBeDefined()

    const closeButton = portal.querySelector("button[class*='bp3-dialog-close-button']") as Element
    fireEvent.click(closeButton)
    expect(container).toMatchSnapshot()
  })

  test(`Renders Artifact Connector popover`, async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ServiceV2ArtifactsSelection isReadonlyServiceMode={false} readonly={false} deploymentType="Kubernetes" />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const addArtifactSourceButton = await findByText(container, 'pipeline.artifactsSelection.addArtifactSource')
    expect(addArtifactSourceButton).toBeDefined()
    fireEvent.click(addArtifactSourceButton)
    const portal = document.getElementsByClassName('bp3-portal')[0]
    const artifactLabel = await waitFor(() => findByText(portal as HTMLElement, 'connectors.artifactRepoType'))
    expect(artifactLabel).toBeDefined()
    const artifactTypes = await waitFor(() => findAllByText(portal as HTMLElement, 'dockerRegistry'))
    expect(artifactTypes).toBeDefined()
    fireEvent.click(artifactTypes[0])
    const continueButton = await findByText(portal as HTMLElement, 'continue')
    expect(continueButton).toBeDefined()
  })

  test(`Renders edit modal without crashing`, async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ServiceV2ArtifactsSelection isReadonlyServiceMode={false} readonly={false} deploymentType="Kubernetes" />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const addArtifactSourceButton = await findByText(container, 'pipeline.artifactsSelection.addArtifactSource')
    expect(addArtifactSourceButton).toBeDefined()
    const editButton = container.querySelector('[data-icon="Edit"]')
    expect(editButton).toBeDefined()
    const deleteButton = container.querySelectorAll('[data-icon="main-trash"]')
    expect(deleteButton.length).toBe(7)
    fireEvent.click(editButton as HTMLSpanElement)
    const artifactEditModalTitle = await waitFor(() => findAllByText(container, 'artifactRepository'))
    expect(artifactEditModalTitle).toBeDefined()
  })
})
