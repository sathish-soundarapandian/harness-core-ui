/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Duration } from '../Duration'

describe('Show milliseconds results', () => {
  test('Shows ms with results', () => {
    const { getByText } = render(
      <Duration
        icon={undefined}
        durationText=" "
        startTime={1631139247012}
        endTime={1631139248964}
        showMilliSeconds={true}
      />
    )
    expect(getByText('1s 952ms')).toBeInTheDocument()
  })
})

describe('Show zero second results', () => {
  test('Less than one second shows 0s', () => {
    const { getByText } = render(
      <Duration
        icon={undefined}
        durationText=" "
        startTime={1631139247012}
        endTime={1631139247098}
        showZeroSecondsResult={true}
      />
    )
    expect(getByText('0s')).toBeInTheDocument()
  })

  test('No delta shows 0s text', () => {
    const { getByText } = render(
      <Duration
        icon={undefined}
        durationText=" "
        startTime={1631139247012}
        endTime={1631139247012}
        showZeroSecondsResult={true}
      />
    )
    expect(getByText('0s')).toBeInTheDocument()
  })
})

describe('Show milliseconds when less than second', () => {
  test('Greater than one second shows seconds', () => {
    const { getByText } = render(
      <Duration icon={undefined} durationText=" " startTime={1631139247012} endTime={1631139248964} />
    )

    expect(getByText('2s')).toBeInTheDocument()
  })

  test('No delta does not show any text', () => {
    const { container } = render(
      <Duration icon={undefined} durationText=" " startTime={1631139247012} endTime={1631139247012} />
    )

    const span = container.querySelector('[class*="inline"]')
    expect(span).toContainHTML(' ')
  })

  test('Less than one second shows ms', () => {
    const { getByText } = render(
      <Duration icon={undefined} durationText=" " startTime={1631139247012} endTime={1631139247098} />
    )
    expect(getByText('86ms')).toBeInTheDocument()
  })
})
