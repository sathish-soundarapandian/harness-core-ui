/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IconName } from '@wings-software/uicore'
import { Template } from '@templates-library/components/AbstractTemplate/Template'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import type { TemplateInputsProps } from '@templates-library/components/TemplateInputs/TemplateInputs'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudio'

export class ServiceTemplate extends Template {
  protected label = 'Service'
  protected type = TemplateType.Service
  protected icon: IconName = 'disable'
  protected allowedScopes = [Scope.PROJECT, Scope.ORG, Scope.ACCOUNT]
  protected colorMap = {
    color: '#299B2C',
    stroke: '#D4E7D1',
    fill: '#E4F7E1'
  }
  protected isEnabled = false

  renderTemplateCanvas(_formikRef: TemplateFormRef): JSX.Element {
    return <></>
  }

  renderTemplateInputsForm(_props: TemplateInputsProps & { accountId: string }): JSX.Element {
    return <></>
  }
}
