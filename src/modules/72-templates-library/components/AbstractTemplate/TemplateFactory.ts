/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@wings-software/uicore'
import type React from 'react'
import type { Template } from '@templates-library/components/AbstractTemplate/Template'
import type { Scope } from '@common/interfaces/SecretsInterface'

export class TemplateFactory {
  /**
   * Couples the factory with the templates it generates
   */
  protected templateBank: Map<string, Template>

  constructor() {
    this.templateBank = new Map()
  }

  registerTemplate(template: Template): void {
    this.templateBank.set(template.getType(), template as Template)
  }

  getTemplate(type: string): Template | undefined {
    return this.templateBank.get(type) as Template
  }

  getTemplateLabel(type: string): string | undefined {
    return this.templateBank.get(type)?.getLabel()
  }

  getTemplateIcon(type: string): IconName | undefined {
    return this.templateBank.get(type)?.getIcon()
  }

  getTemplateColorMap(type: string): React.CSSProperties | undefined {
    return this.templateBank.get(type)?.getColorMap()
  }

  getTemplateAllowedScopes(type: string): Scope[] | undefined {
    return this.templateBank.get(type)?.getAllowedScopes()
  }
}
