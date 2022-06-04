import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import GitOpsCluster from '../GitOpsCluster'

jest.mock('services/cd-ng', () => ({
  useGetClusterList: jest.fn().mockImplementation(() => {
    return { data: [], refetch: jest.fn() }
  })
}))
describe('GitOps Cluster tests', () => {
  test('initial render', () => {
    const props = {
      envRef: 'test-env'
    }
    const { container } = render(
      <TestWrapper>
        <GitOpsCluster {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
