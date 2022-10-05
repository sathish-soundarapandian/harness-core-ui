/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { MultiTypeInputType } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'
import { factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import type { K8SDirectServiceStep } from '@pipeline/factories/ArtifactTriggerInputFactory/types'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { getDummyPipelineCanvasContextValue } from './CustomDeploymentServiceSpecHelper'
import { CustomDeploymentServiceSpec } from '../CustomDeploymentServiceSpec'

factory.registerStep(new CustomDeploymentServiceSpec())
describe('CustomDeploymentServiceSpec tests', () => {
  describe('When stepViewType is Edit', () => {
    test('render properly when stepViewType is Edit', () => {
      const contextValue = getDummyPipelineCanvasContextValue({
        isLoading: false
      })
      const { container } = render(
        <TestWrapper>
          <PipelineContext.Provider value={contextValue}>
            <StepWidget<K8SDirectServiceStep>
              factory={factory}
              allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
              initialValues={{}}
              type={StepType.CustomDeploymentServiceSpec}
              stepViewType={StepViewType.Edit}
            />
          </PipelineContext.Provider>
        </TestWrapper>
      )

      expect(container).toMatchSnapshot()
    })
  })

  describe('When stepViewType is InputSet', () => {
    test(`render properly when stepViewType is InputSet`, () => {
      const contextValue = getDummyPipelineCanvasContextValue({
        isLoading: false
      })
      const { container } = render(
        <TestWrapper>
          <PipelineContext.Provider value={contextValue}>
            <StepWidget<K8SDirectServiceStep>
              factory={factory}
              allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
              initialValues={{}}
              type={StepType.CustomDeploymentServiceSpec}
              stepViewType={StepViewType.InputSet}
            />
          </PipelineContext.Provider>
        </TestWrapper>
      )

      expect(container).toMatchSnapshot()
    })
  })

  describe('When stepViewType is InputVariable', () => {
    test(`render properly when stepViewType is InputVariable`, () => {
      const contextValue = getDummyPipelineCanvasContextValue({
        isLoading: false
      })
      const { container } = render(
        <TestWrapper>
          <PipelineContext.Provider value={contextValue}>
            <StepWidget<K8SDirectServiceStep>
              factory={factory}
              allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
              initialValues={{}}
              type={StepType.CustomDeploymentServiceSpec}
              stepViewType={StepViewType.InputVariable}
              customStepProps={{
                variablesData: {}
              }}
            />
          </PipelineContext.Provider>
        </TestWrapper>
      )

      expect(container).toMatchSnapshot()
    })
  })
})
