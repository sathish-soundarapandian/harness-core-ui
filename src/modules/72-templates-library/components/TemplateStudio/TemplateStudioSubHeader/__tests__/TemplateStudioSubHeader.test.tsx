/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import produce from 'immer'
import { set } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import { getTemplateContextMock } from '@templates-library/components/TemplateStudio/__tests__/stateMock'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import {
  TemplateStudioSubHeaderWithRef,
  TemplateStudioSubHeaderProps
} from '@templates-library/components/TemplateStudio/TemplateStudioSubHeader/TemplateStudioSubHeader'

jest.mock(
  '@templates-library/components/TemplateStudio/TemplateStudioSubHeader/views/TemplateStudioSubHeaderLeftView/TemplateStudioSubHeaderLeftView',
  () => ({
    ...jest.requireActual(
      '@templates-library/components/TemplateStudio/TemplateStudioSubHeader/views/TemplateStudioSubHeaderLeftView/TemplateStudioSubHeaderLeftView'
    ),
    TemplateStudioSubHeaderLeftView: () => {
      return <div className={'template-studio-sub-header-left-view-mock'}></div>
    }
  })
)

const stepTemplateContext = getTemplateContextMock(TemplateType.Step)

const baseProps: TemplateStudioSubHeaderProps = {
  onViewChange: jest.fn(),
  getErrors: jest.fn(),
  onGitBranchChange: jest.fn()
}

describe('TemplateStudioSubHeader tests', async () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should match snapshot', () => {
    const { container } = render(
      <TestWrapper>
        <TemplateContext.Provider value={stepTemplateContext}>
          <TemplateStudioSubHeaderWithRef {...baseProps} />
        </TemplateContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should match snapshot when template is updated', () => {
    const templateContext = produce(stepTemplateContext, draft => {
      set(draft, 'state.isUpdated', true)
    })
    const { container, getByRole } = render(
      <TestWrapper>
        <TemplateContext.Provider value={templateContext}>
          <TemplateStudioSubHeaderWithRef {...baseProps} />
        </TemplateContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    const discardButton = getByRole('button', { name: 'common.discard' })
    act(() => {
      fireEvent.click(discardButton)
    })
    expect(templateContext.fetchTemplate).toBeCalledWith({ forceFetch: true, forceUpdate: true })
  })

  test('should match snapshot in read only mode', () => {
    const templateContext = produce(stepTemplateContext, draft => {
      set(draft, 'isReadonly', true)
    })
    const { container } = render(
      <TestWrapper>
        <TemplateContext.Provider value={templateContext}>
          <TemplateStudioSubHeaderWithRef {...baseProps} />
        </TemplateContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
