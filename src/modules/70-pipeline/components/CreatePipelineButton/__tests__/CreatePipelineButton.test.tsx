/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import CreatePipelineButton from '../CreatePipelineButton'

describe('CreatePipelineButton tests', () => {
  test('when supportingGitSimplification, NG_GIT_EXPERIENCE_IMPORT_FLOW are enabled SplitButton should be rendered', () => {
    const { container } = render(
      <TestWrapper
        defaultAppStoreValues={{
          supportingGitSimplification: true,
          featureFlags: { NG_GIT_EXPERIENCE_IMPORT_FLOW: true }
        }}
      >
        <CreatePipelineButton onCreatePipelineClick={jest.fn()} onImportPipelineClick={jest.fn()} iconName={'plus'} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('when supportingGitSimplification, NG_GIT_EXPERIENCE_IMPORT_FLOW are enabled and label is passed', () => {
    const { getByText } = render(
      <TestWrapper
        defaultAppStoreValues={{
          supportingGitSimplification: true,
          featureFlags: { NG_GIT_EXPERIENCE_IMPORT_FLOW: true }
        }}
      >
        <CreatePipelineButton
          onCreatePipelineClick={jest.fn()}
          onImportPipelineClick={jest.fn()}
          label={'Add Pipeline'}
        />
      </TestWrapper>
    )
    const addPipelineBtn = getByText('Add Pipeline')
    expect(addPipelineBtn).toBeDefined()
  })

  test('when supportingGitSimplification is false RbacButton should be rendered', () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ supportingGitSimplification: false }}>
        <CreatePipelineButton onCreatePipelineClick={jest.fn()} onImportPipelineClick={jest.fn()} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('when supportingGitSimplification is false and label is passed', () => {
    const { getByText } = render(
      <TestWrapper defaultAppStoreValues={{ supportingGitSimplification: false }}>
        <CreatePipelineButton
          onCreatePipelineClick={jest.fn()}
          onImportPipelineClick={jest.fn()}
          label="Add Pipeline"
        />
      </TestWrapper>
    )
    const addPipelineBtn = getByText('Add Pipeline')
    expect(addPipelineBtn).toBeDefined()
  })
})
