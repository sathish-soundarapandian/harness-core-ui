/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, act, queryByAttribute, fireEvent } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import * as Portal from 'services/portal'
import * as cdServices from 'services/cd-ng'
import { DeleteStackTypes } from '../../CloudFormationInterfaces.types'
import { CFCreateStack } from '../CreateStack'

jest.mock('@common/components/MonacoEditor/MonacoEditor')
jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('react-monaco-editor', () => ({ value, onChange, name }: any) => {
  return <textarea value={value} onChange={e => onChange(e.target.value)} name={name || 'spec.source.spec.script'} />
})

const renderComponent = (data: any, stepType = StepViewType.Edit) =>
  render(<TestStepWidget {...data} type={StepType.CloudFormationCreateStack} stepViewType={stepType} />)

describe('Test Cloudformation delete stack', () => {
  beforeEach(() => {
    factory.registerStep(new CFCreateStack())
  })

  test('should render edit view as new step', () => {
    const { container } = renderComponent({ initialValues: {} })
    expect(container).toMatchSnapshot()
  })
})
