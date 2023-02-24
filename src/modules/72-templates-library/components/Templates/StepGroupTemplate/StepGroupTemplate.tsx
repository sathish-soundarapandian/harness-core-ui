/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IconName } from '@harness/uicore'
import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudioInternal'
import { Template } from '@templates-library/components/AbstractTemplate/Template'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import { StepGroupTemplateCanvasWrapperWithRef } from '@templates-library/components/TemplateStudio/StepGroupTemplateCanvas/StepGroupTemplateCanvasWrapper'
import { Scope } from '@common/interfaces/SecretsInterface'
import { TemplateInputs, TemplateInputsProps } from '@templates-library/components/TemplateInputs/TemplateInputs'

export class StepGroupTemplate extends Template {
  protected label = 'Step Group'
  protected type = TemplateType.StepGroup
  protected icon: IconName = 'step-group'
  protected allowedScopes = [Scope.PROJECT, Scope.ORG, Scope.ACCOUNT]
  protected colorMap = {
    color: '#592BAA',
    stroke: '#E1D0FF',
    fill: '#EADEFF'
  }
  protected isRemoteEnabled = true

  renderTemplateCanvas(formikRef: TemplateFormRef): JSX.Element {
    return <StepGroupTemplateCanvasWrapperWithRef ref={formikRef} />
  }

  renderTemplateInputsForm({
    template,
    templateInputSetFetchParams
  }: TemplateInputsProps & { accountId: string }): JSX.Element {
    return <TemplateInputs template={template} templateInputSetFetchParams={templateInputSetFetchParams} />
  }
}
