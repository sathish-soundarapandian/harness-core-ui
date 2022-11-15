/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Drawer, Position } from '@blueprintjs/core'
import { noop } from 'lodash-es'
import { Button } from '@harness/uicore'
import { DrawerSizes, DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import type { TemplateStepNode } from 'services/pipeline-ng'
import type { StepFormikRef } from '@pipeline/components/PipelineStudio/StepCommands/StepCommands'
import type { TemplateSummaryResponse } from 'services/template-ng'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { ArtifactConfigDrawerTitle } from '@pipeline/components/ArtifactsSelection/ArtifactConfigDrawer/ArtifactConfigDrawerTitle'
import { ArtifactSourceTemplateDetailsWithRef } from './ArtifactSourceTemplateDetails'
import css from './ArtifactConfigDrawer.module.scss'

interface Props {
  artifactSourceConfigNode?: TemplateStepNode
  isDrawerOpened: boolean
  onCloseDrawer: () => void
  isNewStep: boolean
  addOrUpdateTemplate: (selectedTemplate: TemplateSummaryResponse) => void
  formikRef: React.MutableRefObject<StepFormikRef | null>
  onApplyChanges: () => void
}

export function ArtifactConfigDrawer(props: Props) {
  const {
    artifactSourceConfigNode,
    isDrawerOpened,
    onCloseDrawer,
    isNewStep,
    addOrUpdateTemplate,
    formikRef,
    onApplyChanges
  } = props
  const {
    state: { gitDetails, storeMetadata },
    stepsFactory,
    isReadonly,
    allowableTypes
  } = usePipelineContext()

  return (
    <Drawer
      usePortal={true}
      autoFocus={true}
      canEscapeKeyClose={true}
      canOutsideClickClose={true}
      enforceFocus={false}
      hasBackdrop={true}
      size={DrawerSizes[DrawerTypes.StepConfig]}
      isOpen={isDrawerOpened}
      position={Position.RIGHT}
      title={
        <ArtifactConfigDrawerTitle readonly={isReadonly} discardChanges={onCloseDrawer} applyChanges={onApplyChanges} />
      }
      data-type={DrawerTypes.StepConfig}
      className={css.artifactConfigDrawer}
      isCloseButtonShown={false}
      portalClassName={'pipeline-studio-right-drawer'}
    >
      <Button minimal className={css.closeButton} icon="cross" withoutBoxShadow onClick={onCloseDrawer} />

      {artifactSourceConfigNode && (
        <ArtifactSourceTemplateDetailsWithRef
          artifactSourceConfigNode={artifactSourceConfigNode}
          isReadonly={isReadonly}
          ref={formikRef}
          isNewStep={isNewStep}
          stepsFactory={stepsFactory}
          onUpdate={noop}
          allowableTypes={allowableTypes}
          onUseTemplate={(selectedTemplate: TemplateSummaryResponse) => addOrUpdateTemplate(selectedTemplate)}
          gitDetails={gitDetails}
          storeMetadata={storeMetadata}
        />
      )}
    </Drawer>
  )
}
