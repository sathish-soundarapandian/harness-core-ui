/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, getByRole, render } from '@testing-library/react'
import produce from 'immer'
import { set, unset } from 'lodash-es'
import { getTemplateContextMock } from '@templates-library/components/TemplateStudio/__tests__/stateMock'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import { TestWrapper } from '@common/utils/testUtils'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import { DrawerTypes } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateActions'
import type { StepPaletteProps } from '@pipeline/components/PipelineStudio/StepPalette/StepPalette'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, templatePathProps } from '@common/utils/routeUtils'
import { RightDrawer } from '../RightDrawer'

jest.mock('@blueprintjs/core', () => ({
  ...jest.requireActual('@blueprintjs/core'),
  Drawer: ({ children, title }: any) => (
    <div className="drawer-mock">
      {title}
      {children}
    </div>
  )
}))

jest.mock('@pipeline/components/PipelineStudio/StepPalette/StepPalette', () => ({
  StepPalette: (props: StepPaletteProps) => {
    return (
      <div className="step-palette-mock">
        <button
          onClick={() => {
            props.onSelect({ name: 'HTTP Step', type: StepType.HTTP, icon: 'http-step' })
          }}
        >
          Select Step
        </button>
      </div>
    )
  }
}))

jest.mock('@templates-library/components/TemplateStudio/TemplateVariables/TemplateVariables', () => ({
  __esModule: true,
  default: () => {
    return <div className="template-variables-wrapper-mock"></div>
  }
}))

jest.mock('@templates-library/components/TemplateInputs/TemplateInputs', () => ({
  TemplateInputs: () => {
    return <div className="template-inputs-mock"></div>
  }
}))

const stepTemplateContextMock = produce(getTemplateContextMock(TemplateType.Step), draft => {
  set(draft, 'state.gitDetails', {
    repoIdentifier: 'repoIdentifier',
    branch: 'branch'
  })
  unset(draft, 'state.templateView.drawerData.data')
})
const PATH = routes.toTemplateStudio({ ...accountPathProps, ...templatePathProps, ...pipelineModuleParams })
const PATH_PARAMS = {
  templateIdentifier: 'Test_Http_Template',
  accountId: 'accountId',
  orgIdentifier: 'default',
  projectIdentifier: 'Yogesh_Test',
  module: 'cd',
  templateType: 'Step'
}

describe('<RightDrawer /> tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should match snapshot for AddStep drawer type', () => {
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <TemplateContext.Provider value={stepTemplateContextMock}>
          <RightDrawer />
        </TemplateContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should match snapshot for TemplateInputs drawer type', () => {
    const templateContext = produce(stepTemplateContextMock, draft => {
      set(draft, 'state.templateView.drawerData.type', DrawerTypes.TemplateInputs)
    })
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <TemplateContext.Provider value={templateContext}>
          <RightDrawer />
        </TemplateContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should match snapshot for TemplateVariables drawer type', () => {
    const templateContext = produce(stepTemplateContextMock, draft => {
      set(draft, 'state.templateView.drawerData.type', DrawerTypes.TemplateVariables)
    })
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <TemplateContext.Provider value={templateContext}>
          <RightDrawer />
        </TemplateContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should close on clicking on close button', async () => {
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <TemplateContext.Provider value={stepTemplateContextMock}>
          <RightDrawer />
        </TemplateContext.Provider>
      </TestWrapper>
    )
    const closeBtn = getByRole(container, 'button', { name: 'cross' })
    await act(async () => {
      fireEvent.click(closeBtn)
    })
    expect(stepTemplateContextMock.updateTemplateView).toBeCalledWith(
      expect.objectContaining({
        drawerData: { type: DrawerTypes.AddStep },
        isDrawerOpened: false
      })
    )
  })

  test('should work on step selection 1', async () => {
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <TemplateContext.Provider value={stepTemplateContextMock}>
          <RightDrawer />
        </TemplateContext.Provider>
      </TestWrapper>
    )

    const selectStepButton = getByRole(container, 'button', { name: 'Select Step' })
    await act(async () => {
      fireEvent.click(selectStepButton)
    })
    expect.anything()
  })

  test('should work on step selection 2', async () => {
    const templateContextMock = produce(stepTemplateContextMock, draft => {
      set(draft, 'state.templateView.drawerData.data', {})
    })
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <TemplateContext.Provider value={templateContextMock}>
          <RightDrawer />
        </TemplateContext.Provider>
      </TestWrapper>
    )

    const selectStepButton = getByRole(container, 'button', { name: 'Select Step' })
    await act(async () => {
      fireEvent.click(selectStepButton)
    })
    expect.anything()
  })

  test('should work on step selection 3', async () => {
    const templateContextMock = produce(stepTemplateContextMock, draft => {
      set(draft, 'state.templateView.drawerData.data.paletteData', {})
    })
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <TemplateContext.Provider value={templateContextMock}>
          <RightDrawer />
        </TemplateContext.Provider>
      </TestWrapper>
    )

    const selectStepButton = getByRole(container, 'button', { name: 'Select Step' })
    await act(async () => {
      fireEvent.click(selectStepButton)
    })
    expect.anything()
  })

  test('should work on step selection 4', async () => {
    const templateContextMock = produce(stepTemplateContextMock, draft => {
      set(draft, 'state.templateView.drawerData.data.paletteData.onSelection', jest.fn())
    })
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <TemplateContext.Provider value={templateContextMock}>
          <RightDrawer />
        </TemplateContext.Provider>
      </TestWrapper>
    )

    const selectStepButton = getByRole(container, 'button', { name: 'Select Step' })
    await act(async () => {
      fireEvent.click(selectStepButton)
    })
    expect(templateContextMock.state.templateView.drawerData.data?.paletteData?.onSelection).toBeCalledWith({
      identifier: '',
      name: '',
      type: 'Http'
    })
  })
})
