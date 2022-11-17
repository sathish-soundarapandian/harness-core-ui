/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Button } from '@harness/uicore'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import * as portalService from 'services/portal'
import * as cdService from 'services/cd-ng'
import { cvConnectorHOC } from '../CVConnectorHOC'
import { DynatraceConfigStep } from '../../DynatraceConnector/CreateDynatraceConnector'

const mockTransFormFunc = jest.fn()

jest.mock('services/portal', () => ({
  useGetDelegateTags: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetDelegatesStatus: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetDelegateFromId: jest.fn().mockImplementation(() => jest.fn()),
  useGetDelegateSelectorsUpTheHierarchy: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetDelegatesUpTheHierarchy: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

function nestedComponent(): JSX.Element[] {
  return [<DynatraceConfigStep key={1} name="parameters" accountId="qq3q4" isEditMode={false} />]
}

function WrappedComponent(props: any) {
  return (
    <Container>
      <p>Dummy component</p>
      <Button onClick={() => props.nextStep()}>next</Button>
    </Container>
  )
}

const MockProps = {
  onClose: jest.fn(),
  onSuccess: jest.fn(),
  isEditMode: false,
  accountId: '1234_accountId',
  projectIdentifier: '1234_projectIdentifier',
  orgIdentifier: '1234_orgIdentifier',
  connectorInfo: undefined,
  setIsEditMode: () => undefined,
  nestedComponent: null,
  ConnectorCredentialsStep: WrappedComponent
}

function WrapperComponent(mockProps: any) {
  const MockComponent = cvConnectorHOC({
    connectorType: 'Prometheus',
    ConnectorCredentialsStep: mockProps.ConnectorCredentialsStep,
    buildSubmissionPayload: mockTransFormFunc,
    nestedStep: mockProps.nestedStep
  })
  return (
    <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: '1234_accountId' }}>
      <MockComponent {...mockProps} />
    </TestWrapper>
  )
}

describe('Unit tests for cv connector hoc', () => {
  beforeEach(() => {
    jest.spyOn(portalService, 'useGetDelegateSelectorsUpTheHierarchy')
    jest.spyOn(cdService, 'validateTheIdentifierIsUniquePromise').mockResolvedValue({
      status: 'SUCCESS',
      data: true,
      metaData: {},
      correlationId: ''
    })
  })

  test('should render form', async () => {
    const { container, getByText } = render(<WrapperComponent {...MockProps} />)

    // match step 1
    expect(container).toMatchSnapshot()

    // fill step 1
    await setFieldValue({ container, fieldId: 'name', value: 'dummy name', type: InputTypes.TEXTFIELD })
    fireEvent.click(getByText('continue'))

    // step 2
    await waitFor(() => expect(getByText('Dummy component')).not.toBeNull())
    fireEvent.click(getByText('next'))

    // step 3
    await waitFor(() => expect(getByText('back')))
    const backBtn = getByText('back')
    fireEvent.click(backBtn)

    // back to step 2
    await waitFor(() => expect(getByText('Dummy component')).not.toBeNull())
  })

  test('Ensure that nested step component and credentials component are rendered', async () => {
    const props = { ...MockProps, nestedStep: nestedComponent }
    const { getByText } = render(<WrapperComponent {...props} />)
    await waitFor(() => expect(getByText('parameters')).not.toBeNull())
    expect(getByText('credentials')).not.toBeNull()
  })

  test('Ensure that credentials component is not rendered', async () => {
    const props = { ...MockProps, nestedStep: nestedComponent, ConnectorCredentialsStep: null }
    const { container, getByText } = render(<WrapperComponent {...props} />)
    await waitFor(() => expect(getByText('parameters')).not.toBeNull())
    expect(container.querySelectorAll('[class*="navStep"]').length).toBe(5)
  })
})
