/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { CreateDelegateConfigWizard } from '../CreateDelegateConfigWizard'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/exports', () => ({
  useToaster: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn()
  })
}))
const voidFn = jest.fn()

describe('Create Delegate Wizard', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <CreateDelegateConfigWizard onClose={voidFn} onSuccess={voidFn} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
