/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { ButtonVariation, ButtonSize, ButtonProps } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { useStrings } from 'framework/strings'
import type { EntityGitDetails, PipelineInfoConfig, StageElementConfig } from 'services/pipeline-ng'
import type { StepOrStepGroupOrTemplateStepData } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useSaveAsTemplate } from '@pipeline/components/PipelineStudio/SaveTemplateButton/useSaveAsTemplate'
import css from './SaveTemplateButton.module.scss'

type TemplateData = StepOrStepGroupOrTemplateStepData | StageElementConfig | PipelineInfoConfig

export interface SaveTemplateButtonProps {
  data: TemplateData | (() => Promise<TemplateData>)
  gitDetails?: EntityGitDetails
  type: 'Step' | 'Stage' | 'Pipeline'
  buttonProps?: ButtonProps
}

export function SaveTemplateButton({ data, gitDetails, type, buttonProps }: SaveTemplateButtonProps): JSX.Element {
  const { getString } = useStrings()
  const { save } = useSaveAsTemplate({ data, gitDetails, type, fireSuccessEvent: true })

  return (
    <RbacButton
      withoutCurrentColor
      text={buttonProps?.variation === ButtonVariation.ICON ? undefined : getString('common.saveAsTemplate')}
      className={buttonProps?.variation === ButtonVariation.ICON ? css.iconButton : ''}
      variation={ButtonVariation.SECONDARY}
      size={ButtonSize.SMALL}
      icon="upload-box"
      iconProps={{ color: Color.PRIMARY_7 }}
      onClick={save}
      permission={{
        permission: PermissionIdentifier.EDIT_TEMPLATE,
        resource: {
          resourceType: ResourceType.TEMPLATE
        }
      }}
      featuresProps={{
        featuresRequest: {
          featureNames: [FeatureIdentifier.TEMPLATE_SERVICE]
        }
      }}
      {...buttonProps}
    />
  )
}
