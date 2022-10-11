/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { screen } from '@testing-library/dom'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import SeverityPill from '@sto/components/SeverityPill/SeverityPill'
import { SeverityCode } from '@sto/types'

describe('SeverityPill', () => {
  test('renders correctly', () => {
    const { container } = render(
      <TestWrapper getString={id => id}>
        <SeverityPill severity={SeverityCode.Critical} value={10} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('renders High', () => {
    render(
      <TestWrapper getString={id => id}>
        <SeverityPill severity={SeverityCode.High} value={7.5} />
      </TestWrapper>
    )
    expect(screen.getByText('connectors.cdng.verificationSensitivityLabel.high')).toBeTruthy()
    expect(screen.getByText('7.5')).toBeTruthy()
  })

  test('renders Medium', () => {
    render(
      <TestWrapper getString={id => id}>
        <SeverityPill severity={SeverityCode.Medium} value={5.5} />
      </TestWrapper>
    )
    expect(screen.getByText('connectors.cdng.verificationSensitivityLabel.medium')).toBeTruthy()
    expect(screen.getByText('5.5')).toBeTruthy()
  })

  test('renders Low', () => {
    render(
      <TestWrapper getString={id => id}>
        <SeverityPill severity={SeverityCode.Low} value={3.3} />
      </TestWrapper>
    )
    expect(screen.getByText('connectors.cdng.verificationSensitivityLabel.low')).toBeTruthy()
    expect(screen.getByText('3.3')).toBeTruthy()
  })

  test('renders Info', () => {
    render(
      <TestWrapper getString={id => id}>
        <SeverityPill severity={SeverityCode.Info} value={1.0} />
      </TestWrapper>
    )
    expect(screen.getByText('sto.Info')).toBeTruthy()
    expect(screen.getByText('1')).toBeTruthy()
  })

  test('renders Unassigned', () => {
    render(
      <TestWrapper getString={id => id}>
        <SeverityPill severity={SeverityCode.Unassigned} value={5.0} />
      </TestWrapper>
    )
    expect(screen.getByText('sto.Unassigned')).toBeTruthy()
    expect(screen.getByText('5')).toBeTruthy()
  })
})
