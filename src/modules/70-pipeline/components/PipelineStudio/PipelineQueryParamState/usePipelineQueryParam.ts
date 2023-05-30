/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useQueryParams, useUpdateQueryParams } from '@common/hooks'

export interface PipelineSelectionState {
  stageId?: string | null
  stageDetailsOpen?: boolean | null
  stepId?: string | null
  sectionId?: string | null
  storeType?: string
}

export interface PipelineSelectionStateQueryParams {
  stageId?: string | null
  stageDetailsOpen?: string | null
  stepId?: string | null
  sectionId?: string | null
  storeType?: string
}

function stateToQueryParams(state: PipelineSelectionState): PipelineSelectionStateQueryParams {
  const { stageDetailsOpen, ...restQueryState } = state

  const queryParams: PipelineSelectionStateQueryParams = { ...restQueryState }
  if (typeof stageDetailsOpen !== 'undefined') queryParams.stageDetailsOpen = !!stageDetailsOpen ? 'true' : undefined

  return queryParams
}

export function usePipelineQueryParamState() {
  const { stageId, stepId, sectionId, stageDetailsOpen } = useQueryParams<PipelineSelectionStateQueryParams>()
  const { updateQueryParams } = useUpdateQueryParams<PipelineSelectionStateQueryParams>()

  /**
   * Set selected stage/step.
   * Use null to clear state.
   * NOTE: Clearing 'stage' state will clear 'step' state too
   */
  const setPipelineQueryParamState = (state: PipelineSelectionState) => {
    const newState = stateToQueryParams(state)

    // clear stepId and sectionId when stageId is changed
    if (state.stageId && state.stageId !== stageId) {
      newState.stepId = undefined
    }

    const mergedState = { stageId, stepId, sectionId, stageDetailsOpen, ...newState }
    // clear sectionId when stage is not selected
    if (!mergedState.stageId && mergedState.sectionId) {
      mergedState.sectionId = undefined
    }
    // clear stageDetailsOpen when stage is not selected
    if (!mergedState.stageId && mergedState.stageDetailsOpen) {
      mergedState.stageDetailsOpen = undefined
    }

    updateQueryParams(mergedState, { skipNulls: true })
  }

  return { stageId, stageDetailsOpen, stepId, sectionId, setPipelineQueryParamState }
}
