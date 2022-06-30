/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import {
  PipelineContext,
  PipelineContextInterface
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import pipelineContextMock from './pipelineContext.json'
import ServiceStepBasicInfo from '../ServiceConfiguration/ServiceStepBasicInfo'

const getContextValue = (): PipelineContextInterface => {
  return {
    ...pipelineContextMock,
    updatePipeline: jest.fn(() => {
      undefined
    })
  } as any
}

const pipelineMock = getContextValue()

jest.mock('formik', () => {
  const originalModule = jest.requireActual('formik')

  return {
    ...originalModule,
    validate: jest.fn(() => pipelineMock.updatePipeline)
  }
})

describe('ServiceStepBasicInfo', () => {
  test('should render ServiceStepBasicInfo', async () => {
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
        <PipelineContext.Provider value={pipelineMock}>
          <ServiceStepBasicInfo />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    fireEvent.change(screen.getByPlaceholderText('common.descriptionPlaceholder') as HTMLElement, {
      target: { value: 'New Awesome Description' }
    })
    await waitFor(() => expect(pipelineMock.updatePipeline).toHaveBeenCalled(), { timeout: 3000 })
  })
})
