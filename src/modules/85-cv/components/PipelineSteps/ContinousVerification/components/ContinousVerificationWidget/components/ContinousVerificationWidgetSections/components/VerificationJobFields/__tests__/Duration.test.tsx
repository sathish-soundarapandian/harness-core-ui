/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import * as useFeatureFlagMock from '@common/hooks/useFeatureFlag'
import { TestWrapper } from '@common/utils/testUtils'
import { durationOptions, extendedDurationOptions } from '@cv/components/PipelineSteps/ContinousVerification/constants'
import { Duration, Baseline } from '../VerificationJobFields'

describe('Verify Duration component', () => {
  test('should render extended options', async () => {
    jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(true)
    const props = {
      label: 'TestDuration',
      name: 'testDuration',
      isSimpleDropdown: false,
      allowableTypes: [],
      formik: {
        values: {
          testDuration: { label: '30 min', value: '30m' }
        }
      } as any
    }
    const { container } = render(
      <TestWrapper>
        <Duration {...props} />
      </TestWrapper>
    )

    const durationDropdown = container.querySelector('[data-icon="chevron-down"]') as HTMLInputElement

    await act(() => {
      fireEvent.click(durationDropdown)
    })
    const durationList = [...durationOptions, ...extendedDurationOptions]
    await waitFor(() => {
      expect(document.querySelectorAll('ul.bp3-menu li').length).toEqual(8)
      document.querySelectorAll('ul.bp3-menu li').forEach((item, index) => {
        expect(item.textContent).toEqual(durationList[index]?.label)
      })
    })

    await act(() => {
      fireEvent.click(document.querySelectorAll('ul.bp3-menu li')[5])
    })

    expect(container.querySelector('input[name="testDuration"]')).toHaveValue('1 hr')
  })

  test('should render without extended options', async () => {
    jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(false)
    const props = {
      label: 'TestDuration',
      name: 'testDuration',
      isSimpleDropdown: false,
      allowableTypes: [],
      formik: {
        values: {
          testDuration: { label: '30 min', value: '30m' }
        }
      } as any
    }
    const { container } = render(
      <TestWrapper>
        <Duration {...props} />
      </TestWrapper>
    )

    const durationDropdown = container.querySelector('[data-icon="chevron-down"]') as HTMLInputElement

    await act(() => {
      fireEvent.click(durationDropdown)
    })
    const durationList = [...durationOptions]
    await waitFor(() => {
      expect(document.querySelectorAll('ul.bp3-menu li').length).toEqual(4)
      document.querySelectorAll('ul.bp3-menu li').forEach((item, index) => {
        expect(item.textContent).toEqual(durationList[index]?.label)
      })
    })
  })

  test('should render Baseline', async () => {
    const baseLineOption = [
      { label: 'cv.lastSuccessfulRun', value: 'LAST' },
      { label: 'cv.pinABaseline', value: 'PIN' }
    ]
    const props = {
      label: 'TestBaseline',
      name: 'TestBaseline',
      isSimpleDropdown: false,
      allowableTypes: [],
      formik: {} as any
    }
    const { container } = render(
      <TestWrapper>
        <Baseline {...props} />
      </TestWrapper>
    )

    const durationDropdown = container.querySelector('[data-icon="chevron-down"]') as HTMLInputElement

    await act(() => {
      fireEvent.click(durationDropdown)
    })

    await waitFor(() => {
      expect(document.querySelectorAll('ul.bp3-menu li').length).toEqual(2)
      document.querySelectorAll('ul.bp3-menu li').forEach((item, index) => {
        expect(item.textContent).toEqual(baseLineOption[index]?.label)
      })
    })
    expect(container).toMatchSnapshot()
  })
})
