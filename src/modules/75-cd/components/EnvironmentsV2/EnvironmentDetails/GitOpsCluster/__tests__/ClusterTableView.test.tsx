import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ClusterTableView from '../../ClusterTableView'

const props = {
  linkedClusters: {
    data: {
      content: [
        {
          clusterRef: 'test-cluster'
        }
      ]
    }
  },
  loading: false,
  refetch: jest.fn(),
  envRef: 'test-env'
}
describe('GitOps Cluster tests', () => {
  test('initial render', () => {
    const { container } = render(
      <TestWrapper>
        <ClusterTableView {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
