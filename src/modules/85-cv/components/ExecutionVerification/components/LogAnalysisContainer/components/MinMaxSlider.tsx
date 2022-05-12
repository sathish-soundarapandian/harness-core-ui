import React, { ChangeEvent, useCallback, useEffect, useState, useRef } from 'react'
import { Color, Button, ButtonVariation, Container, Layout } from '@harness/uicore'
import { debounce } from 'lodash-es'
import classnames from 'classnames'
import { useStrings } from 'framework/strings'
import type { MinMaxAngleState } from '../LogAnalysisView.container.types'
import type { MultiRangeSliderProps } from './LogAnalysisRadarChart.types'
import css from './MinMaxSlider.module.scss'

const MultiRangeSlider: React.FC<MultiRangeSliderProps> = ({ min, max, step = 0, onChange }) => {
  const [minVal, setMinVal] = useState(min)
  const [maxVal, setMaxVal] = useState(max)
  const minValRef = useRef<HTMLInputElement>(null)
  const maxValRef = useRef<HTMLInputElement>(null)
  const maxValNumberRef = useRef<HTMLInputElement>(null)
  const minValNumberRef = useRef<HTMLInputElement>(null)
  const range = useRef<HTMLDivElement>(null)

  const { getString } = useStrings()

  const isMounted = useRef(false)

  // Convert to percentage
  const getPercent = useCallback((value: number) => Math.round(((value - min) / (max - min)) * 100), [min, max])

  const handleReset = useCallback(() => {
    setMinVal(min)
    setMaxVal(max)
  }, [min, max])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const delayedOnChange = useCallback(
    debounce((updatedAngle: MinMaxAngleState) => onChange(updatedAngle), 300),
    [onChange]
  )

  const handleMaxChangeValue = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = Math.max(+event.target.value, minVal + 1)
      setMaxVal(value)
      event.target.value = value.toString()
    },
    [setMaxVal, minVal]
  )

  const handleMinChangeValue = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = Math.min(+event.target.value, maxVal - 1)
      setMinVal(value)
      event.target.value = value.toString()
    },
    [setMinVal, maxVal]
  )

  // Set width of the range to decrease from the left side
  useEffect(() => {
    if (maxValRef.current) {
      const minPercent = getPercent(minVal)
      const maxPercent = getPercent(+maxValRef.current.value) // Precede with '+' to convert the value from type string to type number

      if (range.current) {
        range.current.style.left = `${minPercent}%`
        range.current.style.width = `${maxPercent - minPercent}%`
      }

      if (minValNumberRef.current) {
        minValNumberRef.current.style.left = `calc(${minPercent}% - 5px)`
      }
    }
  }, [minVal, getPercent])

  // Set width of the range to decrease from the right side
  useEffect(() => {
    if (minValRef.current) {
      const minPercent = getPercent(+minValRef.current.value)
      const maxPercent = getPercent(maxVal)

      if (range.current) {
        range.current.style.width = `${maxPercent - minPercent}%`
      }

      if (maxValNumberRef.current) {
        maxValNumberRef.current.style.right = `calc(${Math.abs(maxPercent - 100)}% - 10px)`
      }
    }
  }, [maxVal, getPercent])

  // Get min and max values when their state changes
  useEffect(() => {
    // To prevent calling onChange during mount
    if (isMounted.current) {
      delayedOnChange({ min: minVal, max: maxVal })
    } else {
      isMounted.current = true
    }
  }, [minVal, maxVal, delayedOnChange])

  return (
    <Layout.Vertical style={{ alignItems: 'center', position: 'relative' }}>
      <Container flex style={{ justifyContent: 'center' }} margin={{ top: 'huge' }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          data-testid="MinMaxSlider_MinInput"
          value={minVal}
          ref={minValRef}
          onChange={handleMinChangeValue}
          className={classnames(css.thumb, css.thumbZindex3, {
            [css.thumbZindex5]: minVal > max - 100
          })}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          data-testid="MinMaxSlider_MaxInput"
          value={maxVal}
          ref={maxValRef}
          onChange={handleMaxChangeValue}
          className={classnames(css.thumb, css.thumbZindex5)}
        />

        <Container className={css.slider}>
          <div className={css.sliderTrack}></div>
          <div ref={range} data-testid="MinMaxSlider_Range" className={css.sliderRange}></div>
          <p ref={minValNumberRef} data-testid="MinMaxSlider_MinValue" className={css.sliderLeftValue}>
            {minVal}&deg;
          </p>
          <p ref={maxValNumberRef} data-testid="MinMaxSlider_MaxValue" className={css.sliderRightValue}>
            {maxVal}&deg;
          </p>
        </Container>
      </Container>
      <Container>
        <Button
          className={css.resetButton}
          variation={ButtonVariation.LINK}
          onClick={handleReset}
          inline
          icon="reset"
          iconProps={{ margin: { right: 'small' } }}
          color={Color.PRIMARY_7}
          data-testid="MinMaxSlider_reset"
        >
          {getString('reset')}
        </Button>
      </Container>
    </Layout.Vertical>
  )
}

export default MultiRangeSlider
