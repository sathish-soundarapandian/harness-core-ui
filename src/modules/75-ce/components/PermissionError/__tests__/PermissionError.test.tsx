import React from 'react'
import { render } from '@testing-library/react'
import PermissionError from '@ce/images/permission-error.svg'
import { TestWrapper } from '@common/utils/testUtils'
import HandleError from '../PermissionError'

const params = {
  accountId: 'TEST_ACC'
}

describe('Test cases for permission error component', () => {
  test('Should render the permission error', () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <HandleError imgSrc={PermissionError} errorMsg={'Missing permission'} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
