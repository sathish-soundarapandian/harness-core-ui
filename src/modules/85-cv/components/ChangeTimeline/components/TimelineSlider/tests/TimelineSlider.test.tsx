/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import TimelineSlider from '../TimelineSlider'

jest.mock('react-draggable', () => (props: any) => (
  <div>
    <button
      className="onDragEnd"
      onClick={() => props.onStop({ movementX: 15 } as MouseEvent, { deltaX: 15, x: 10 } as any)}
    />
    <button
      className="onDragSlider"
      onClick={e => props.onDrag(e, { movementX: 15 } as MouseEvent, { deltaX: 15, x: 10 } as any)}
    />
    {props.children}
  </div>
))

describe('Unit tests for timeline slider', () => {
  test('Ensure slider responds to click event', async () => {
    const { container } = render(<TimelineSlider initialSliderWidth={50} minSliderWidth={25} />)
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    const ev = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
      screenX: 450,
      screenY: 100
    })

    container.dispatchEvent(ev)
    await waitFor(() => expect(container.querySelector('[class*="sliderContainer"]')).not.toBeNull())
  })

  test('Ensure dragging handles causes width resize', async () => {
    const onDragEndMock = jest.fn()
    const { container } = render(
      <TimelineSlider initialSliderWidth={100} minSliderWidth={50} onSliderDragEnd={onDragEndMock} />
    )
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())

    const dragEnds = container.querySelectorAll('[class*="onDragEnd"]')
    fireEvent.click(dragEnds[0])
    await waitFor(() =>
      expect(onDragEndMock).toHaveBeenLastCalledWith({
        endX: 0,
        endXPercentage: NaN,
        startX: 15,
        startXPercentage: Infinity
      })
    )

    fireEvent.click(dragEnds[1])
    await waitFor(() =>
      expect(onDragEndMock).toHaveBeenLastCalledWith({
        endX: 0,
        endXPercentage: NaN,
        startX: 15,
        startXPercentage: Infinity
      })
    )

    userEvent.click(dragEnds[2])
    await waitFor(() =>
      expect(onDragEndMock).toHaveBeenLastCalledWith({
        endX: 0,
        endXPercentage: NaN,
        startX: 0,
        startXPercentage: NaN
      })
    )

    const drags = container.querySelectorAll('[class*="onDragSlider"]')

    fireEvent.click(drags[0])
    await waitFor(() =>
      expect(onDragEndMock).toHaveBeenLastCalledWith({
        endX: 0,
        endXPercentage: NaN,
        startX: 0,
        startXPercentage: NaN
      })
    )

    userEvent.click(drags[1])
    await waitFor(() =>
      expect(onDragEndMock).toHaveBeenLastCalledWith({
        endX: 0,
        endXPercentage: NaN,
        startX: 0,
        startXPercentage: NaN
      })
    )

    userEvent.click(drags[2])
    await waitFor(() =>
      expect(onDragEndMock).toHaveBeenLastCalledWith({
        endX: 0,
        endXPercentage: NaN,
        startX: 0,
        startXPercentage: NaN
      })
    )

    userEvent.click(drags[1])
    await waitFor(() =>
      expect(onDragEndMock).toHaveBeenLastCalledWith({
        endX: 0,
        endXPercentage: NaN,
        startX: 0,
        startXPercentage: NaN
      })
    )

    userEvent.click(drags[2])
    await waitFor(() =>
      expect(onDragEndMock).toHaveBeenLastCalledWith({
        endX: 0,
        endXPercentage: NaN,
        startX: 0,
        startXPercentage: NaN
      })
    )
  })

  test('Ensure that slider appears only when click event is fired when appearOnClick is passed', async () => {
    const { container, rerender } = render(
      <TimelineSlider initialSliderWidth={100} minSliderWidth={50} onSliderDragEnd={jest.fn()} hideSlider={true} />
    )
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(container.querySelector('[class*="sliderContainer"]')).toBeNull()

    rerender(
      <TimelineSlider initialSliderWidth={100} minSliderWidth={50} onSliderDragEnd={jest.fn()} hideSlider={false} />
    )
    await waitFor(() => expect(container.querySelector('[class*="sliderContainer"]')).not.toBeNull())
  })

  test('Ensure zoom callback is handled properly', () => {
    const onSliderDragEnd = jest.fn()
    const onZoom = jest.fn()

    const { container } = render(
      <TestWrapper>
        <TimelineSlider
          infoCard={<div />}
          minSliderWidth={50}
          initialSliderWidth={100}
          onSliderDragEnd={onSliderDragEnd}
          onZoom={onZoom}
        />
      </TestWrapper>
    )

    expect(container.querySelector('[class*="main"]')).toBeInTheDocument()

    expect(screen.getByText('cv.zoom')).toBeInTheDocument()
    userEvent.click(screen.getByText('cv.zoom'))

    expect(onZoom).toBeCalledTimes(1)
    expect(onSliderDragEnd).toBeCalledTimes(0)
  })

  test('it should handle the left and right clicks on mask', () => {
    const onSliderDragEnd = jest.fn()

    const { container } = render(
      <TestWrapper>
        <TimelineSlider
          infoCard={<div />}
          minSliderWidth={50}
          containerWidth="500px"
          initialSliderWidth={100}
          onSliderDragEnd={onSliderDragEnd}
        />
      </TestWrapper>
    )

    expect(container.querySelector('[class*="main"]')).toBeInTheDocument()

    userEvent.click(container.querySelectorAll('[class*="mask"]')?.[0]!)
    expect(onSliderDragEnd).toBeCalledTimes(1)

    userEvent.click(container.querySelectorAll('[class*="mask"]')?.[1]!)
    expect(onSliderDragEnd).toBeCalledTimes(2)
  })
})
