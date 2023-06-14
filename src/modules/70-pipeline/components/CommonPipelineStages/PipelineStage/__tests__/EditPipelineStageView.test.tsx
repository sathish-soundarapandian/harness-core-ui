/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, screen, RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import type { TemplateSummaryResponse } from 'services/template-ng'
import { EditPipelineStageView } from '../EditPipelineStageView'
import { editPipelineStageProps } from './PipelineStageHelper'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const intersectionObserverMock = () => ({
  observe: () => null,
  unobserve: () => null
})

window.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock)

const mockSubmit = jest.fn()
const mockOnChange = jest.fn()
const renderComponent = (template?: TemplateSummaryResponse): RenderResult => {
  return render(
    <TestWrapper>
      <EditPipelineStageView
        {...editPipelineStageProps}
        {...(template && { template })}
        onSubmit={mockSubmit}
        onChange={mockOnChange}
      />
    </TestWrapper>
  )
}

describe('Edit Pipeline stage view test', () => {
  test('should onSubmit be called on submit button click when template is provided', async () => {
    renderComponent({
      accountId: 'accountId',
      description: 'description',
      identifier: 'identifier',
      name: 'name',
      orgIdentifier: 'orgIdentifier',
      projectIdentifier: 'projectIdentifier'
    })

    userEvent.type(screen.getByRole('textbox'), 'stagename')
    userEvent.click(screen.getByText('pipelineSteps.build.create.setupStage'))
    await waitFor(() =>
      expect(mockSubmit).toBeCalledWith(
        {
          stage: {
            name: 'stagename',
            identifier: 'stagename',
            template: {
              templateInputs: undefined,
              templateRef: 'identifier'
            }
          }
        },
        'stagename'
      )
    )
  })

  test('should onSubmit be called on submit button click when no template is provided', async () => {
    renderComponent()

    await userEvent.click(screen.getByText('pipelineSteps.build.create.setupStage'))
    expect(await screen.findByText('fieldRequired')).toBeDefined()
    await userEvent.type(screen.getByRole('textbox'), 'stagename')
    await userEvent.click(screen.getByTestId('description-edit'))
    await userEvent.type(await screen.findByPlaceholderText('common.descriptionPlaceholder'), 'stageDescription')

    await userEvent.click(screen.getByText('pipelineSteps.build.create.setupStage'))
    await waitFor(() =>
      expect(mockSubmit).toBeCalledWith(
        {
          stage: {
            name: 'stagename',
            identifier: 'stagename',
            description: 'stageDescription',
            spec: {
              org: 'default',
              pipeline: 'childPip',
              project: 'Fardeen'
            },
            type: 'Pipeline'
          }
        },
        'stagename'
      )
    )
  })
})
