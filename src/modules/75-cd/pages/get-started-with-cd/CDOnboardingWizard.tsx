/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams, ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { CDOnboardingProvider } from './CDOnboardingStore'
import { DeployProvisioningWizard } from './DeployProvisioningWizard/DeployProvisioningWizard'

export default function CDOnboardingWizard(): React.ReactElement {
  const { accountId, orgIdentifier, projectIdentifier, serviceId } = useParams<ProjectPathProps & ServicePathProps>()
  const { branch, repoIdentifier } = useQueryParams<GitQueryParams>()
  return (
    <CDOnboardingProvider
      queryParams={{ accountIdentifier: accountId, orgIdentifier, projectIdentifier, repoIdentifier, branch }}
      pipelineIdentifier=""
      serviceIdentifier={serviceId}
    >
      <DeployProvisioningWizard />
    </CDOnboardingProvider>
  )
}
