import React from 'react'
import { render, waitFor, fireEvent, queryByAttribute, queryAllByText, queryByText } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import mockImport from 'framework/utils/mockImport'
import { TemplateListFilter } from '../TemplateFilter'
import { filterListMock } from './mock'

mockImport('@common/hooks/useBooleanStatus', {
  useBooleanStatus: () => ({ state: true, toggle: jest.fn(), open: jest.fn(), close: jest.fn() })
})

jest.mock('services/template-ng', () => ({
  ...(jest.requireActual('services/template-ng') as any),

  useListFilesWithFilter: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetFilterList: jest.fn().mockImplementation(() => {
    return { mutate: jest.fn(), loading: false, data: filterListMock }
  }),
  usePostFilter: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useUpdateFilter: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useDeleteFilter: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

const TestComponent = (): React.ReactElement => (
  <TestWrapper>{<TemplateListFilter onFilterListUpdate={jest.fn()} />}</TestWrapper>
)
describe('template filter', () => {
  test('Should render <TemplateFilter />', async () => {
    const { container, getByTestId } = render(TestComponent())
    await waitFor(() => getByTestId('filter-select'))
    const filterSelector = getByTestId('filter-select')
    expect(filterSelector).toBeTruthy()
    fireEvent.click(filterSelector)
    await waitFor(() => queryByAttribute('class', document.body, 'bp3-popover-content'))
    const menuItems = document.querySelectorAll('[class*="menuItem"]')
    expect(menuItems?.length).toBe(filterListMock.data.content.length)
    fireEvent.click(menuItems[0])
    expect(getByTestId('dropdown-value')).toHaveTextContent(filterListMock.data.content[0].name)
    expect(container).toBeDefined()
    const filterBtn = container.querySelector('[id="ngfilterbtn"]') as HTMLButtonElement
    fireEvent.click(filterBtn!)

    const f1 = queryAllByText(document.body, 'temp7')[0]
    fireEvent.click(f1!)
    const resetBtn = queryByText(document.body, 'filters.clearAll')
    fireEvent.click(resetBtn!)
    fireEvent.click(filterBtn!)
    fireEvent.click(f1!)
    const applyBtn = queryByText(document.body, 'filters.apply')
    fireEvent.click(applyBtn!)
  })

  test('Check filter panel', async () => {
    const { container } = render(TestComponent())

    await waitFor(() => container.querySelector('#ngfilterbtn')!)
    const filterBtn = container.querySelector('#ngfilterbtn')!
    fireEvent.click(filterBtn)
    const portal = document.getElementsByClassName('bp3-portal')[0]
    expect(portal).toBeTruthy()
  })
})
