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
import { useStrings } from 'framework/strings'
import ServicesGithubIcon from '@cf/images/icons/ServicesGithubIcon'

export const GitSyncSetupRedirect: React.FC = () => {
  const { getString } = useStrings()

  const { accountId, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const history = useHistory()

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
        history.push(routes.toGitSyncAdmin({ accountId, orgIdentifier, projectIdentifier, module: 'cf' }))
      }}
    />
  )
}

export default GitSyncSetupRedirect
