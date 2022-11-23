/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { FormInput } from '@harness/uicore'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import { Filter, FilterProps } from '../Filter'
import type { FilterInterface } from '../Constants'

const props: FilterProps<unknown, FilterInterface> = {
  onClose: jest.fn(),
  formFields: <></>,
  /*******/
  onApply: jest.fn(),
  filters: [],
  onSaveOrUpdate: jest.fn(),
  onDelete: jest.fn(),
  initialFilter: {
    formValues: { connectorNames: [''], description: '' },
    metadata: { name: 'Sample', filterVisibility: 'OnlyCreator', identifier: 'Sample' }
  },
  onFilterSelect: jest.fn(),
  isRefreshingFilters: false
}

const ConnectorFormFields: React.FC = () => {
  return (
    <>
      {' '}
      <FormInput.Text name={'name'} label={'Name'} />
      <FormInput.Text name={'identifier'} label={'Identifier'} />
      <FormInput.Text name={'description'} label={'Description'} />
    </>
  )
}

describe('Test Filter component', () => {
  test('Initial render should match snapshot', async () => {
    render(
      <TestWrapper>
        <Filter {...props}>
          <ConnectorFormFields />
        </Filter>
      </TestWrapper>
    )
    await act(async () => {
      const portal = document.getElementsByClassName('bp3-portal')[0]
      expect(portal).toMatchSnapshot('Filter')
    })
  })
})
