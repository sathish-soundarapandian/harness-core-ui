/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { TemplateLinkConfig } from 'services/pipeline-ng'
import type { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import type {
  GetTemplateProps,
  GetTemplateResponse
} from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'
import type { Scope } from '@common/interfaces/SecretsInterface'
import { BootstrapDeployInfraDefinitionWrapper } from '@cd/components/EnvironmentsV2/EnvironmentDetails/InfrastructureDefinition/BootstrapDeployInfraDefinitionWrapper'

export default function InfrastructureModal({
  hideModal,
  refetch,
  selectedInfrastructure,
  environmentIdentifier,
  stageDeploymentType,
  stageCustomDeploymentData,
  getTemplate,
  scope
}: {
  hideModal: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refetch: any
  scope: Scope
  selectedInfrastructure?: string
  environmentIdentifier: string
  stageDeploymentType?: ServiceDeploymentType
  stageCustomDeploymentData?: TemplateLinkConfig
  getTemplate?: (data: GetTemplateProps) => Promise<GetTemplateResponse>
}): React.ReactElement {
  return (
    <BootstrapDeployInfraDefinitionWrapper
      closeInfraDefinitionDetails={hideModal}
      refetch={refetch}
      scope={scope}
      environmentIdentifier={environmentIdentifier}
      selectedInfrastructure={selectedInfrastructure}
      stageDeploymentType={stageDeploymentType}
      stageCustomDeploymentData={stageCustomDeploymentData}
      getTemplate={getTemplate}
    />
  )
}
