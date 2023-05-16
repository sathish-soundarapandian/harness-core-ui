/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { noop } from 'lodash-es'
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { createContext } from 'react'

export enum GitErrorExperienceTab {
  ALL_ERRORS = 'ALL_ERRORS',
  CONNECTIVITY_ERRORS = 'CONNECTIVITY_ERRORS'
}

export enum GitErrorExperienceSubTab {
  ALL_ERRORS_COMMIT_VIEW = 'ALL_ERRORS_COMMIT_VIEW',
  ALL_ERRORS_FILE_VIEW = 'ALL_ERRORS_FILE_VIEW'
}

export interface GitSyncErrorStateType {
  selectedTab: GitErrorExperienceTab
  view: GitErrorExperienceSubTab | null
  setView: Dispatch<SetStateAction<GitErrorExperienceSubTab | null>>
  branch: string
  repoIdentifier: string
  searchTerm: string
  reloadAction: MutableRefObject<(() => void) | null>
}

export const GitSyncErrorState = createContext<GitSyncErrorStateType>({
  selectedTab: GitErrorExperienceTab.ALL_ERRORS,
  view: GitErrorExperienceSubTab.ALL_ERRORS_COMMIT_VIEW,
  setView: noop,
  branch: '',
  repoIdentifier: '',
  searchTerm: '',
  reloadAction: { current: noop }
})
