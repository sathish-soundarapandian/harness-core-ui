/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'
import type { StepProps } from '@harness/uicore'
import type { Organization } from 'services/cd-ng'
import CreateOrganization from './CreateOrganization'
import EditOrganization from './EditOrganization'

export interface OrgModalData {
  onSuccess?: (Organization: Organization | undefined) => void
}

const StepAboutOrganization: React.FC<StepProps<Organization> & OrgModalData> = props => {
  const { prevStepData } = props
  const isStepBack = prevStepData?.identifier ? true : false
  return <>{isStepBack ? <EditOrganization isStep={isStepBack} {...props} /> : <CreateOrganization {...props} />}</>
}

export default StepAboutOrganization
