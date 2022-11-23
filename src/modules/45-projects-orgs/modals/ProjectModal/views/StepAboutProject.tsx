/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'
import type { StepProps } from '@harness/uicore'
import type {
  Project,
  ResponseOrganizationResponse,
  ResponsePageOrganizationResponse,
  ResponseProjectResponse
} from 'services/cd-ng'
import type { UseGetMockData, UseMutateMockData } from '@common/utils/testUtils'
import CreateProject from './CreateProject'
import EditProject from './EditProject'

interface ProjectModalData {
  closeModal?: () => void
  onProjectSubmit?: (project: Project) => Promise<void>
  modules?: Project['modules']
  orgMockData?: UseGetMockData<ResponsePageOrganizationResponse>
  editOrgMockData?: UseGetMockData<ResponseOrganizationResponse>
  projectMockData?: UseGetMockData<ResponseProjectResponse>
  createMock?: UseMutateMockData<ResponseProjectResponse>
}

const StepAboutProject: React.FC<StepProps<Project> & ProjectModalData> = props => {
  const { prevStepData, orgMockData } = props
  const isStepBack = prevStepData?.identifier ? true : false
  return (
    <>
      {isStepBack ? (
        <EditProject isStep={isStepBack} {...props} />
      ) : (
        <CreateProject orgMockData={orgMockData} {...props} />
      )}
    </>
  )
}

export default StepAboutProject
