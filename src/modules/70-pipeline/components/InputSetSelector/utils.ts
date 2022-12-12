/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName, SelectOption } from '@harness/uicore'
import type { EntityGitDetails, InputSetSummaryResponse } from 'services/pipeline-ng'
import css from './InputSetSelector.module.scss'

type InputSetLocal = InputSetSummaryResponse & SelectOption
export interface InputSetValue extends InputSetLocal {
  type: InputSetSummaryResponse['inputSetType']
  gitDetails?: EntityGitDetails
}
export interface ChildPipelineStageProps {
  childOrgIdentifier: string
  childProjectIdentifier: string
  usePortal?: boolean
  inputSetReferences?: string[]
}

export const getIconByType = (type: InputSetSummaryResponse['inputSetType']): IconName => {
  return type === 'OVERLAY_INPUT_SET' ? 'step-group' : 'yaml-builder-input-sets'
}

export const onDragStart = (event: React.DragEvent<HTMLLIElement>, row: InputSetValue): void => {
  event.dataTransfer.setData('data', JSON.stringify(row))
  event.currentTarget.classList.add(css.dragging)
}

export const onDragEnd = (event: React.DragEvent<HTMLLIElement>): void => {
  event.currentTarget.classList.remove(css.dragging)
}

export const onDragLeave = (event: React.DragEvent<HTMLLIElement>): void => {
  event.currentTarget.classList.remove(css.dragOver)
}

export const onDragOver = (event: React.DragEvent<HTMLLIElement>): void => {
  if (event.preventDefault) {
    event.preventDefault()
  }
  event.currentTarget.classList.add(css.dragOver)
  event.dataTransfer.dropEffect = 'move'
}
