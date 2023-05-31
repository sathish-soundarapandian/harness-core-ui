/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Drawer, Position } from '@blueprintjs/core'
import { Button } from '@harness/uicore'
import { defaultTo } from 'lodash-es'
import { StageType } from '@pipeline/utils/stageHelpers'
import { usePipelineContext } from '../PipelineContext/PipelineContext'
import css from './StageRightDrawer.module.scss'

const STAGE_DRAWER_WIDTH = 800

export const StageRightDrawer = (): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId, stageDetailsOpen },
      gitDetails,
      storeMetadata
    },
    renderPipelineStage,
    setSelection,
    getStageFromPipeline
  } = usePipelineContext()
  const { stage: selectedStage } = getStageFromPipeline(defaultTo(selectedStageId, ''))
  const stageType = selectedStage?.stage?.template ? StageType.Template : selectedStage?.stage?.type

  const handleClose = () => {
    setSelection({ stageDetailsOpen: null, sectionId: null })
  }

  return (
    <Drawer
      onClose={handleClose}
      usePortal={true}
      autoFocus={true}
      canEscapeKeyClose={false}
      canOutsideClickClose={false}
      enforceFocus={false}
      hasBackdrop={false}
      size={STAGE_DRAWER_WIDTH}
      isOpen={stageDetailsOpen}
      position={Position.RIGHT}
      isCloseButtonShown={false}
      // BUG: https://github.com/palantir/blueprint/issues/4519
      // you must pass only a single classname, not even an empty string, hence passing a dummy class
      // "classnames" package cannot be used here because it returns an empty string when no classes are applied
      portalClassName={css.drawerPortal}
    >
      <Button minimal className={css.closeBtn} icon="cross" withoutBoxShadow onClick={handleClose} />
      <div data-testid="stage-right-drawer">
        {renderPipelineStage({
          stageType: stageType,
          minimal: false,
          gitDetails,
          storeMetadata
        })}
      </div>
    </Drawer>
  )
}
