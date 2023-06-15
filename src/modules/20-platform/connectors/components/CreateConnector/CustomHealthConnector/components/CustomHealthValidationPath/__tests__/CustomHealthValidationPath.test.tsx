/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { CustomHealthValidationPath } from '../CustomHealthValidationPath'
import { CustomHealthValidationPathFieldNames } from '../CustomHealthValidationPath.constants'
import { HTTPRequestMethod } from '../components/HTTPRequestMethod/HTTPRequestMethod.types'

const Wrapper = (props: any): JSX.Element => {
  return (
    <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: '1234_accountId' }}>
      <CustomHealthValidationPath {...props} />
    </TestWrapper>
  )
}

describe('Create CustomHealth connector Wizard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Ensure body is displayed when clicking on post method', async () => {
    const { container } = render(
      <Wrapper
        prevStepData={{}}
        accountId="1312_accountId"
        connectorInfo={{}}
        nextStep={jest.fn()}
        previousStep={jest.fn()}
      />
    )
    await waitFor(() =>
      expect((container.querySelector(`[value="${HTTPRequestMethod.GET}"]`)?.attributes as any).checked).not.toBeNull()
    )
    expect(container.querySelector(`[name="${CustomHealthValidationPathFieldNames.REQUEST_BODY}"]`)).toBeNull()
    fireEvent.click(container.querySelector(`[value="${HTTPRequestMethod.POST}"]`)!)
    await waitFor(() =>
      expect(container.querySelector(`[name="${CustomHealthValidationPathFieldNames.REQUEST_BODY}"]`)).not.toBeNull()
    )
  })
  test('expect form to render in edit mode and switch fromm POST to GET', async () => {
    const onNextMock = jest.fn()
    const { container, getByText } = render(
      <Wrapper
        prevStepData={{
          [CustomHealthValidationPathFieldNames.VALIDATION_PATH]: 'validationPath/',
          [CustomHealthValidationPathFieldNames.REQUEST_BODY]: '{"solo": "dolo"}',
          [CustomHealthValidationPathFieldNames.REQUEST_METHOD]: HTTPRequestMethod.POST
        }}
        accountId="1312_accountId"
        connectorInfo={{}}
        nextStep={onNextMock}
        previousStep={jest.fn()}
      />
    )

    await waitFor(() =>
      expect(
        container.querySelector(`textarea[name=${CustomHealthValidationPathFieldNames.REQUEST_BODY}]`)
      ).not.toBeNull()
    )
    fireEvent.click(container.querySelector(`[value="${HTTPRequestMethod.GET}"]`)!)

    expect(container.querySelector(`[name="${CustomHealthValidationPathFieldNames.REQUEST_BODY}"]`)).toBeNull()
    fireEvent.click(getByText('next'))

    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        accountId: '1312_accountId',
        orgIdentifier: undefined,
        projectIdentifier: undefined,
        requestBody: null,
        requestMethod: 'GET',
        validationPath: 'validationPath/'
      })
    )
  })

  test('Ensure validation is working', async () => {
    const onNextMock = jest.fn()
    const { container, getByText } = render(
      <Wrapper
        prevStepData={{}}
        accountId="1312_accountId"
        connectorInfo={{}}
        nextStep={onNextMock}
        previousStep={jest.fn()}
      />
    )

    await waitFor(() =>
      expect((container.querySelector(`[value="${HTTPRequestMethod.GET}"]`)?.attributes as any).checked).not.toBeNull()
    )

    fireEvent.click(getByText('next'))
    await waitFor(() => expect(getByText('connectors.customHealth.validationPath')).not.toBeNull())

    fireEvent.click(container.querySelector(`[value="${HTTPRequestMethod.POST}"]`)!)
    await waitFor(() =>
      expect(container.querySelector(`[name="${CustomHealthValidationPathFieldNames.REQUEST_BODY}"]`)).not.toBeNull()
    )

    fireEvent.click(getByText('next'))
    await waitFor(() => expect(getByText('connectors.customHealth.validationPath')).not.toBeNull())
    await waitFor(() => expect(getByText('connectors.customHealth.requestBody')).not.toBeNull())
  })
})
