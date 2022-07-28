/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Color } from '@harness/design-system'
import type { Template } from '@templates-library/components/AbstractTemplate/Template'
import type { Scope } from '@common/interfaces/SecretsInterface'

export class TemplateFactory {
  /**
   * Couples the factory with the templates it generates
   */
  protected templateBank: Map<string, Template<unknown>>

  constructor() {
    this.templateBank = new Map()
  }

  registerTemplate<T>(template: Template<T>): void {
    this.templateBank.set(template.getType(), template as Template<unknown>)
  }

  getTemplate<T>(type: string): Template<T> | undefined {
    return this.templateBank.get(type) as Template<T>
  }

  getTemplateIsEnabled(type: string): boolean | undefined {
    return this.templateBank.get(type)?.getIsEnabled()
  }

  getTemplateLabel(type: string): string | undefined {
    return this.templateBank.get(type)?.getLabel()
  }

  getTemplateAllowedScopes(type: string): Scope[] | undefined {
    return this.templateBank.get(type)?.getAllowedScopes()
  }

  getTemplateColor(type: string): Color | undefined {
    return this.templateBank.get(type)?.getColor()
  }
}
