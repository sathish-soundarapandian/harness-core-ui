import React from 'react'
import { fireEvent, render, act } from '@testing-library/react'
import { noop } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import AdditionalFunctions from '../AdditionalFunctions'
import { Providers } from '../../utils'

describe('Additional functions tests', () => {
  test('render without any data', () => {
    const { queryByText } = render(
      <TestWrapper>
        <AdditionalFunctions onSubmit={noop} />
      </TestWrapper>
    )
    expect(queryByText('authSettings.enableAuthorization')).not.toBeNull()
    expect(queryByText('authSettings.enableEntityIdLabel')).not.toBeNull()
    expect(queryByText('authSettings.enableClientIdAndSecret')).toBeNull()
  })

  test('enable authorization', () => {
    const { queryByText, container } = render(
      <TestWrapper>
        <AdditionalFunctions onSubmit={noop} />
      </TestWrapper>
    )

    expect(queryByText('authSettings.groupAttributeName')).toBeNull()
    expect(queryByText('authSettings.entityIdLabel')).toBeNull()
    const checkbox = container.querySelector('input[name="authorization"]')
    const checkboxEntity = container.querySelector('input[name="enableEntityId"]')
    fireEvent.click(checkbox!)
    fireEvent.click(checkboxEntity!)
    expect(queryByText('authSettings.groupAttributeName')).not.toBeNull()
    expect(queryByText('authSettings.entityIdLabel')).not.toBeNull()
  })

  test('when samlprovider selected is azure', () => {
    const { queryByText } = render(
      <TestWrapper>
        <AdditionalFunctions
          onSubmit={noop}
          prevStepData={{
            samlProviderType: Providers.AZURE,
            displayName: 'test',
            enableClientIdAndSecret: true,
            authorizationEnabled: true,
            groupMembershipAttr: '',
            entityIdEnabled: false,
            entityIdentifier: ''
          }}
        />
      </TestWrapper>
    )

    expect(queryByText('authSettings.enableClientIdAndSecret')).not.toBeNull()
  })

  test('click on back', async () => {
    const clickOnBack = jest.fn()
    const { getByText } = render(
      <TestWrapper>
        <AdditionalFunctions
          onSubmit={noop}
          prevStepData={{
            samlProviderType: Providers.AZURE,
            displayName: 'test',
            enableClientIdAndSecret: true,
            authorizationEnabled: true,
            groupMembershipAttr: '',
            entityIdEnabled: false,
            entityIdentifier: ''
          }}
          previousStep={clickOnBack}
        />
      </TestWrapper>
    )

    const backBtn = getByText('back')

    await act(() => {
      fireEvent.click(backBtn!)
    })

    expect(clickOnBack).toBeCalledWith({
      authorizationEnabled: true,
      displayName: 'test',
      enableClientIdAndSecret: true,
      entityIdEnabled: false,
      entityIdentifier: '',
      groupMembershipAttr: '',
      samlProviderType: 'AZURE'
    })
  })
})
