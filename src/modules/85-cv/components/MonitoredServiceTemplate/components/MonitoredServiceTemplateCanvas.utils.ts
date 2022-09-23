/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isEmpty } from 'lodash-es'
import type { JsonNode, NGTemplateInfoConfig } from 'services/template-ng'
import { DefaultSpec } from './MonitoredServiceTemplateCanvas.constants'

/**
 * If the template spec is empty and the template name is not empty, then return a new template with
 * the default spec
 * @param {NGTemplateInfoConfig} template - The template object that is being created.
 */
export const createdInitTemplateValue = (template: NGTemplateInfoConfig): NGTemplateInfoConfig =>
  isEmpty(template.spec) && !isEmpty(template.name)
    ? {
        ...template,
        spec: { ...DefaultSpec } as JsonNode
      }
    : template
