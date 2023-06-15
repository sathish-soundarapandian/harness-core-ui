import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import * as cdNgServices from 'services/cd-ng'

import routes from '@common/RouteDefinitions'
import { modulePathProps, projectPathProps } from '@common/utils/routeUtils'
import { TestWrapper, findPopoverContainer } from '@common/utils/testUtils'

import GlobalEnvironmentOverrides from '../GlobalEnvironmentOverrides'

describe('global environment overrides', () => {
  test('create new override', async () => {
    jest.spyOn(cdNgServices, 'useGetServiceOverrideListV2').mockImplementation(
      () =>
        ({
          loading: false,
          error: undefined,
          data: {
            data: {
              content: []
            }
          },
          refetch: jest.fn()
        } as any)
    )

    jest.spyOn(cdNgServices, 'useGetEnvironmentAccessListV2').mockImplementation(
      () =>
        ({
          loading: false,
          error: undefined,
          data: {
            data: {
              content: []
            }
          },
          mutate: jest.fn()
        } as any)
    )

    const { container } = render(
      <TestWrapper
        path={routes.toServiceOverrides({
          ...projectPathProps,
          ...modulePathProps
        })}
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy', module: 'cd' }}
        queryParams={{
          sectionId: 'ENVIRONMENT_GLOBAL'
        }}
      >
        <GlobalEnvironmentOverrides />
      </TestWrapper>
    )

    await waitFor(() =>
      expect(screen.getByText('common.serviceOverrides.noOverrides.globalEnvironment')).toBeInTheDocument()
    )

    const createNewOverrideButton = screen.getAllByRole('button', {
      name: 'common.serviceOverrides.newOverride'
    })[0]

    userEvent.click(createNewOverrideButton)

    await waitFor(() => expect(screen.getByText('ENVIRONMENT')).toBeInTheDocument())
    expect(screen.queryByText('SERVICE')).toBeNull()
    expect(screen.queryByText('INFRASTRUCTURE')).toBeNull()
    expect(screen.getByText('COMMON.SERVICEOVERRIDES.OVERRIDETYPE')).toBeInTheDocument()

    const environmentSelect = screen.getByTestId('scoped-select-popover-field_environmentRef')

    userEvent.click(environmentSelect)

    await waitFor(() => expect(findPopoverContainer()).toBeInTheDocument())
    const popoverContainer = findPopoverContainer()

    expect(popoverContainer).toMatchSnapshot()
  })
})
