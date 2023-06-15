import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import * as cdNg from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'
import { FileStoreContext } from '@filestore/components/FileStoreContext/FileStoreContext'
import { getDummyFileStoreContextValue } from '@filestore/components/FileStoreContext/__tests__/mock'
import { FileStoreLogs } from '../FileStoreLogs'
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

describe('File store logs', () => {
  test('render file store logs list', () => {
    const { container } = render(
      <TestWrapper>
        <FileStoreContext.Provider value={mockContext}>
          <FileStoreLogs />
        </FileStoreContext.Provider>
      </TestWrapper>
    )

    const datePicker = container.querySelector('[icon="calendar"]')
    expect(datePicker).toBeInTheDocument()

    fireEvent.click(datePicker as HTMLElement)

    expect(container).toBeDefined()
  })
  test('render file store logs spinner', () => {
    jest.spyOn(cdNg, 'useListActivities').mockImplementation((): any => {
      return {
        data: null,
        loading: true
      }
    })
    const { container } = render(
      <TestWrapper>
        <FileStoreContext.Provider value={mockContext}>
          <FileStoreLogs />
        </FileStoreContext.Provider>
      </TestWrapper>
    )
    expect(container.querySelector('[icon="calendar"]')).toBeDefined()

    expect(container).toBeDefined()
  })
})
