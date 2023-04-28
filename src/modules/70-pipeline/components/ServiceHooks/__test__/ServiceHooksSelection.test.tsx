/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import {
  PipelineContext,
  PipelineContextInterface
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import ServiceHooksSelection from '../ServiceHooks'
import { pipelineMock } from './pipelineContext'
import { getServiceHooksHeaderTooltipId } from '../ServiceHooksHelper'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const getContextValue = (): PipelineContextInterface => {
  return {
    ...pipelineMock,
    getStageFromPipeline: jest.fn(() => {
      return { stage: pipelineMock.state.pipeline.stages[0], parent: undefined }
    })
  } as any
}

describe('Service Hooks rendering', () => {
  test(`validate initial rendering`, async () => {
    render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ServiceHooksSelection isReadonlyServiceMode={false} readonly={false} deploymentType="Kubernetes" />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const addBtn = screen.getByText('pipeline.serviceHooks.addServiceHook')
    expect(addBtn).toBeInTheDocument()

    fireEvent.click(addBtn)

    const dialog = document.body.querySelector('.bp3-dialog') as HTMLElement
    const closeBtn = dialog.querySelector('.bp3-minimal') as HTMLElement

    fireEvent.click(closeBtn)

    expect(screen.getByText('pipeline.serviceHooks.addServiceHook')).toBeInTheDocument()
  })
  test('returns the correct tooltip ID for a given deployment type', () => {
    const deploymentType = 'Kubernetes'
    const tooltipId = getServiceHooksHeaderTooltipId(deploymentType)
    expect(tooltipId).toEqual('KubernetesDeploymentTypeServiceHooks')
  })
})
