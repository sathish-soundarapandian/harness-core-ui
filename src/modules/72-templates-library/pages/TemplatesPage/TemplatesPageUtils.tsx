/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@wings-software/uicore'
import { get } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import type { TemplateSummaryResponse } from 'services/template-ng'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import type { NGTemplateInfoConfigWithGitDetails } from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'
import templateFactory from '@templates-library/components/Templates/TemplatesFactory'

export enum Sort {
  DESC = 'DESC',
  ASC = 'ASC'
}

export enum TemplateListType {
  Stable = 'Stable',
  LastUpdated = 'LastUpdated',
  All = 'All'
}

export enum SortFields {
  LastUpdatedAt = 'lastUpdatedAt',
  RecentActivity = 'executionSummaryInfo.lastExecutionTs',
  AZ09 = 'AZ09',
  ZA90 = 'ZA90',
  Name = 'name'
}

export const getTypeForTemplate = (
  getString: UseStringsReturn['getString'],
  template?: NGTemplateInfoConfigWithGitDetails | TemplateSummaryResponse
): string | undefined => {
  const templateTye =
    (template as TemplateSummaryResponse)?.templateEntityType || (template as NGTemplateInfoConfigWithGitDetails)?.type
  const childType =
    (template as TemplateSummaryResponse)?.childType || get(template as NGTemplateInfoConfigWithGitDetails, 'spec.type')
  switch (templateTye) {
    case TemplateType.Step:
      return factory.getStepName(childType)
    case TemplateType.Stage:
      return stagesCollection.getStageAttributes(childType, getString)?.name
    default:
      return templateFactory.getTemplateLabel(templateTye)
  }
}

export const getIconForTemplate = (
  getString: UseStringsReturn['getString'],
  template?: NGTemplateInfoConfigWithGitDetails | TemplateSummaryResponse
): IconName | undefined => {
  const templateType =
    (template as TemplateSummaryResponse)?.templateEntityType || (template as NGTemplateInfoConfigWithGitDetails)?.type
  const childType =
    (template as TemplateSummaryResponse)?.childType || get(template as NGTemplateInfoConfigWithGitDetails, 'spec.type')
  switch (templateType) {
    case TemplateType.Step:
      return factory.getStepIcon(childType)
    case TemplateType.Stage:
      return stagesCollection.getStageAttributes(childType, getString)?.icon
    default:
      return templateFactory.getTemplateIcon(templateType)
  }
}
