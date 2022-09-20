/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import type { FreezeListViewProps } from '@freeze-windows/pages/FreezeWindowsPage/types'
import { FreezeWindowsListView } from './FreezeWindowsListView'

export default function FreezeWindowsView(props: FreezeListViewProps) {
  // props: FreezeListViewProps
  const { isGitSyncEnabled: isGitSyncEnabledForProject, gitSyncEnabledOnlyForFF } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF

  const content = <FreezeWindowsListView {...props} />

  if (isGitSyncEnabled) {
    return <GitSyncStoreProvider>{content}</GitSyncStoreProvider>
  } else {
    return <>{content}</>
  }
}
