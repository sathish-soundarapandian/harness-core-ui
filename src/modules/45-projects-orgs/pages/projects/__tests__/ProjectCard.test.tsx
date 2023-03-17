/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import ProjectCard from '@projects-orgs/components/ProjectCard/ProjectCard'
import type { ProjectAggregateDTO } from 'services/cd-ng'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { accountPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import { responseProjectAggregateDTO, responseProjectAggregateDTOWithNoModules } from './ProjectPageMock'

const handleInviteCollaborators = jest.fn()

describe('Project Card test', () => {
  test('initializes ok ', async () => {
    const { container, findAllByText, findByTestId } = render(
      <TestWrapper
        path={routes.toProjects({ ...accountPathProps })}
        pathParams={{ accountId: 'testAcc' }}
        defaultAppStoreValues={defaultAppStoreValues}
        defaultLicenseStoreValues={{
          licenseInformation: {
            CD: { edition: 'FREE', status: 'ACTIVE' }
          }
        }}
      >
        <ProjectCard
          data={responseProjectAggregateDTO.data as ProjectAggregateDTO}
          handleInviteCollaborators={handleInviteCollaborators}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    const inviteButtons = await findAllByText('+')
    expect(inviteButtons).toHaveLength(2)
    act(() => {
      fireEvent.click(inviteButtons[0])
    })
    expect(handleInviteCollaborators).toHaveBeenCalled()
    act(() => {
      fireEvent.click(inviteButtons[1])
    })
    expect(handleInviteCollaborators).toHaveBeenCalledTimes(2)

    const content = await findByTestId('card-content')
    expect(content).toBeDefined()
    act(() => {
      fireEvent.click(content)
    })
    const location = await findByTestId('location')
    expect(location.innerHTML).toEqual('/account/testAcc/home/orgs/testOrg/projects/dummy_name/details')
  }),
    test('Preview is ok', async () => {
      const { container } = render(
        <TestWrapper
          path={routes.toProjects({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
          defaultAppStoreValues={defaultAppStoreValues}
          defaultLicenseStoreValues={{
            licenseInformation: {
              CD: { edition: 'FREE', status: 'ACTIVE' }
            }
          }}
        >
          <ProjectCard data={responseProjectAggregateDTOWithNoModules.data as ProjectAggregateDTO} isPreview={true} />
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    })
})
