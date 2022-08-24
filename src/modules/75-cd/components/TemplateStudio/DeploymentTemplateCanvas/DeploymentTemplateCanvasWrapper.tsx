/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { set } from 'lodash-es'
import React from 'react'
import { useParams } from 'react-router-dom'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudio'
import { DeploymentConfigCanvasWithRef } from '@cd/components/TemplateStudio/DeploymentTemplateCanvas/DeploymentConfigCanvas'
import { DeploymentContextProvider } from '@cd/context/DeploymentContext/DeploymentContextProvider'
import type { ModulePathParams, TemplateStudioPathProps } from '@common/interfaces/RouteInterfaces'

const DeploymentTemplateCanvasWrapper = (_props: unknown, formikRef: TemplateFormRef) => {
  const {
    state: { template, gitDetails },
    updateTemplate,
    isReadonly
  } = React.useContext(TemplateContext)

  const { accountId, projectIdentifier, orgIdentifier, templateIdentifier } = useParams<
    TemplateStudioPathProps & ModulePathParams
  >()

  const onDeploymentConfigUpdate = async (configValues: any) => {
    set(template, 'spec', configValues)
    await updateTemplate(template)
  }

  return (
    <DeploymentContextProvider
      queryParams={{ accountIdentifier: accountId, orgIdentifier, projectIdentifier }}
      templateIdentifier={templateIdentifier}
      onDeploymentConfigUpdate={onDeploymentConfigUpdate}
      deploymentConfigInitialValues={template.spec}
      isReadOnly={isReadonly}
      gitDetails={gitDetails}
    >
      <DeploymentConfigCanvasWithRef ref={formikRef} />
    </DeploymentContextProvider>
  )
}

export const DeploymentTemplateCanvasWrapperWithRef = React.forwardRef(DeploymentTemplateCanvasWrapper)
