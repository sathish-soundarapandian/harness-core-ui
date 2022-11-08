/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, findByText, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TestWrapper } from '@common/utils/testUtils'
import {
  PipelineContext,
  PipelineContextInterface
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import ConfigFilesSelection from '../ConfigFilesSelection'
import { pipelineMock } from './pipelineContext'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const getContextValue = (): PipelineContextInterface => {
  return {
    ...pipelineMock,
    getStageFromPipeline: jest.fn(() => {
      return { stage: pipelineMock.state.pipeline.stages[0], parent: undefined }
    })
  } as any
}

describe('ConfigFilesSelection tests', () => {
  test(`renders without crashing`, async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ConfigFilesSelection isReadonlyServiceMode={false} readonly={false} deploymentType="Ssh" />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const addBtn = await findByText(container, 'pipeline.configFiles.addConfigFile')
    expect(addBtn).toBeInTheDocument()
    act(() => {
      userEvent.click(addBtn)
    })
    const dialog = document.body.querySelector('.bp3-dialog') as HTMLElement
    const closeBtn = dialog.querySelector('.bp3-minimal') as HTMLElement
    act(() => {
      userEvent.click(closeBtn)
    })
    expect(container).toBeInTheDocument()
  })
})
