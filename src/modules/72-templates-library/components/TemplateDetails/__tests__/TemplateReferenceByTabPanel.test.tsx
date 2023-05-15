import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import routes from '@common/RouteDefinitions'
import { TestWrapper } from '@common/utils/testUtils'

import type { TemplateSummaryResponse } from 'services/template-ng'
import * as templateNgServices from 'services/template-ng'

import { TemplateReferenceByTabPanel } from '../TemplateReferenceByTabPanel'

import selectedTemplate from './__mocks__/selectedTemplate.json'

jest.mock('@common/pages/entityUsage/EntityUsageListingPage', () => ({
  __esModule: true,
  default: ({ setSearchTerm }: { setSearchTerm(searchTerm: string): void }) => (
    <div data-testid="mock-entity-usage-list">
      <input data-testid="mock-entity-usage-list-input" onChange={e => setSearchTerm(e.target.value)} />
    </div>
  )
}))

const templateUsageFn = jest.fn()
const searchTerm = 'test'

describe('template referenced by tab panel tests', () => {
  beforeEach(() => {
    jest.spyOn(templateNgServices, 'useListTemplateUsage').mockImplementation(
      templateUsageFn.mockReturnValue({
        data: {},
        loading: false
      })
    )
  })

  test('should update search term on change', async () => {
    render(
      <TestWrapper
        path={routes.toTemplates({
          accountId: ':accountId',
          orgIdentifier: ':orgIdentifier',
          projectIdentifier: ':projectIdentifier',
          module: ':module'
        })}
        pathParams={{
          accountId: 'dummyAccount',
          orgIdentifier: 'dummyOrg',
          projectIdentifier: 'dummyProject',
          module: 'cd'
        }}
      >
        <TemplateReferenceByTabPanel
          selectedTemplate={selectedTemplate as TemplateSummaryResponse}
          templates={[selectedTemplate as TemplateSummaryResponse]}
        />
      </TestWrapper>
    )

    await userEvent.type(screen.getByTestId('mock-entity-usage-list-input'), searchTerm)

    await waitFor(() =>
      expect(templateUsageFn).toBeCalledWith({
        queryParams: {
          accountIdentifier: 'dummyAccount',
          isStableTemplate: true,
          orgIdentifier: 'dummyOrg',
          pageIndex: 0,
          pageSize: 4,
          projectIdentifier: 'dummyProject',
          searchTerm,
          versionLabel: 'v1'
        },
        templateIdentifier: 'dummy_template'
      })
    )
  })
})
