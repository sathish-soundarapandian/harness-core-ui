/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type React from 'react'
import type { IconName } from '@wings-software/uicore'
import type { TemplateType } from '@templates-library/utils/templatesUtils'
import type { Scope } from '@common/interfaces/SecretsInterface'
import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudio'
import type { TemplateInputsProps } from '../TemplateInputs/TemplateInputs'

export abstract class Template {
  protected abstract label: string
  protected abstract type: TemplateType
  protected abstract icon: IconName
  protected abstract allowedScopes: Scope[]
  protected abstract colorMap: React.CSSProperties
  protected isEnabled = true

  getLabel(): string {
    return this.label
  }

  getType(): TemplateType {
    return this.type
  }

  getIcon(): IconName {
    return this.icon
  }

  getColorMap(): React.CSSProperties {
    return this.colorMap
  }

  getAllowedScopes(): Scope[] {
    return this.allowedScopes
  }

  getIsEnabled(): boolean {
    return this.isEnabled
  }

  abstract renderTemplateCanvas(formikRef?: TemplateFormRef): JSX.Element

  abstract renderTemplateInputsForm(props: TemplateInputsProps & { accountId: string }): JSX.Element
}
