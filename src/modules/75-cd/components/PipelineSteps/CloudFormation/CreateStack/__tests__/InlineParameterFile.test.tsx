/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, queryByAttribute, fireEvent } from '@testing-library/react'
import { Formik, FormikForm } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import * as cdServices from 'services/cd-ng'

import { InlineParameterFile } from '../InlineParameterFile'

const renderComponent = (props: any) => {
  return render(
    <TestWrapper
      path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier"
      pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
    >
      <Formik initialValues={{}} onSubmit={() => undefined} formName="wrapperComponentTestForm">
        <FormikForm>
          <InlineParameterFile {...props} />
        </FormikForm>
      </Formik>
    </TestWrapper>
  )
}

describe('Test cloudformation inline parameter with no data', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('should render with no data', () => {
    const props = {
      onClose: () => undefined,
      onSubmit: () => undefined,
      isOpen: () => undefined,
      initialValues: {}
    }
    const { container } = renderComponent(props)
    expect(container).toMatchSnapshot()
  })

  test('should render with git data', () => {
    const props = {
      onClose: () => undefined,
      onSubmit: () => undefined,
      isOpen: () => undefined,
      initialValues: {},
      awsConnectorRef: 'test',
      type: 'git',
      region: 'ireland',
      git: {
        gitConnectorRef: 'test',
        isBranch: true,
        filePath: 'file/path',
        branch: 'main'
      }
    }
    const { container } = renderComponent(props)
    expect(container).toMatchSnapshot()
  })

  test('should render with git data and making an api request', async () => {
    jest.spyOn(cdServices, 'useCFParametersForAws').mockImplementation({
      loading: false,
      refetch: jest.fn(),
      mutate: jest.fn().mockResolvedValue({
        data: {
          paramKey: 'test',
          paramType: 'String'
        }
      })
    } as any)
    const props = {
      onClose: () => undefined,
      onSubmit: () => undefined,
      isOpen: () => undefined,
      initialValues: {},
      awsConnectorRef: 'test',
      type: 'git',
      region: 'ireland',
      git: {
        gitConnectorRef: 'test',
        isBranch: true,
        filePath: 'file/path',
        branch: 'main'
      }
    }
    const { container, debug, getByText } = renderComponent(props)
    const getParams = getByText('cd.cloudFormation.retrieveNames')
    act(() => {
      fireEvent.click(getParams)
    })
    debug()
    expect(container).toMatchSnapshot()
  })
})
