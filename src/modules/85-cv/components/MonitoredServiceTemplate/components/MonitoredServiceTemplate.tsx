/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IconName } from '@harness/uicore'
import { Template } from '@templates-library/components/AbstractTemplate/Template'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import type { TemplateInputsProps } from '@templates-library/components/TemplateInputs/TemplateInputs'
import type { TemplateSummaryResponse } from 'services/template-ng'
import MonitoredServiceInputSetsTemplate from '@cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/MonitoredServiceInputSetsTemplate'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudioInternal'
import { MonitoredTemplateCanvasWithRef } from './MonitoredServiceTemplateCanvas'
import { getMonitoredServiceTemplateScope } from './MonitoredServiceTemplateCanvas.utils'

export class MonitoredServiceTemplate extends Template {
  protected label = 'Monitored Service'
  protected type = TemplateType.MonitoredService
  protected icon: IconName = 'cv-main'
  protected allowedScopes = [Scope.PROJECT, Scope.ORG, Scope.ACCOUNT]
  protected colorMap = {
    color: '#06B7C3',
    stroke: '#D4E7D1',
    fill: '#E4F7E1'
  }
  protected isRemoteEnabled = true

  renderTemplateCanvas(formikRef: TemplateFormRef): JSX.Element {
    return <MonitoredTemplateCanvasWithRef ref={formikRef} />
  }

  renderTemplateInputsForm(
    props: TemplateInputsProps & {
      accountId: string
      template: TemplateInputsProps['template'] & { templateScope: TemplateSummaryResponse['templateScope'] }
    }
  ): JSX.Element {
    const { template, accountId } = props
    const { identifier = '', orgIdentifier = '', projectIdentifier = '', versionLabel = '' } = template

    const templateScope = getMonitoredServiceTemplateScope(accountId, template)

    const templateData = {
      accountId,
      identifier,
      orgIdentifier,
      projectIdentifier,
      versionLabel,
      templateScope
    }
    return <MonitoredServiceInputSetsTemplate templateData={templateData} />
  }
}
