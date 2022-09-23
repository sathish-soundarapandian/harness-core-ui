/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, Matcher, fireEvent } from '@testing-library/react'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'

import { ECRStep } from '../ECRStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('../../CIStep/StepUtils', () => ({
  useGetPropagatedStageById: jest.fn(() => ({ stage: { spec: { infrastructure: { type: 'VM' } } } })),
  renderOptionalWrapper: ({ label, optional }: { label: JSX.Element; optional?: boolean }) => {
    if (optional) {
      return `${label} (optional)`
    } else {
      return label
    }
  }
}))

describe('ECR Step', () => {
  beforeAll(() => {
    factory.registerStep(new ECRStep())
  })

  describe('Edit View', () => {
    test('should render properly for AWS VMs build infra', () => {
      const { container, getByText } = render(
        <TestStepWidget initialValues={{}} type={StepType.ECR} stepViewType={StepViewType.Edit} />
      )

      const lookupShouldFail = (text: Matcher) => {
        try {
          getByText(text)
        } catch (err) {
          expect(err).toBeTruthy()
        }
      }

      act(() => {
        fireEvent.click(getByText('common.optionalConfig'))
      })

      // Remote Cache Image field look up should fail since this field is not supported for AWS VMs Build Infra
      lookupShouldFail('ci.remoteCacheImage.label')

      expect(container).toMatchSnapshot()
    })
  })
})
