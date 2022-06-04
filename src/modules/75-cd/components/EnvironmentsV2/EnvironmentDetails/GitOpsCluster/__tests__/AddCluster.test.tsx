import { render } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'

import AddCluster from '../../AddCluster'

window.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: () => null,
  unobserve: () => null
}))

jest.mock('services/cd-ng', () => ({
  getClusterListFromSourcePromise: jest.fn().mockImplementation(() => Promise.resolve([])),
  useCreateClusters: jest.fn().mockImplementation(() => {
    return { mutate: jest.fn() }
  })
}))

const props = {
  linkedClusterResponse: [],
  onHide: jest.fn(),
  refetch: jest.fn(),
  envRef: 'test-env'
}
describe('AddCluster tests', () => {
  test('initial render', () => {
    const { container } = render(
      <TestWrapper>
        <AddCluster {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
