/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { DeploymentContextProvider } from '@cd/context/DeploymentContext/DeploymentContextProvider'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { TestWrapper } from '@common/utils/testUtils'
import { DeployStageErrorProvider, StageErrorContext } from '@pipeline/context/StageErrorContext'
import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudioInternal'
import { DeploymentConfigFormWithRef } from '../DeploymentTemplateForm/DeploymentConfigForm'
import { defaultInitialValues } from '../DeploymentTemplateForm/DeploymentInfraWrapper/__tests__/mocks'
import { DeploymentTemplateCanvasWrapperWithRef } from '../DeploymentTemplateCanvasWrapper'

jest.mock('@cd/components/TemplateStudio/DeploymentTemplateCanvas/DeploymentConfigCanvas', () => ({
  ...(jest.requireActual('@cd/components/TemplateStudio/DeploymentTemplateCanvas/DeploymentConfigCanvas') as any),
  DeploymentConfigCanvasWithRef: () => {
    return <div className="deployment-template-canvas-mock" />
  }
}))

const DeploymentContextWrapper = ({
  initialValue,
  children
}: React.PropsWithChildren<{ initialValue: any }>): JSX.Element => (
  <DeploymentContextProvider
    deploymentConfigInitialValues={initialValue}
    onDeploymentConfigUpdate={jest.fn()}
    isReadOnly={false}
    gitDetails={{}}
    queryParams={{ accountIdentifier: 'accountId', orgIdentifier: '', projectIdentifier: '' }}
    stepsFactory={{} as AbstractStepFactory}
  >
    {children}
  </DeploymentContextProvider>
)

describe('<StepTemplateCanvas /> test', () => {
  test('Should match snapshot', () => {
    const { container } = render(
      <TestWrapper>
        <DeploymentContextWrapper initialValue={defaultInitialValues}>
          <DeploymentTemplateCanvasWrapperWithRef />
        </DeploymentContextWrapper>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    expect(container.querySelector('.deployment-template-canvas-mock')).toBeInTheDocument()
  })
})

describe('<DeploymentConfigCanvasWithRef /> test', () => {
  test('Should match snapshot', () => {
    const errorContextProvider = {
      state: {} as any,
      checkErrorsForTab: jest.fn().mockResolvedValue(Promise.resolve()),
      subscribeForm: jest.fn(),
      unSubscribeForm: () => undefined,
      submitFormsForTab: jest.fn()
    }
    const ref = React.createRef<TemplateFormRef<unknown>>()
    const { container, getByText } = render(
      <TestWrapper>
        <DeployStageErrorProvider>
          <StageErrorContext.Provider value={errorContextProvider}>
            <DeploymentConfigFormWithRef ref={ref as any} />
          </StageErrorContext.Provider>
        </DeployStageErrorProvider>
      </TestWrapper>
    )
    const continueBtn = getByText('continue')
    fireEvent.click(continueBtn)
    const spinner = container.querySelector('.bp3-spinner')
    expect(spinner).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
