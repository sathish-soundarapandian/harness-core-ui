/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { unset } from 'lodash-es'
import type { StringKeys } from 'framework/strings'
import { stageTemplateMock } from '@templates-library/components/TemplateStudio/__tests__/stateMock'
import { getAllowedTemplateTypes, getVersionLabelText, TemplateType } from '@templates-library/utils/templatesUtils'
import { Scope } from '@common/interfaces/SecretsInterface'
import templateFactory from '@templates-library/components/Templates/TemplatesFactory'
import { StepTemplate } from '@templates-library/components/Templates/StepTemplate/StepTemplate'
import { StageTemplate } from '@templates-library/components/Templates/StageTemplate/StageTemplate'
import { PipelineTemplate } from '@templates-library/components/Templates/PipelineTemplate/PipelineTemplate'
// eslint-disable-next-line no-restricted-imports
import { MonitoredServiceTemplate } from '@cv/components/MonitoredServiceTemplate/components/MonitoredServiceTemplate'

function getString(key: StringKeys): StringKeys {
  return key
}

describe('templatesUtils tests', () => {
  beforeAll(() => {
    templateFactory.registerTemplate(new StepTemplate())
    templateFactory.registerTemplate(new StageTemplate())
    templateFactory.registerTemplate(new PipelineTemplate())
    templateFactory.registerTemplate(new MonitoredServiceTemplate())
  })

  test('Test getVersionLabelText method', () => {
    expect(getVersionLabelText(stageTemplateMock, getString)).toEqual('v1')
    expect(getVersionLabelText({ ...stageTemplateMock, stableTemplate: true }, getString)).toEqual(
      'templatesLibrary.stableVersion'
    )
    unset(stageTemplateMock, 'versionLabel')
    expect(getVersionLabelText(stageTemplateMock, getString)).toEqual('templatesLibrary.alwaysUseStableVersion')
  })

  test('Test getAllowedTemplateTypes method', () => {
    expect(getAllowedTemplateTypes(Scope.PROJECT)).toEqual([
      { disabled: false, label: 'Step', value: 'Step' },
      { disabled: false, label: 'Stage', value: 'Stage' },
      { disabled: false, label: 'Pipeline', value: 'Pipeline' },
      { disabled: false, label: 'Monitored Service', value: 'MonitoredService' }
    ])
    expect(getAllowedTemplateTypes(Scope.PROJECT, { [TemplateType.MonitoredService]: false })).toEqual(
      expect.arrayContaining([
        {
          disabled: true,
          label: 'Monitored Service',
          value: 'MonitoredService'
        }
      ])
    )
  })
})
