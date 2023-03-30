/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act } from 'react-dom/test-utils'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { EvaluationType, SLITypes, SLOV2FormFields } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import EvaluationTypePillToggle from '../EvaluationType'

describe('Validate EvaluationType', () => {
  test('should render EvaluationType', () => {
    const onChange = jest.fn()
    const { container, getByText, rerender } = render(
      <TestWrapper>
        <EvaluationTypePillToggle
          values={
            {
              [SLOV2FormFields.SERVICE_LEVEL_INDICATOR_TYPE]: SLITypes.AVAILABILITY
            } as any
          }
          onChange={onChange}
          occurenceBased={false}
        />
      </TestWrapper>
    )
    expect(getByText('cv.slos.slis.type.availability'.toUpperCase())).toBeInTheDocument()
    expect(getByText('cv.slos.slis.type.latency'.toUpperCase())).toBeInTheDocument()
    expect(container.querySelector('[data-name="toggle-option-one"]')).toHaveClass('PillToggle--selected')
    act(() => {
      fireEvent.click(container.querySelector('[data-name="toggle-option-two"]')!)
    })
    expect(onChange).toHaveBeenCalledWith(SLOV2FormFields.SERVICE_LEVEL_INDICATOR_TYPE, SLITypes.LATENCY)
    rerender(
      <TestWrapper>
        <EvaluationTypePillToggle
          values={
            {
              [SLOV2FormFields.EVALUATION_TYPE]: EvaluationType.WINDOW
            } as any
          }
          onChange={onChange}
          occurenceBased={true}
        />
      </TestWrapper>
    )
    expect(getByText('cv.slos.slis.evaluationType.window'.toUpperCase())).toBeInTheDocument()
    expect(getByText('common.request'.toUpperCase())).toBeInTheDocument()
    expect(container.querySelector('[data-name="toggle-option-one"]')).toHaveClass('PillToggle--selected')
    fireEvent.click(container.querySelector('[data-name="toggle-option-two"]')!)
    expect(onChange).toHaveBeenLastCalledWith(SLOV2FormFields.EVALUATION_TYPE, EvaluationType.REQUEST)
  })
})
