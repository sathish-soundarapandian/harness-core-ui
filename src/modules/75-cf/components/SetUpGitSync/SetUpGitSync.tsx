/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import GitSyncSetupButton from '@cf/components/GitSyncSetupButton/GitSyncSetupButton'
import GitSyncSetupModal from '@cf/components/GitSyncSetupModal/GitSyncSetupModal'
import routes from '@common/RouteDefinitions'
import { FeatureFlag } from '@common/featureFlags'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'

export const SetUpGitSync: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const hideModal = useCallback(() => setIsOpen(false), [])
  const openModal = useCallback(() => setIsOpen(true), [])

  const { accountId, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const history = useHistory()

  const GIT_EX_ENABLED = useFeatureFlag(FeatureFlag.FF_FLAG_SYNC_THROUGH_GITEX_ENABLED)

  return (
    <>
      {GIT_EX_ENABLED && isOpen && <GitSyncSetupModal hideModal={hideModal} />}
      <GitSyncSetupButton
        onClick={() => {
          if (GIT_EX_ENABLED) {
            openModal()
          } else {
            history.push(routes.toGitSyncAdmin({ accountId, orgIdentifier, projectIdentifier, module: 'cf' }))
          }
        }}
      />
    </>
  )
}

export default SetUpGitSync
