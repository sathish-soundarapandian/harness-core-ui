/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import type { Variation, WeightedVariation } from 'services/cf'
import PercentageRollout from '../PercentageRollout'

describe('PercentageRollout Tests', () => {
  const renderComponent = (
    editing: boolean,
    variations: Variation[],
    weightedVariations: WeightedVariation[],
    bucketBy = 'host'
  ): void => {
    render(
      <TestWrapper>
        <PercentageRollout
          editing={editing}
          bucketBy={bucketBy}
          variations={variations}
          weightedVariations={weightedVariations}
          onSetPercentageValues={() => jest.fn()}
        />
      </TestWrapper>
    )
  }

  test('it renders correct weighted percentages for 3 variations', () => {
    const variations = [
      { identifier: 'Basic', name: 'Basic', value: '20' },
      { identifier: 'Visitor', name: 'Visitor', value: '30' },
      { identifier: 'Premium', name: 'Premium', value: '50' }
    ]

    const weightedVariations = [
      { variation: 'Basic', weight: 20 },
      { variation: 'Visitor', weight: 30 },
      { variation: 'Premium', weight: 50 }
    ]

    const editing = false

    renderComponent(editing, variations, weightedVariations)

    // assert percentage values
    expect(screen.getByTestId('Basic-percentage')).toHaveTextContent('Basic20%')
    expect(screen.getByTestId('Visitor-percentage')).toHaveTextContent('Visitor30%')
    expect(screen.getByTestId('Premium-percentage')).toHaveTextContent('Premium50%')

    // assert correct bar width
    expect(screen.getByTestId('Basic-bar-percentage')).toHaveStyle(`width: 20%`)
    expect(screen.getByTestId('Visitor-bar-percentage')).toHaveStyle(`width: 30%`)
    expect(screen.getByTestId('Premium-bar-percentage')).toHaveStyle(`width: 50%`)
  })

  test('it handles 0 weighted variations correctly', () => {
    const variations = [
      { identifier: 'Basic', name: 'Basic', value: '50' },
      { identifier: 'Visitor', name: 'Visitor', value: '0' },
      { identifier: 'Premium', name: 'Premium', value: '50' }
    ]

    const weightedVariations = [
      { variation: 'Basic', weight: 50 },
      { variation: 'Visitor', weight: 0 },
      { variation: 'Premium', weight: 50 }
    ]

    const editing = false

    renderComponent(editing, variations, weightedVariations)

    // assert percentage values
    expect(screen.getByTestId('Basic-percentage').textContent).toEqual('Basic50%')
    expect(screen.getByTestId('Visitor-percentage').textContent).toEqual('Visitor0%')
    expect(screen.getByTestId('Premium-percentage').textContent).toEqual('Premium50%')

    // assert correct bar width
    expect(screen.getByTestId('Basic-bar-percentage')).toHaveStyle(`width: 50%`)
    expect(screen.getByTestId('Visitor-bar-percentage')).toHaveStyle(`width: 0%`)
    expect(screen.getByTestId('Premium-bar-percentage')).toHaveStyle(`width: 50%`)
  })

  test('it should prepopulate "bucket by" and "variation weightings" if editing', () => {
    const variations = [
      { identifier: 'Basic', name: 'Basic', value: '20' },
      { identifier: 'Visitor', name: 'Visitor', value: '30' },
      { identifier: 'Premium', name: 'Premium', value: '50' }
    ]

    const weightedVariations = [
      { variation: 'Basic', weight: 20 },
      { variation: 'Visitor', weight: 30 },
      { variation: 'Premium', weight: 50 }
    ]

    const editing = true
    const expectedHost = 'Identifier'
    const expectedBasicValue = '20'
    const expectedVistorValue = '30'
    const expectedPremiumValue = '50'

    renderComponent(editing, variations, weightedVariations, expectedHost)

    expect(screen.getByDisplayValue(expectedHost)).toBeInTheDocument()
    expect(screen.getByDisplayValue(expectedBasicValue)).toBeInTheDocument()
    expect(screen.getByDisplayValue(expectedVistorValue)).toBeInTheDocument()
    expect(screen.getByDisplayValue(expectedPremiumValue)).toBeInTheDocument()
  })

  test('it should update weighting inputs and weighting bar on edit input change', async () => {
    const variations = [
      { identifier: 'Basic', name: 'Basic', value: '20' },
      { identifier: 'Visitor', name: 'Visitor', value: '30' },
      { identifier: 'Premium', name: 'Premium', value: '50' }
    ]

    const weightedVariations = [
      { variation: 'Basic', weight: 20 },
      { variation: 'Visitor', weight: 30 },
      { variation: 'Premium', weight: 50 }
    ]

    const editing = true
    const expectedNewBasicValue = 70
    const expectedNewVisitorValue = 20
    const expectedNewPremiumValue = 10

    renderComponent(editing, variations, weightedVariations)

    await userEvent.clear(screen.getByTestId('Basic-percentage-value'))
    await userEvent.type(screen.getByTestId('Basic-percentage-value'), expectedNewBasicValue.toString())

    await userEvent.clear(screen.getByTestId('Visitor-percentage-value'))
    await userEvent.type(screen.getByTestId('Visitor-percentage-value'), expectedNewVisitorValue.toString())

    await userEvent.clear(screen.getByTestId('Premium-percentage-value'))
    await userEvent.type(screen.getByTestId('Premium-percentage-value'), expectedNewPremiumValue.toString())

    // assert input change
    expect(screen.getByTestId('Basic-percentage-value')).toHaveValue(expectedNewBasicValue)
    expect(screen.getByTestId('Visitor-percentage-value')).toHaveValue(expectedNewVisitorValue)
    expect(screen.getByTestId('Premium-percentage-value')).toHaveValue(expectedNewPremiumValue)

    // assert correct bar width
    expect(screen.getByTestId('Basic-bar-percentage')).toHaveStyle(`width: 70%`)
    expect(screen.getByTestId('Visitor-bar-percentage')).toHaveStyle(`width: 20%`)
    expect(screen.getByTestId('Premium-bar-percentage')).toHaveStyle(`width: 10%`)
  })

  test('it should show error message if weightings sum is > 100% on edit', async () => {
    const variations = [
      { identifier: 'Basic', name: 'Basic', value: '20' },
      { identifier: 'Visitor', name: 'Visitor', value: '30' },
      { identifier: 'Premium', name: 'Premium', value: '50' }
    ]

    const weightedVariations = [
      { variation: 'Basic', weight: 20 },
      { variation: 'Visitor', weight: 30 },
      { variation: 'Premium', weight: 50 }
    ]

    const editing = true

    renderComponent(editing, variations, weightedVariations)

    const overflowValue = '60'

    await userEvent.type(screen.getByTestId('Basic-percentage-value'), overflowValue)
    await userEvent.type(screen.getByTestId('Visitor-percentage-value'), overflowValue)
    await userEvent.type(screen.getByTestId('Premium-percentage-value'), overflowValue)

    expect(screen.getByText('cf.featureFlags.bucketOverflow')).toBeInTheDocument()
  })
})
