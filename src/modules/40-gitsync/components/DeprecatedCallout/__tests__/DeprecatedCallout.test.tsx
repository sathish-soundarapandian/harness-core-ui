import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { projectPathProps } from '@common/utils/routeUtils'
import DeprecatedCallout from '../DeprecatedCallout'
describe('DeprecatedCallout testing', () => {
  test('Should render DeprecatedCallout', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toProjectDetails(projectPathProps)}
        pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
      >
        <DeprecatedCallout />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
