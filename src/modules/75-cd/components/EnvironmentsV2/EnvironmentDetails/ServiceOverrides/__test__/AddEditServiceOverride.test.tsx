/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as cdNgServices from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import { environmentPathProps, projectPathProps } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'
import AddEditServiceOverride from '../AddEditServiceOverride'
import mockServicesListForOverride from './__mocks__/mockServicesListForOverrides.json'

describe('Add Edit Service Override Test', () => {
  test('add new service override', async () => {
    jest.spyOn(cdNgServices, 'useUpsertServiceOverride').mockImplementation(() => {
      return {
        loading: false,
        mutate: jest.fn().mockResolvedValue({}),
        cancel: jest.fn(),
        error: null
      }
    })

    const { container } = render(
      <TestWrapper
        path={routes.toEnvironmentDetails({
          accountId: 'dummy',
          orgIdentifier: 'dummy',
          projectIdentifier: 'dummy',
          module: 'cd',
          environmentIdentifier: 'test_env'
        })}
        pathParams={{ ...projectPathProps, ...environmentPathProps }}
      >
        <AddEditServiceOverride
          defaultTab="variableoverride"
          closeModal={jest.fn()}
          selectedVariable={{
            serviceRef: '',
            variable: { name: '', type: 'String', value: '' }
          }}
          isReadonly={false}
          services={mockServicesListForOverride.data.content}
        />
      </TestWrapper>
    )

    const textboxes = screen.getAllByRole('textbox')

    // select service
    userEvent.click(textboxes[0])
    await waitFor(() => {
      expect(screen.getByText('svc_1')).toBeInTheDocument()
    })

    userEvent.click(screen.getAllByRole('listitem')[0])
    await waitFor(() => {
      expect(textboxes[0]).toHaveValue('svc_1')
      expect(screen.queryAllByRole('listitem').length).toBe(0)
      expect(screen.getByText('variableLabel')).toBeInTheDocument()
    })
    userEvent.click(screen.getByText('variableLabel'))

    // select variable
    const variableTextBox = screen.getAllByRole('textbox')
    userEvent.click(variableTextBox[1])
    await waitFor(() => {
      expect(screen.getByText('var2')).toBeInTheDocument()
    })

    userEvent.click(screen.getAllByRole('listitem')[1])
    await waitFor(() => {
      expect(variableTextBox[1]).toHaveValue('var2')
      expect(screen.queryAllByRole('listitem').length).toBe(0)
    })

    // change type to number
    userEvent.click(variableTextBox[2])
    await waitFor(() => {
      expect(screen.getByText('number')).toBeInTheDocument()
    })

    userEvent.click(screen.getAllByRole('listitem')[2])
    await waitFor(() => {
      expect(screen.queryAllByRole('listitem').length).toBe(0)
      expect(variableTextBox[2]).toHaveValue('number')
    })

    // override with number
    userEvent.type(screen.getByRole('spinbutton'), '123')

    userEvent.click(screen.getAllByRole('button')[1])
    await waitFor(() => {
      expect(screen.getAllByRole('button')[1]).toHaveClass('PillToggle--item PillToggle--selected')
    })

    userEvent.click(screen.getAllByRole('button')[0])
    await waitFor(() => {
      expect(screen.getAllByRole('button')[0]).toHaveClass('PillToggle--item PillToggle--selected')
    })

    expect(container).toMatchSnapshot()
  })
})
