/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { merge } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import type { Target } from 'services/cf'
import mockTarget from '@cf/utils/testData/data/mockTarget'
import TargetAttributes, { TargetAttributesProps } from '../TargetAttributes'

const renderComponent = (props: Partial<TargetAttributesProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <TargetAttributes target={mockTarget} {...props} />
    </TestWrapper>
  )

describe('TabAttributes', () => {
  test('it should display the identifier and name', async () => {
    renderComponent()

    expect(screen.getByText('identifier')).toBeInTheDocument()
    expect(screen.getByText(mockTarget.identifier)).toBeInTheDocument()

    expect(screen.getByText('name')).toBeInTheDocument()
    expect(screen.getByText(mockTarget.name)).toBeInTheDocument()
  })

  test('it should display any attributes', async () => {
    const attributes: Target['attributes'] = {
      'Attribute 1': 'Value 1',
      'Attribute 2': 'Value 2',
      'Attribute 3': 'Value 3'
    }

    renderComponent({ target: merge(mockTarget, { attributes }) })

    for (const [key, val] of Object.entries(attributes)) {
      expect(screen.getByText(key)).toBeInTheDocument()
      expect(screen.getByText(val)).toBeInTheDocument()
    }
  })

  test('it should display boolean attributes as text', async () => {
    const attributes: Target['attributes'] = {
      'Boolean TRUE': true,
      'Boolean FALSE': false
    }

    renderComponent({ target: merge(mockTarget, { attributes }) })

    expect(screen.getByText('Boolean TRUE')).toBeInTheDocument()
    expect(screen.getByText('cf.shared.true')).toBeInTheDocument()

    expect(screen.getByText('Boolean FALSE')).toBeInTheDocument()
    expect(screen.getByText('cf.shared.false')).toBeInTheDocument()
  })
})
