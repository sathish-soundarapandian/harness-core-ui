import React from 'react'
import type { RenderResult} from '@testing-library/react';
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { Segment } from 'services/cf'
import type { SpecifyIndividualTargetsProps } from '../SpecifyIndividualTargets';
import SpecifyIndividualTargets from '../SpecifyIndividualTargets'

const renderComponent = (props: Partial<SpecifyIndividualTargetsProps> = {}): RenderResult =>
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/target-management/target-groups/:segmentId"
      pathParams={{
        accountId: 'accId',
        orgIdentifier: 'orgId',
        projectIdentifier: 'projectId',
        segmentId: 'Target_Group_1'
      }}
      queryParams={{ environment: 'env' }}
    >
      <SpecifyIndividualTargets targetGroup={{ environment: 'env' } as Segment} {...props} />
    </TestWrapper>
  )

describe('SpecifyIndividualTargets', () => {
  test('it should display the heading and target selects', async () => {
    renderComponent()

    expect(screen.getByText('cf.segmentDetail.specifyIndividualTargets')).toBeInTheDocument()
    expect(screen.getByText('cf.segmentDetail.includeTheFollowing:')).toBeInTheDocument()
    expect(screen.getByText('cf.segmentDetail.excludeTheFollowing:')).toBeInTheDocument()
  })
})
