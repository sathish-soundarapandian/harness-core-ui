/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Dispatch } from 'react'
import { useMemo } from 'react'

import { Action, ActionType, CreateSectionsPayload, UpdateSectionsPayload } from './types'

export interface UseActionCreatorReturn {
  createSections(payload: CreateSectionsPayload): void
  fetchSectionData(payload: string): void
  fetchingSectionData(payload: string): void
  updateSectionData(payload: UpdateSectionsPayload): void
  toggleSection(payload: string): void
  resetSection(payload: string): void
  search(payload: string): void
  resetSearch(): void
  goToNextSearchResult(): void
  goToPrevSearchResult(): void
}

export function useActionCreator(dispatch: Dispatch<Action<ActionType>>): UseActionCreatorReturn {
  return useMemo(
    () => ({
      createSections(payload: CreateSectionsPayload) {
        dispatch({ type: ActionType.CreateSections, payload })
      },
      fetchSectionData(payload: string) {
        dispatch({ type: ActionType.FetchSectionData, payload })
      },
      fetchingSectionData(payload: string) {
        dispatch({ type: ActionType.FetchingSectionData, payload })
      },
      updateSectionData(payload: UpdateSectionsPayload) {
        dispatch({ type: ActionType.UpdateSectionData, payload })
      },
      toggleSection(payload: string) {
        dispatch({ type: ActionType.ToggleSection, payload })
      },
      resetSection(payload: string) {
        dispatch({ type: ActionType.ResetSection, payload })
      },
      search(payload: string) {
        dispatch({ type: ActionType.Search, payload })
      },
      resetSearch() {
        dispatch({ type: ActionType.ResetSearch, payload: '' })
      },
      goToNextSearchResult() {
        dispatch({ type: ActionType.GoToNextSearchResult, payload: '' })
      },
      goToPrevSearchResult() {
        dispatch({ type: ActionType.GoToPrevSearchResult, payload: '' })
      }
    }),
    [dispatch]
  )
}
