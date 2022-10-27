/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import GraphActions, { CanvasButtonsActions } from '../GraphActions'

const callBack = jest.fn()
const INITIAL_ZOOM_LEVEL = 1

function GraphActionsTestWrapper(): JSX.Element {
  return (
    <TestWrapper>
      <GraphActions
        resetGraphState={callBack}
        setGraphScale={callBack}
        graphScale={INITIAL_ZOOM_LEVEL}
        handleScaleToFit={callBack}
        graphActionsLayout={'horizontal'}
        callback={callBack}
      />
    </TestWrapper>
  )
}

describe('Graph Actions Button Tests', () => {
  test('should render graph action buttons', () => {
    const { container } = render(<GraphActionsTestWrapper />)
    expect(container).toMatchSnapshot()
  })
  test('should render canvas buttons Actions', () => {
    const { container } = render(<GraphActionsTestWrapper />)
    const buttons = container.querySelectorAll('.graphActions button')
    fireEvent.click(buttons[0])
    expect(callBack).toBeCalledWith(CanvasButtonsActions.ZoomToFit)
    callBack.mockReset()
    fireEvent.click(buttons[1])
    expect(callBack).toBeCalledWith(CanvasButtonsActions.Reset)
    callBack.mockReset()
    fireEvent.click(buttons[2])
    expect(callBack).toBeCalledWith(CanvasButtonsActions.ZoomIn)
    callBack.mockReset()
    fireEvent.click(buttons[3])
    expect(callBack).toBeCalledWith(CanvasButtonsActions.ZoomOut)
  })
})
