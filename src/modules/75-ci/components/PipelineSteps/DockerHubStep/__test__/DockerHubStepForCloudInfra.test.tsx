/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { DockerHubStep } from '../DockerHubStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('../../CIStep/StepUtils', () => ({
  useGetPropagatedStageById: jest.fn(() => ({ stage: { spec: { infrastructure: { type: 'Cloud' } } } })),
  renderOptionalWrapper: ({ label, optional }: { label: JSX.Element; optional?: boolean }) => {
    if (optional) {
      return `${label} (optional)`
    } else {
      return label
    }
  }
}))

jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
  CI_ENABLE_DLC: true
})

describe('DockerHub Step', () => {
  beforeAll(() => {
    factory.registerStep(new DockerHubStep())
  })

  describe('Edit View', () => {
    test('should render properly for Cloud build infra', () => {
      const { getByText } = render(
        <TestStepWidget initialValues={{}} type={StepType.DockerHub} stepViewType={StepViewType.Edit} />
      )
      expect(getByText('ci.enableDLC')).toBeInTheDocument()
    })
  })
})
