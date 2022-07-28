/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Color } from '@harness/design-system'
import type { TemplateType } from '@templates-library/utils/templatesUtils'
import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudio'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { TemplateInputsProps } from '../TemplateInputs/TemplateInputs'

export interface TemplateProps<T, U = unknown> {
  customTemplateProps?: U
  formikRef?: TemplateFormRef<T>
}

export interface TemplateInputSet {
  renderTemplateInputsForm: (_props: TemplateInputsProps & { accountId: string }) => JSX.Element
}

export abstract class Template<T> implements TemplateInputSet {
  protected abstract type: TemplateType
  protected abstract label: string
  protected abstract color: Color
  protected isEnabled = true
  protected allowedScopes = [Scope.PROJECT, Scope.ORG, Scope.ACCOUNT]

  getType(): TemplateType {
    return this.type
  }

  getLabel(): string {
    return this.label
  }

  getIsEnabled(): boolean {
    return this.isEnabled
  }

  getAllowedScopes(): Scope[] {
    return this.allowedScopes
  }

  getColor(): Color {
    return this.color
  }

  abstract renderTemplateCanvas(props: TemplateProps<T>): JSX.Element

  renderTemplateInputsForm(_props: TemplateInputsProps & { accountId: string }) {
    return <> </>
  }
}
