/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { ButtonVariation, IconName, SplitButton, SplitButtonOption } from '@harness/uicore'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import RbacButton from '@rbac/components/Button/Button'
import { usePermission } from '@rbac/hooks/usePermission'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'

export interface CreatePipelineButtonProps {
  label?: string
  iconName?: IconName
  onCreatePipelineClick: (event: React.MouseEvent<Element, MouseEvent>) => void
  onImportPipelineClick: (event: React.MouseEvent<Element, MouseEvent>) => void
}

export default function CreatePipelineButton({
  label,
  iconName,
  onCreatePipelineClick,
  onImportPipelineClick
}: CreatePipelineButtonProps): JSX.Element {
  const { getString } = useStrings()
  const { isGitSimplificationEnabled } = useAppStore()
  const isImportFlowEnabled = useFeatureFlag(FeatureFlag.NG_GIT_EXPERIENCE_IMPORT_FLOW)

  const [canCreate] = usePermission({
    permissions: [PermissionIdentifier.EDIT_PIPELINE],
    resource: {
      resourceType: ResourceType.PIPELINE
    }
  })

  if (isGitSimplificationEnabled && isImportFlowEnabled) {
    return (
      <SplitButton
        variation={ButtonVariation.PRIMARY}
        data-testid="add-pipeline"
        icon={iconName ?? 'plus'}
        text={label ?? getString('common.createPipeline')}
        onClick={onCreatePipelineClick}
        tooltipProps={{
          dataTooltipId: 'addPipeline'
        }}
        disabled={!canCreate}
        dropdownDisabled={!canCreate}
      >
        <SplitButtonOption onClick={onImportPipelineClick} text={getString('common.importFromGit')} icon={'plus'} />
      </SplitButton>
    )
  }

  return (
    <RbacButton
      variation={ButtonVariation.PRIMARY}
      data-testid="add-pipeline"
      icon={iconName ?? 'plus'}
      text={label ?? getString('common.createPipeline')}
      onClick={onCreatePipelineClick}
      tooltipProps={{
        dataTooltipId: 'addPipeline'
      }}
      permission={{
        permission: PermissionIdentifier.EDIT_PIPELINE,
        resource: {
          resourceType: ResourceType.PIPELINE
        }
      }}
    />
  )
}
