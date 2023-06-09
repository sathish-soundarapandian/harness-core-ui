import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import CannotArchiveWarning, { CannotArchiveWarningProps } from '../CannotArchiveWarning'

const prerequisitesMock = [
  {
    feature: 'flag_1',
    variations: ['var1, var2']
  },
  {
    feature: 'flag_2',
    variations: ['var1, var2']
  },
  {
    feature: 'flag_3',
    variations: ['var1, var2']
  }
]

const renderComponent = (props: Partial<CannotArchiveWarningProps> = {}): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <CannotArchiveWarning flagName="my_new_flag" prerequisites={prerequisitesMock} {...props} />
    </TestWrapper>
  )
}
describe('CannotArchiveWarning', () => {
  test('it should render the list of flags the current flag is dependent on and take the user to the detail page of the prereq flag', async () => {
    renderComponent()

    expect(screen.getByText('cf.featureFlags.archiving.cannotArchive:')).toBeInTheDocument()
    expect(screen.getByText('cf.featureFlags.archiving.removeFlag')).toBeInTheDocument()
    expect(screen.getAllByTestId('flag-prerequisite-row')).toHaveLength(3)

    prerequisitesMock.forEach(prereq => expect(screen.getByRole('link', { name: prereq.feature })).toBeInTheDocument())

    userEvent.click(screen.getByRole('link', { name: prerequisitesMock[0].feature }))

    // directing to the feature flag detail page
    expect(await screen.findByTestId('location')).toHaveTextContent(
      `/account/dummy/cf/orgs/dummy/projects/dummy/feature-flags/${prerequisitesMock[0].feature}`
    )
  })
})
