import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { FileStoreContext } from '@filestore/components/FileStoreContext/FileStoreContext'
import { getDummyFileStoreContextValue } from '@filestore/components/FileStoreContext/__tests__/mock'
import { ActivityLogFileStoreList } from '../ActivityLogFileStoreList'
import { mockActivityFS } from './mock'

const mockContext = getDummyFileStoreContextValue()

jest.mock('services/cd-ng', () => ({
  useListActivities: jest.fn().mockImplementation(() => {
    return {
      refetch: jest.fn(),
      error: null,
      data: { ...mockActivityFS }
    }
  })
}))

describe('File store list logs', () => {
  test('render empty file store list logs', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <FileStoreContext.Provider value={mockContext}>
          <ActivityLogFileStoreList activityList={[]} />
        </FileStoreContext.Provider>
      </TestWrapper>
    )
    expect(container.querySelector('[icon="nav-dashboard"]')).toBeDefined()
    await waitFor(() => getByText('activityHistory.noData'))
  })
  test('render file store list logs', () => {
    const { container } = render(
      <TestWrapper>
        <FileStoreContext.Provider value={mockContext}>
          <ActivityLogFileStoreList activityList={mockActivityFS.content as any[]} />
        </FileStoreContext.Provider>
      </TestWrapper>
    )
    const row = container.getElementsByClassName('TableV2--row')
    expect(row).toHaveLength(2)
    expect(row[0]).toBeInTheDocument()
    expect(container).toBeDefined()
  })
})
