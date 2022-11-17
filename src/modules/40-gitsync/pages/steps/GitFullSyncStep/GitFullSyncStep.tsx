/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { StepProps } from '@harness/uicore'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import FullSyncForm from '@gitsync/components/FullSyncForm/FullSyncForm'

export interface GitFullSyncStepProps {
  name: string
  onClose: () => void
  onSuccess: () => void
}

export const GitFullSyncStep: React.FC<StepProps<unknown> & GitFullSyncStepProps> = props => {
  const { onClose, onSuccess } = props

  return (
    <GitSyncStoreProvider>
      <FullSyncForm isNewUser={true} onClose={onClose} onSuccess={onSuccess} />
    </GitSyncStoreProvider>
  )
}
