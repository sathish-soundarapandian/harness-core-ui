/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { toggleSection } from './toggleSection'
import { updateSectionData } from './updateSectionData'
import { createSections } from './createSections'
import { fetchSectionData } from './fetchSectionData'
import { fetchingSectionData } from './fetchingSectionData'
import { resetSectionData } from './resetSectionData'
import { search } from './search'
import { resetSearch } from './resetSearch'
import { goToNextSearchResult } from './goToNextSearchResult'
import { goToPrevSearchResult } from './goToPrevSearchResult'
import { ActionType, Action, State } from './types'
import { updateManuallyToggled } from './updateManuallyToggled'

export function reducer<T extends ActionType>(state: State, action: Action<T>): State {
  switch (action.type) {
    // Action for creating the sections
    case ActionType.CreateSections:
      return createSections(state, action as Action<ActionType.CreateSections>)
    // Action to fetch the section data
    case ActionType.FetchSectionData:
      return fetchSectionData(state, action as Action<ActionType.FetchSectionData>)
    // Action for fetching the section data
    case ActionType.FetchingSectionData:
      return fetchingSectionData(state, action as Action<ActionType.FetchingSectionData>)
    // Action for updating the section data
    case ActionType.UpdateSectionData:
      return updateSectionData(state, action as Action<ActionType.UpdateSectionData>)
    // Action for toggling a section
    case ActionType.ResetSection:
      return resetSectionData(state, action as Action<ActionType.ResetSection>)
    // Action for toggling a section
    case ActionType.ToggleSection:
      return toggleSection(state, action as Action<ActionType.ToggleSection>)
    // Action for toggling the manually toggled section state
    case ActionType.UpdateManuallyToggled:
      return updateManuallyToggled(state, action as Action<ActionType.UpdateManuallyToggled>)
    case ActionType.Search:
      return search(state, action as Action<ActionType.Search>)
    case ActionType.ResetSearch:
      return resetSearch(state, action as Action<ActionType.ResetSearch>)
    case ActionType.GoToNextSearchResult:
      return goToNextSearchResult(state, action as Action<ActionType.GoToNextSearchResult>)
    case ActionType.GoToPrevSearchResult:
      return goToPrevSearchResult(state, action as Action<ActionType.GoToPrevSearchResult>)
    default:
      return state
  }
}
