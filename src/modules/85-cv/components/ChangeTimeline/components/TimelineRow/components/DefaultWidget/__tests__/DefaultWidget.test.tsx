/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { DefaultWidgetProps } from '../DefaultWidget';
import DefaultWidget from '../DefaultWidget'

function WrapperComponent(props: DefaultWidgetProps): JSX.Element {
  return (
    <TestWrapper>
      <DefaultWidget {...props} />
    </TestWrapper>
  )
}

describe('Unit tests for DefaultWidget', () => {
  const props = {
    widget: {
      endTime: 1679660880000,
      startTime: 1679660280000,
      icon: {
        height: 16,
        width: 16,
        url: 'images/defaultWidget'
      },
      leftOffset: 1043.7857589440778
    },
    tooltip: {
      message: 'Deloyments'
    },
    index: 0
  }

  test('should be able to verify that DefaultWidget component loads with appropriate data', async () => {
    const { getByTestId } = render(<WrapperComponent {...props} />)
    const DefaultWidgetIcon = getByTestId('defaultWidgetIcon')
    await waitFor(() => expect(DefaultWidgetIcon).toBeInTheDocument())

    act(() => {
      fireEvent.mouseOver(DefaultWidgetIcon as Element)
    })
  })

  test('should be able to verify that DefaultWidget component loads with appropriate data when icon url is diamond', async () => {
    const updatedProps = { ...props, widget: { ...props.widget, icon: { ...props.widget.icon, url: 'diamond' } } }
    const { getByTestId } = render(<WrapperComponent {...updatedProps} />)
    const diamondWidget = getByTestId('diamondIcon')

    await waitFor(() => expect(diamondWidget).toBeInTheDocument())
  })

  test('should be able to verify that DefaultWidget component loads with appropriate data when tooltip is not passed', async () => {
    const updatedProps = { ...props, widget: { ...props.widget, tooltip: undefined } }
    const { getByTestId } = render(<WrapperComponent {...updatedProps} />)
    const DefaultWidgetIcon = getByTestId('defaultWidgetIcon')
    await waitFor(() => expect(DefaultWidgetIcon).toBeInTheDocument())
  })
})
