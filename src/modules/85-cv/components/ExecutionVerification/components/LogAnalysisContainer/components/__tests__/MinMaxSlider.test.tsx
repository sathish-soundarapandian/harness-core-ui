import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import MultiRangeSlider from '../MinMaxSlider'
import type { MultiRangeSliderProps } from '../LogAnalysisRadarChart.types'

jest.useFakeTimers('modern')

const WrappedComponent = (props: MultiRangeSliderProps): JSX.Element => {
  return (
    <TestWrapper>
      <MultiRangeSlider {...props} />
    </TestWrapper>
  )
}

describe('MinMaxSlider', () => {
  test('should test whether it takes correct min and max values passed via props', () => {
    const onChangeFn = jest.fn()
    render(<WrappedComponent min={10} max={100} onChange={onChangeFn} />)

    expect(screen.getByTestId('MinMaxSlider_MinInput')).toBeInTheDocument()
    expect(screen.getByTestId('MinMaxSlider_MaxInput')).toBeInTheDocument()

    expect(screen.getByTestId('MinMaxSlider_MinInput')).toHaveValue('10')
    expect(screen.getByTestId('MinMaxSlider_MaxInput')).toHaveValue('100')

    fireEvent.change(screen.getByTestId('MinMaxSlider_MinInput'), {
      target: { value: '20' }
    })

    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(onChangeFn).toHaveBeenCalledWith({ max: 100, min: 20 })
    expect(screen.getByTestId('MinMaxSlider_MinInput')).toHaveValue('20')

    fireEvent.change(screen.getByTestId('MinMaxSlider_MaxInput'), {
      target: { value: '80' }
    })

    expect(onChangeFn).toHaveBeenCalledWith({ max: 100, min: 20 })
    expect(screen.getByTestId('MinMaxSlider_MaxInput')).toHaveValue('80')
  })

  test('should reset the min and max values when reset button is clicked', () => {
    const onChangeFn = jest.fn()
    render(<WrappedComponent min={10} max={100} onChange={onChangeFn} />)

    expect(screen.getByTestId('MinMaxSlider_MinInput')).toHaveValue('10')
    expect(screen.getByTestId('MinMaxSlider_MaxInput')).toHaveValue('100')

    fireEvent.change(screen.getByTestId('MinMaxSlider_MinInput'), {
      target: { value: '20' }
    })

    fireEvent.change(screen.getByTestId('MinMaxSlider_MaxInput'), {
      target: { value: '80' }
    })

    expect(screen.getByTestId('MinMaxSlider_MinInput')).toHaveValue('20')
    expect(screen.getByTestId('MinMaxSlider_MaxInput')).toHaveValue('80')

    fireEvent.click(screen.getByTestId('MinMaxSlider_reset'))

    expect(screen.getByTestId('MinMaxSlider_MinInput')).toHaveValue('10')
    expect(screen.getByTestId('MinMaxSlider_MaxInput')).toHaveValue('100')

    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(onChangeFn).toHaveBeenCalledWith({ max: 100, min: 10 })
  })

  test('should test the MinMaxSlider_Range have correct width', () => {
    const onChangeFn = jest.fn()
    render(<WrappedComponent min={10} max={100} onChange={onChangeFn} />)

    expect(screen.getByTestId('MinMaxSlider_Range').style.left).toBe('0%')
    expect(screen.getByTestId('MinMaxSlider_Range').style.width).toBe('100%')

    fireEvent.change(screen.getByTestId('MinMaxSlider_MinInput'), {
      target: { value: '20' }
    })

    fireEvent.change(screen.getByTestId('MinMaxSlider_MaxInput'), {
      target: { value: '80' }
    })

    expect(screen.getByTestId('MinMaxSlider_Range').style.left).toBe('11%')
    expect(screen.getByTestId('MinMaxSlider_Range').style.width).toBe('67%')
  })
})
