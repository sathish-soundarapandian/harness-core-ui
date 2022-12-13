/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { noop } from 'lodash-es'
import ItemRendererWithMenuItem from '../ItemRendererWithMenuItem'

describe('ItemRendererWithMenuItem', () => {
  test('Render active menu item', () => {
    const { container } = render(
      <ItemRendererWithMenuItem
        item={{ label: 'Test', value: 'test' }}
        itemProps={{
          handleClick: noop,
          modifiers: {
            disabled: false,
            active: true,
            matchesPredicate: true
          },
          query: ''
        }}
        disabled={false}
      />
    )
    expect(container).toMatchSnapshot()
  })
  test('Render disabled menu item', () => {
    const { container } = render(
      <ItemRendererWithMenuItem
        item={{ label: 'Test', value: 'test' }}
        itemProps={{
          handleClick: noop,
          modifiers: {
            disabled: true,
            active: true,
            matchesPredicate: true
          },
          query: ''
        }}
        disabled={true}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
