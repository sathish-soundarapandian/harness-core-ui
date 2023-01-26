/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonVariation, Layout } from '@harness/uicore'
import { useHistory, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { FeatureFlag } from '@common/featureFlags'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { useStrings } from 'framework/strings'
import ServicesGithubIcon from '@cf/images/icons/ServicesGithubIcon'

export interface GitSyncSetupButtonProps {
  showModal?: () => void
}

const GitSyncSetupButton: React.FC<GitSyncSetupButtonProps> = ({ showModal }) => {
  const { getString } = useStrings()

  const { accountId, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const history = useHistory()

  const GIT_EX_ENABLED = useFeatureFlag(FeatureFlag.FFM_5332_GIT_EX_ENABLED)

  return (
    <Button
      data-testid="gitSyncSetupRedirect"
      variation={ButtonVariation.TERTIARY}
      text={
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }} spacing="small">
          <ServicesGithubIcon />
          <span>{getString('cf.featureFlags.setupGitSync')}</span>
        </Layout.Horizontal>
      }
      onClick={() => {
        if (GIT_EX_ENABLED && showModal) {
          showModal()
        } else {
          history.push(routes.toGitSyncAdmin({ accountId, orgIdentifier, projectIdentifier, module: 'cf' }))
        }
      }}
    />
  )
}

export default GitSyncSetupButton
