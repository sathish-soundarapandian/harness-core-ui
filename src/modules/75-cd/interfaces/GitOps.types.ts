/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type React from 'react'
import type { Breadcrumb } from '@harness/uicore'
import type { GetLinkForAccountResourcesProps } from '@common/utils/BreadcrumbUtils'
import type {
  DeployEnvironmentProps,
  NewEditEnvironmentModalProps
} from '@cd/components/PipelineSteps/DeployEnvStep/DeployEnvStep'
import type {
  DeployServiceProps,
  NewEditServiceModalProps
} from '@cd/components/PipelineSteps/DeployServiceStep/DeployServiceInterface'
import type { ServiceReferenceFieldProps } from '@pipeline/components/FormMultiTypeServiceFeild/FormMultiTypeServiceFeild'
import type { EnvironmentReferenceFieldProps } from '@pipeline/components/FormMultiTypeEnvironmentField/FormMultiTypeEnvironmentField'

export interface GitOpsCustomMicroFrontendProps {
  getLinkForAccountResources?(props: GetLinkForAccountResourcesProps): Breadcrumb[]
  customComponents: {
    DeployServiceWidget: React.ComponentType<DeployServiceProps>
    DeployEnvironmentWidget: React.ComponentType<DeployEnvironmentProps>
    NewEditServiceModal: React.ComponentType<NewEditServiceModalProps>
    NewEditEnvironmentModal: React.ComponentType<NewEditEnvironmentModalProps>
    MultiTypeServiceField: React.ComponentType<ServiceReferenceFieldProps>
    MultiTypeEnvironmentField: React.ComponentType<EnvironmentReferenceFieldProps>
  }
}
