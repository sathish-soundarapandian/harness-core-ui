/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, isEmpty } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings'
import type { TemplateSummaryResponse } from 'services/template-ng'
import templateFactory from '@templates-library/components/Templates/TemplatesFactory'
import type { Scope } from '@common/interfaces/SecretsInterface'

export enum TemplateType {
  Step = 'Step',
  Stage = 'Stage',
  Pipeline = 'Pipeline',
  MonitoredService = 'MonitoredService',
  Service = 'Service',
  Infrastructure = 'Infrastructure',
  StepGroup = 'StepGroup',
  Execution = 'Execution',
  SecretManager = 'SecretManager'
}

interface AllowedTemplate {
  label: string
  value: string
  disabled: boolean
}

export const getAllowedTemplateTypes = (
  scope: Scope,
  featureFlagBasedTemplates?: { [key: string]: boolean }
): { label: string; value: string; disabled?: boolean }[] => {
  const allowedTemplateTypes: AllowedTemplate[] = []
  Object.keys(TemplateType).forEach(item => {
    const template = templateFactory.getTemplate(item)
    const allowedScopes = template?.getAllowedScopes()
    if (allowedScopes && allowedScopes.includes(scope)) {
      allowedTemplateTypes.push({
        label: defaultTo(template?.getLabel(), ''),
        value: item,
        disabled: !template?.getIsEnabled() || featureFlagBasedTemplates?.[item] === false
      })
    }
  })
  return allowedTemplateTypes
}

export const getVersionLabelText = (template: TemplateSummaryResponse, getString: UseStringsReturn['getString']) => {
  return isEmpty(template.versionLabel)
    ? getString('templatesLibrary.alwaysUseStableVersion')
    : template.stableTemplate
    ? getString('templatesLibrary.stableVersion', { entity: template.versionLabel })
    : template.versionLabel
}

export const getTemplateRuntimeInputsCount = (templateInfo: { [key: string]: any }): number =>
  (JSON.stringify(templateInfo).match(/<\+input>/g) || []).length
