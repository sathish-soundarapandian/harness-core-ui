/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IconName } from '@wings-software/uicore'
import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudioInternal'
import { Template } from '@templates-library/components/AbstractTemplate/Template'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import { DeploymentTemplateCanvasWrapperWithRef } from '@cd/components/TemplateStudio/DeploymentTemplateCanvas/DeploymentTemplateCanvasWrapper'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { TemplateInputsProps } from '@templates-library/components/TemplateInputs/TemplateInputs'
import { TemplateInputs } from '@templates-library/components/TemplateInputs/TemplateInputs'

export class DeploymentTemplate extends Template {
  protected type = TemplateType.CustomDeployment
  protected label = 'Deployment'
  protected icon: IconName = 'CustomDeployment'
  protected allowedScopes = [Scope.PROJECT, Scope.ORG, Scope.ACCOUNT]
  protected colorMap = {
    color: '#558B2F',
    stroke: '#EAF8DB',
    fill: '#F1FAE6'
  }
  protected isRemoteEnabled = false
  // protected isEnabled = false

  renderTemplateCanvas(formikRef: TemplateFormRef): JSX.Element {
    return <DeploymentTemplateCanvasWrapperWithRef ref={formikRef} />
  }
  renderTemplateInputsForm({ template }: TemplateInputsProps & { accountId: string }): JSX.Element {
    return <TemplateInputs template={template} />
  }
}
