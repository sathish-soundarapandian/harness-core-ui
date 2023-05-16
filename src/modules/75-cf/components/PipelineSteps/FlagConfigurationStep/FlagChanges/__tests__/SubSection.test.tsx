/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ReactElement } from 'react';
import React from 'react'
import type { RenderResult} from '@testing-library/react';
import { render, screen } from '@testing-library/react'
import type { SubSectionProps } from '../SubSection';
import SubSection, { disallowedProps } from '../SubSection'

const renderComponent = (
  props: Partial<SubSectionProps & { children: ReactElement } & Record<string, unknown>> = {}
): RenderResult => render(<SubSection subSectionSelector={<span />} {...props} />)

describe('SubSection', () => {
  test('it should display the passed removeSubSectionButton', async () => {
    const testId = 'TEST-EL-ID'
    renderComponent({ removeSubSectionButton: <span data-testid={testId} /> })

    expect(screen.getByTestId(testId)).toBeInTheDocument()
  })

  test('it should display the passed subSectionSelector', async () => {
    const testId = 'TEST-EL-ID'
    renderComponent({ subSectionSelector: <span data-testid={testId} /> })

    expect(screen.getByTestId(testId)).toBeInTheDocument()
  })

  test('it should display the passed children', async () => {
    const testId = 'TEST-EL-ID'
    renderComponent({ children: <span data-testid={testId} /> })

    expect(screen.getByTestId(testId)).toBeInTheDocument()
  })

  test('it should filter props that are meant for concrete sub-sections', async () => {
    const badProps = disallowedProps.reduce<Record<string, unknown>>(
      (props, propName) => ({ ...props, [propName]: propName }),
      {}
    )
    const goodProps: Record<string, unknown> = {
      'data-testid': 'testid',
      'data-somethingelse': 'somethingelse'
    }

    const { container } = renderComponent({ ...badProps, ...goodProps })

    for (const propName of disallowedProps) {
      expect(container.querySelector(`[${propName}]`)).not.toBeInTheDocument()
      expect(container.querySelector(`[${propName.toLowerCase()}]`)).not.toBeInTheDocument()
    }

    for (const [propName, propValue] of Object.entries(goodProps)) {
      expect(container.querySelector(`[${propName}]`)).toHaveAttribute(propName, propValue)
    }
  })
})
