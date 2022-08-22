/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IconName } from '@wings-software/uicore'
import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudio'
import { Template } from '@templates-library/components/AbstractTemplate/Template'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import { StageTemplateCanvasWrapperWithRef } from '@templates-library/components/TemplateStudio/StageTemplateCanvas/StageTemplateCanvasWrapper'
import { Scope } from '@common/interfaces/SecretsInterface'
import { TemplateInputs, TemplateInputsProps } from '@templates-library/components/TemplateInputs/TemplateInputs'

export class StageTemplate extends Template {
  protected label = 'Stage'
  protected type = TemplateType.Stage
  protected icon: IconName = 'disable'
  protected allowedScopes = [Scope.PROJECT, Scope.ORG, Scope.ACCOUNT]
  protected colorMap = {
    color: '#06B7C3',
    stroke: '#C0FBFE',
    fill: '#D3FCFE'
  }

  renderTemplateCanvas(formikRef: TemplateFormRef): JSX.Element {
    return <StageTemplateCanvasWrapperWithRef ref={formikRef} />
  }

  renderTemplateInputsForm(props: TemplateInputsProps & { accountId: string }): JSX.Element {
    return <TemplateInputs template={props.template} />
  }
}
