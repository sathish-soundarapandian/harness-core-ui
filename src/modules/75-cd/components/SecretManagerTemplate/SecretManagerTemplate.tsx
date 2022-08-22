/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IconName } from '@wings-software/uicore'
import { Template } from '@templates-library/components/AbstractTemplate/Template'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudio'
import { ScriptTemplateCanvasWithRef } from '@cd/components/ScriptTemplateCanvas/ScriptTemplateCanvas'
import type { TemplateInputsProps } from '@templates-library/components/TemplateInputs/TemplateInputs'
import { Scope } from '@common/interfaces/SecretsInterface'

export class SecretManagerTemplate extends Template {
  protected label = 'Secret Manager'
  protected type = TemplateType.SecretManager
  protected icon: IconName = 'script'
  protected allowedScopes = [Scope.PROJECT, Scope.ORG, Scope.ACCOUNT]
  protected colorMap = {
    color: '#06B7C3',
    stroke: '#D4E7D1',
    fill: '#CDF4FE'
  }

  renderTemplateCanvas(formikRef: TemplateFormRef): JSX.Element {
    return <ScriptTemplateCanvasWithRef ref={formikRef} />
  }

  renderTemplateInputsForm(_props: TemplateInputsProps & { accountId: string }): JSX.Element {
    return <></>
  }
}
