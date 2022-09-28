/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { render, getByText, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import {
  PipelineContext,
  PipelineContextInterface
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import * as cdngServices from 'services/cd-ng'
import { ServiceContext, ServiceContextValues } from '@cd/context/ServiceContext'
import {
  pipelineContext,
  mockStageReturnWithoutManifestData,
  serviceConfigProps,
  serviceSchemaMock,
  serviceContextData
} from './ServiceConfigHelper'

import ServiceConfiguration from '../ServiceConfiguration'

jest.mock('yaml', () => {
  const originalModule = jest.requireActual('yaml')

  return {
    ...originalModule,
    parse: jest.fn(() => serviceConfigProps)
  }
})

jest.spyOn(cdngServices, 'useGetEntityYamlSchema').mockImplementation(() => {
  return { serviceSchemaMock } as any
})

jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => ({ onChange }: YamlBuilderProps) => {
  useEffect(() => {
    onChange ? onChange(true) : null
  }, [])

  return 'dummy'
})

jest.mock('yaml', () => {
  const originalModule = jest.requireActual('yaml')

  return {
    ...originalModule,
    parse: jest.fn(() => serviceConfigProps)
  }
})

const getContextValue = (mockData: any): PipelineContextInterface => {
  return {
    ...pipelineContext,
    getStageFromPipeline: jest.fn(() => mockData),
    updateStage: jest.fn(),
    updatePipeline: jest.fn(),
    updatePipelineView: jest.fn(),
    setView: jest.fn()
  } as any
}

const pipelineMockData = getContextValue(mockStageReturnWithoutManifestData)

describe('Service Configuration', () => {
  test('renders correctly', () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services/:serviceIdentifier?tab=configuration"
        pathParams={{
          accountId: 'dummy',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          serviceIdentifier: 'dummy'
        }}
      >
        <PipelineContext.Provider value={pipelineMockData}>
          <ServiceConfiguration serviceData={serviceConfigProps} />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('handle switch from visual to yaml', async () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services/:serviceIdentifier?tab=configuration"
        pathParams={{
          accountId: 'dummy',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          serviceIdentifier: 'dummy'
        }}
      >
        <PipelineContext.Provider value={pipelineMockData}>
          <ServiceConfiguration serviceData={serviceConfigProps} />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const toggleYamlEl = getByText(container, 'YAML') as HTMLElement
    expect(toggleYamlEl).toBeTruthy()
    fireEvent.click(toggleYamlEl)
    expect(container).toMatchSnapshot()
    const toggleVisualEl = getByText(container, 'VISUAL') as HTMLElement
    expect(toggleVisualEl).toBeTruthy()
    fireEvent.click(toggleVisualEl)

    await waitFor(() => expect(pipelineMockData.updatePipeline).toHaveBeenCalled(), { timeout: 3000 })
  })
  test('test the rbac functionality to update readonly context value', async () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services/:serviceIdentifier?tab=configuration"
        pathParams={{
          accountId: 'dummy',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          serviceIdentifier: 'dummy'
        }}
      >
        <PipelineContext.Provider value={pipelineMockData}>
          <ServiceConfiguration serviceData={serviceConfigProps} />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const toggleYamlEl = getByText(container, 'YAML') as HTMLElement
    expect(toggleYamlEl).toBeTruthy()
    fireEvent.click(toggleYamlEl)
    expect(container).toMatchSnapshot()
    const rbacButton = getByText(container, 'common.editYaml') as HTMLElement
    expect(rbacButton).toBeTruthy()
    fireEvent.click(rbacButton)
    await waitFor(() => expect(pipelineMockData.updatePipelineView).toHaveBeenCalled(), { timeout: 3000 })
  })
  test('test onChange YAML called', async () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services/:serviceIdentifier?tab=configuration"
        pathParams={{
          accountId: 'dummy',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          serviceIdentifier: 'dummy'
        }}
      >
        <PipelineContext.Provider value={pipelineMockData}>
          <ServiceConfiguration serviceData={serviceConfigProps} />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const toggleYamlEl = getByText(container, 'YAML') as HTMLElement
    expect(toggleYamlEl).toBeTruthy()
    fireEvent.click(toggleYamlEl)
    await waitFor(() => expect(pipelineMockData.updatePipeline).toHaveBeenCalled(), { timeout: 3000 })
  })
  test('null renders correctly', () => {
    pipelineMockData.state.pipeline.identifier = '-1'
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services/:serviceIdentifier?tab=configuration"
        pathParams={{
          accountId: 'dummy',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          serviceIdentifier: 'dummy'
        }}
      >
        <ServiceContext.Provider value={serviceContextData as ServiceContextValues}>
          <PipelineContext.Provider value={pipelineMockData}>
            <ServiceConfiguration serviceData={serviceConfigProps} />
          </PipelineContext.Provider>
        </ServiceContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
