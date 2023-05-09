/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render, screen } from '@testing-library/react'
import * as Formik from 'formik'

import React from 'react'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import { InlineEntityFiltersStep } from '../../InlineEntityFiltersStep'

const iValues = {
  type: StepType.InlineEntityFilters,
  identifier: 'inlineEntity'
}

const useFormikContextMock = jest.spyOn(Formik, 'useFormikContext')
const setFieldValueMock = jest.fn()
const formikValuesMock = {
  type: StepType.InlineEntityFilters,
  identifier: 'inlineEntity'
}
describe('Inline Entity Filters Widget tests', () => {
  beforeEach(() => {
    factory.registerStep(new InlineEntityFiltersStep())

    jest.clearAllMocks()

    useFormikContextMock.mockReturnValue({
      isValid: true,
      setFieldValue: setFieldValueMock,
      values: formikValuesMock
    } as unknown as any)
  })
  test('initial render flow', () => {
    render(
      <TestStepWidget initialValues={iValues} type={StepType.InlineEntityFilters} stepViewType={StepViewType.Edit} />
    )

    expect(screen.getByLabelText('common.deployToFilteredList')).toBeVisible()
    expect(screen.getByLabelText('common.selectNameManually')).toBeVisible()
  })
})
