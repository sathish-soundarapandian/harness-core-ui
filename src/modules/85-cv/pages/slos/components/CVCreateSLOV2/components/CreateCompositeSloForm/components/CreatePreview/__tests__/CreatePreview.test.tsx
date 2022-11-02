/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { getSLOV2InitialFormData } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.utils'
import { CreatePreview, CalenderValuePreview, LabelAndValue } from '../CreatePreview'
import { CreateCompositeSLOSteps } from '../../../CreateCompositeSloForm.types'

describe('CreatePreview', () => {
  test('should render CreatePreview with empty value', () => {
    const { container } = render(
      <TestWrapper>
        <CreatePreview id={'' as any} data={{} as any} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render CalenderValuePreview with empty value', () => {
    const { container } = render(
      <TestWrapper>
        <CalenderValuePreview
          data={
            {
              periodLengthType: undefined,
              dayOfMonth: undefined,
              dayOfWeek: undefined
            } as any
          }
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('should render CalenderValuePreview with init value', () => {
    const { container } = render(
      <TestWrapper>
        <CalenderValuePreview data={getSLOV2InitialFormData('Composite')} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render CreatePreview with init value', () => {
    const { container, rerender } = render(
      <TestWrapper>
        <CreatePreview id={CreateCompositeSLOSteps.Add_SLOs} data={getSLOV2InitialFormData('Composite')} />
      </TestWrapper>
    )
    rerender(
      <TestWrapper>
        <CreatePreview
          id={CreateCompositeSLOSteps.Define_SLO_Identification}
          data={getSLOV2InitialFormData('Composite')}
        />
      </TestWrapper>
    )
    rerender(
      <TestWrapper>
        <CreatePreview id={CreateCompositeSLOSteps.Set_SLO_Time_Window} data={getSLOV2InitialFormData('Composite')} />
      </TestWrapper>
    )
    rerender(
      <TestWrapper>
        <CreatePreview id={CreateCompositeSLOSteps.Add_SLOs} data={getSLOV2InitialFormData('Composite')} />
      </TestWrapper>
    )
    rerender(
      <TestWrapper>
        <CreatePreview id={CreateCompositeSLOSteps.Set_SLO_Target} data={getSLOV2InitialFormData('Composite')} />
      </TestWrapper>
    )
    rerender(
      <TestWrapper>
        <CreatePreview id={CreateCompositeSLOSteps.Error_Budget_Policy} data={getSLOV2InitialFormData('Composite')} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render LabelAndValue with empty values', () => {
    const { container } = render(
      <TestWrapper>
        <LabelAndValue label="" value="" />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
