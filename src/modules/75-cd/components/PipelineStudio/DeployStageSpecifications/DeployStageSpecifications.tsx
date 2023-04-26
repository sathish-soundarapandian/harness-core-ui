/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { debounce, defaultTo, isEmpty, set } from 'lodash-es'
import produce from 'immer'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { StageElementConfig } from 'services/cd-ng'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { deleteStageInfo, ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { EditStageView } from '../DeployStage/EditStageView/EditStageView'
import type { EditStageFormikType } from '../DeployStage/EditStageViewInterface'

export default function DeployStageSpecifications(props: React.PropsWithChildren<unknown>): JSX.Element {
  const {
    state: {
      selectionState: { selectedStageId = '' }
    },
    updateStage,
    isReadonly,
    getStageFromPipeline
  } = usePipelineContext()
  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleChange = React.useCallback(
    debounce((values: DeploymentStageElementConfig): void => {
      const gitopsEnableNow = !stage?.stage?.spec?.gitOpsEnabled && (values as EditStageFormikType).gitOpsEnabled

      const newStage = produce(defaultTo(stage?.stage, {} as DeploymentStageElementConfig), draft => {
        Object.assign(draft, values)

        if (draft.spec) {
          if (gitopsEnableNow) {
            draft.spec.gitOpsEnabled = (values as EditStageFormikType).gitOpsEnabled
            delete (draft as EditStageFormikType).gitOpsEnabled
            delete draft.spec.service
            delete draft.spec.services
          }
          if (
            draft.spec.deploymentType === ServiceDeploymentType.GoogleCloudFunctions &&
            !isEmpty((draft as EditStageFormikType).environmentType)
          ) {
            delete (draft as EditStageFormikType).environmentType
          }
        }
      })

      updateStage(newStage)
    }, 300),
    [stage?.stage, updateStage]
  )

  const updateDeploymentType = React.useCallback(
    (deploymentType: ServiceDeploymentType, isDeleteStage?: boolean) => {
      if (stage) {
        updateStage(
          produce(stage, draft => {
            set(draft, 'stage.spec.deploymentType', deploymentType)
            if (isDeleteStage) {
              deleteStageInfo(draft?.stage)
            }
          }).stage as StageElementConfig
        )
      }
    },
    [stage, updateStage]
  )

  return (
    <EditStageView
      isReadonly={isReadonly}
      data={stage}
      context={'setup'}
      onChange={handleChange}
      updateDeploymentType={updateDeploymentType}
    >
      {props.children}
    </EditStageView>
  )
}
