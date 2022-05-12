/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { render, getAllByText, getByText, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import { TestWrapper } from '@common/utils/testUtils'
import { clickSubmit, fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import CreateCeAwsConnector from '../CreateCeAwsConnector'

const commonProps = {
  accountId: 'dummy',
  orgIdentifier: '',
  projectIdentifier: '',
  setIsEditMode: noop,
  onClose: jest.fn(),
  onSuccess: noop
}

jest.mock('services/cd-ng', () => ({
  useUpdateConnector: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS'
      }
    },
    loading: false
  })),
  useCreateConnector: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS'
      }
    },
    loading: false
  })),
  useGetTestConnectionResult: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS'
      }
    },
    loading: false
  })),
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS',
        data: {
          pageItemCount: 0,
          content: []
        }
      }
    }
  }))
}))

jest.mock('services/ce', () => ({
  useAwsaccountconnectiondetail: jest.fn().mockImplementation(() => ({
    status: 'SUCCESS',
    data: {
      status: 'SUCCESS',
      data: {
        externalId: 'harness:108817434118:kmpySmUISimoRrJL6NL73w',
        stackLaunchTemplateLink: 'https://mock.com'
      }
    },
    loading: false
  }))
}))

describe('Create Secret Manager Wizard', () => {
  test('should render form', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateCeAwsConnector {...commonProps} isEditMode={false} connectorInfo={undefined} />
      </TestWrapper>
    )

    //Overview Step
    expect(container).toMatchSnapshot()

    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'name',
        value: 'dummyname'
      },
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'awsAccountId',
        value: '12345'
      }
    ])

    await act(async () => {
      clickSubmit(container)
    })

    //Cost and Usage Step
    expect(getAllByText(container, 'connectors.ceAws.cur.heading')[0]).toBeDefined()

    expect(container).toMatchSnapshot()

    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'reportName',
        value: 'rname'
      },
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 's3BucketName',
        value: 'bname'
      }
    ])

    await act(async () => {
      clickSubmit(container)
    })

    //Cross Account Role Step 1
    expect(getAllByText(container, 'connectors.ceAws.crossAccountRoleStep1.heading')[0]).toBeDefined()
    expect(container).toMatchSnapshot()

    await act(async () => {
      clickSubmit(container)
    })

    //Cross Account Role Step 2
    expect(getAllByText(container, 'connectors.ceAws.crossAccountRoleStep2.heading')[0]).toBeDefined()

    expect(container).toMatchSnapshot()

    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'crossAccountRoleArn',
        value: 'arn:aws:iam::12345:role/HarnessCERole'
      }
    ])

    await act(async () => {
      clickSubmit(container)
    })

    expect(getByText(container, 'connectors.ceAws.testConnection.heading')).toBeDefined()

    const finishBtn = getByText(container, 'finish')
    expect(finishBtn).toBeDefined()
    act(() => {
      fireEvent.click(finishBtn!)
    })
    expect(commonProps.onClose).toBeCalled()

    expect(container).toMatchSnapshot()
  })
})
