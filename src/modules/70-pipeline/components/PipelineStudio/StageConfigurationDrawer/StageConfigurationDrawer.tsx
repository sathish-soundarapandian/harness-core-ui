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
import { usePipelineContext } from '../PipelineContext/PipelineContext'
import css from './StageConfigurationDrawer.module.scss'

const STAGE_DRAWER_WIDTH = 500

export default function StageConfigurationDrawer(): JSX.Element {
  const {
    state: {
      selectionState: { selectedStageId, selectedSectionId }
    },
    setSelection,
    getStageFromPipeline
  } = usePipelineContext()
  const { stage: selectedStage } = getStageFromPipeline(defaultTo(selectedStageId, ''))
  // TODO: Mock TBD for implementaiton for Templates
  // const stageType = selectedStage?.stage?.template ? StageType.Template : selectedStage?.stage?.type
  const stageType = selectedStage?.stage?.type

  const handleClose = (): void => {
    setSelection({ sectionId: null })
  }

  return (
    <Drawer
      onClose={handleClose}
      usePortal={true}
      autoFocus={true}
      canEscapeKeyClose={false}
      canOutsideClickClose={true}
      enforceFocus={false}
      hasBackdrop={true}
      size={STAGE_DRAWER_WIDTH}
      isOpen={!!selectedSectionId}
      position={Position.RIGHT}
      isCloseButtonShown={false}
      // BUG: https://github.com/palantir/blueprint/issues/4519
      // you must pass only a single classname, not even an empty string, hence passing a dummy class
      // "classnames" package cannot be used here because it returns an empty string when no classes are applied
      portalClassName={css.drawerPortal}
      className={css.drawer}
      transitionDuration={100}
      backdropClassName={css.drawerBackdrop}
    >
      <Button minimal className={css.closeBtn} icon="cross" withoutBoxShadow onClick={handleClose} />
      <div data-testid="stage-right-drawer">
        {/* TODO: render stage configuration; this is a part of ther jira (CDS-70256) */}
        {stageType} : {selectedStage?.stage?.name} : {selectedSectionId}
      </div>
    </Drawer>
  )
}
