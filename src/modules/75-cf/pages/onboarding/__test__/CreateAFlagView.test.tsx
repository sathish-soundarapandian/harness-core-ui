/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as ffServices from 'services/cf'
import mockFeatureFlags from '@cf/pages/feature-flags/__tests__/mockFeatureFlags'
import { CF_DEFAULT_PAGE_SIZE } from '@cf/utils/CFUtils'
import { CreateAFlagView, CreateAFlagViewProps } from '../views/CreateAFlagView'
import mockCreateFlagResp from './mockCreateFlagResp'

const setSelectedFlag = jest.fn()

const renderComponent = (props?: Partial<CreateAFlagViewProps>): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <CreateAFlagView selectedFlag={props?.selectedFlag} setSelectedFlag={setSelectedFlag} />
    </TestWrapper>
  )
}

describe('CreateAFlagView', () => {
  const spyGetAllFeatures = jest.spyOn(ffServices, 'useGetAllFeatures')
  const useCreateFeatureFlagMock = jest.spyOn(ffServices, 'useCreateFeatureFlag')

  const refetchFlags = jest.fn()

  beforeEach(() => {
    const pagedResponse = {
      ...mockFeatureFlags,
      features: mockFeatureFlags.features.slice(0, CF_DEFAULT_PAGE_SIZE)
    }
    spyGetAllFeatures.mockReturnValue({
      data: pagedResponse,
      loading: false,
      error: null,
      refetch: refetchFlags
    } as any)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('It should render correctly with empty select input', () => {
    renderComponent()
    expect(screen.getByText('cf.featureFlags.flagsDescription')).toBeVisible()
    expect(screen.getByText('cf.onboarding.flagInputLabel')).toBeVisible()

    const selectInput = document.querySelector('#selectOrCreateFlag')
    expect(selectInput).toBeVisible()
    expect(selectInput).toHaveValue('')
    expect(selectInput).toHaveAttribute('placeholder', 'cf.onboarding.selectOrCreateFlag')
    expect(screen.queryByTestId('ffOnboardingSelectedFlag')).not.toBeInTheDocument()
  })

  test('It should show a text input if there are no existing flags and allow user to create a new flag', async () => {
    const myNewFlag = 'My New Flag'

    const mutateCreateMock = jest.fn()

    useCreateFeatureFlagMock.mockReturnValue({
      mutate: mutateCreateMock,
      loading: false,
      error: null
    } as any)

    mutateCreateMock.mockResolvedValue({})

    spyGetAllFeatures.mockReturnValue({
      data: { features: [], itemCount: 0, pageCount: 0, pageIndex: 0, pageSize: CF_DEFAULT_PAGE_SIZE },

      loading: false,
      error: null,
      refetch: refetchFlags
    } as any)

    renderComponent()

    const createNewFlagTextbox = screen.getByRole('textbox', { name: 'cf.onboarding.typeNewFeatureName' })

    expect(createNewFlagTextbox).toBeInTheDocument()

    await userEvent.type(createNewFlagTextbox, myNewFlag)
    await userEvent.click(screen.getByRole('button', { name: 'common.createFlag' }))

    await waitFor(() =>
      expect(mutateCreateMock).toHaveBeenCalledWith({
        archived: false,
        defaultOffVariation: 'false',
        defaultOnVariation: 'true',
        identifier: 'my_new_flag',
        kind: 'boolean',
        name: myNewFlag,
        permanent: false,
        project: 'dummy',
        variations: [
          {
            identifier: 'true',
            name: 'True',
            value: 'true'
          },
          {
            identifier: 'false',
            name: 'False',
            value: 'false'
          }
        ]
      })
    )
  })

  test('It should retrieve existing feature flags and list these as options in the Select component', async () => {
    renderComponent()

    const selectInput = document.querySelector('#selectOrCreateFlag') as HTMLElement
    expect(selectInput).toBeVisible()
    expect(selectInput).toHaveValue('')
    expect(screen.queryByTestId('ffOnboardingSelectedFlag')).not.toBeInTheDocument()
    expect(refetchFlags).toHaveBeenCalled()

    await userEvent.click(selectInput)

    const dropdownOptions = screen.queryAllByRole('listitem')
    expect(dropdownOptions).toHaveLength(CF_DEFAULT_PAGE_SIZE)
    expect(dropdownOptions[0]).toHaveTextContent('hello world')
  })

  test('It should set the selected dropdown option as the selected flag for Onboarding', async () => {
    renderComponent()

    const selectInput = document.querySelector('#selectOrCreateFlag') as HTMLElement
    expect(selectInput).toBeVisible()
    expect(screen.queryByTestId('ffOnboardingSelectedFlag')).not.toBeInTheDocument()
    expect(refetchFlags).toHaveBeenCalled()

    await userEvent.click(selectInput)

    const dropdownOptions = screen.queryAllByRole('listitem')
    expect(dropdownOptions).toHaveLength(CF_DEFAULT_PAGE_SIZE)
    expect(dropdownOptions[0]).toHaveTextContent('hello world')

    await userEvent.click(dropdownOptions[0])

    expect(selectInput).toHaveValue('hello world')
    expect(setSelectedFlag).toBeCalledWith(mockFeatureFlags.features[0])
  })

  test('It should display a label for the selected flag name and id', async () => {
    renderComponent({ selectedFlag: mockFeatureFlags.features[0] as any })

    const selectInput = document.querySelector('#selectOrCreateFlag')
    expect(document.querySelector('input[id="selectOrCreateFlag"]')).toBeVisible()
    expect(refetchFlags).toBeCalled()
    expect(selectInput).toHaveValue('hello world')

    expect(screen.getByTestId('ffOnboardingSelectedFlag')).toBeVisible()
    expect(screen.getByTestId('ffOnboardingSelectedFlag').textContent).toMatch(
      /cf\.onboarding\.youreUsinghello world.+hello_world.+/g
    )
  })

  test('It should create a new flag when search text matches no existing flags', async () => {
    const createFeatureFlag = jest.spyOn(ffServices, 'useCreateFeatureFlag').mockReturnValue(mockCreateFlagResp as any)

    renderComponent()

    const selectInput = document.querySelector('#selectOrCreateFlag') as HTMLElement
    await userEvent.type(selectInput, 'Onboarding Flag 1')

    // no options returned
    expect(document.getElementsByTagName('li')).toHaveLength(0)
    await userEvent.type(selectInput, '{enter}')

    await waitFor(() => {
      expect(createFeatureFlag).toBeCalled()
    }).then(() => {
      expect(refetchFlags).toBeCalled()
    })
  })
})
