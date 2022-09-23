/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, queryByText, render } from '@testing-library/react'
import { MultiTypeInputType } from '@wings-software/uicore'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { FormMultiTypeConnectorField } from '../FormMultiTypeConnectorField'

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn().mockImplementation(() => ({ data: {} }))
}))
describe('FormMultiTypeConnectorField tests', () => {
  test(`renders without crashing`, async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <FormMultiTypeConnectorField
          key={'Github'}
          onLoadingFinish={jest.fn()}
          name="connectorRef"
          label={'connector'}
          placeholder={`Select Connector`}
          accountIdentifier={'dummy'}
          projectIdentifier={'dummy'}
          orgIdentifier={'dummy'}
          width={400}
          multiTypeProps={{ expressions: [], allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME] }}
          createNewLabel={'newConnectorLabel'}
          enableConfigureOptions={true}
          gitScope={{ repo: 'repoIdentifier', branch: 'branch', getDefaultFromOtherRepo: true }}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    const selectConnector = getByText('Select Connector')
    fireEvent.click(selectConnector)
    const dialog = findDialogContainer() as HTMLElement
    const newconnect = queryByText(dialog, '+ newConnectorLabel')
    fireEvent.click(newconnect as HTMLElement)
    const newConnectorDialog = document.querySelectorAll('.bp3-dialog')[1]
    expect(newConnectorDialog).toMatchSnapshot()
    const cross = queryByText(newConnectorDialog as HTMLElement, 'cross')
    fireEvent.click(cross as HTMLElement)
    expect(document.querySelectorAll('.bp3-dialog').length).toEqual(1)
  })
})
