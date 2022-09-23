/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'
import { act, render, waitFor } from '@testing-library/react'
import { fireEvent } from '@testing-library/dom'
import { mockTemplates, mockTemplatesSuccessResponse } from '@templates-library/TemplatesTestHelper'
import { TestWrapper } from '@common/utils/testUtils'
import templateFactory from '@templates-library/components/Templates/TemplatesFactory'
import { StepTemplate } from '@templates-library/components/Templates/StepTemplate/StepTemplate'
import { TemplateSettingsModal } from '../TemplateSettingsModal'

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => mockTemplatesSuccessResponse)
}))

jest.mock('services/template-ng', () => ({
  ...(jest.requireActual('services/template-ng') as any),
  useUpdateStableTemplate: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        status: 'SUCCESS',
        data: {}
      })
    }),
    refetch: jest.fn()
  }))
}))

const baseProps = {
  templateIdentifier: defaultTo(mockTemplates.data?.content?.[0].identifier, ''),
  onSuccess: jest.fn(),
  onClose: jest.fn()
}

describe('<TemplateSettingsModal /> tests', () => {
  beforeAll(() => {
    templateFactory.registerTemplate(new StepTemplate())
  })
  test('should match snapshot', async () => {
    const { container } = render(
      <TestWrapper>
        <TemplateSettingsModal {...baseProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should call onClose when cancel button is clicked', async () => {
    const { getByRole } = render(
      <TestWrapper>
        <TemplateSettingsModal {...baseProps} />
      </TestWrapper>
    )
    const cancelBtn = getByRole('button', { name: 'cancel' })
    act(() => {
      fireEvent.click(cancelBtn)
    })
    await waitFor(() => expect(baseProps.onClose).toBeCalled())
  })

  test('should call onSuccess when save button is clicked successfully', async () => {
    const { getByRole } = render(
      <TestWrapper>
        <TemplateSettingsModal {...baseProps} />
      </TestWrapper>
    )
    const saveBtn = getByRole('button', { name: 'save' })
    act(() => {
      fireEvent.click(saveBtn)
    })
    await waitFor(() => expect(baseProps.onSuccess).toBeCalled())
  })
})
