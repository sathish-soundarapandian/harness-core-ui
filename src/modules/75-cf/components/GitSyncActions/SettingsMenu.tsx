/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { useParams } from 'react-router-dom'
import { Text, Layout, Container, Switch, useToaster, ButtonVariation } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Divider, Intent } from '@blueprintjs/core'
import { useDeleteGitRepo } from 'services/cf'
import { useStrings } from 'framework/strings'
import { useFFGitSyncContext } from '@cf/contexts/ff-git-sync-context/FFGitSyncContext'
import { useConfirmAction } from '@common/hooks'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import css from './GitSyncActions.module.scss'

const SettingsMenu = (): ReactElement => {
  const { isGitSyncPaused, handleGitPause, gitSyncLoading, isAutoCommitEnabled, handleAutoCommit, refetchGitRepo } =
    useFFGitSyncContext()
  const { projectIdentifier, orgIdentifier, accountId: accountIdentifier } = useParams<Record<string, string>>()
  const { getString } = useStrings()
  const { clear, showError, showSuccess } = useToaster()

  const { mutate: deleteGitRepo } = useDeleteGitRepo({
    queryParams: { accountIdentifier, orgIdentifier },
    identifier: projectIdentifier
  })

  const resetGitSettings = async (): Promise<void> => {
    clear()
    try {
      await deleteGitRepo()
      refetchGitRepo()
      showSuccess(getString('cf.gitSync.resetGitSuccess'))
    } catch {
      showError(getString('cf.gitSync.resetGitError'))
    }
  }

  const confirmResetGit = useConfirmAction({
    title: getString('cf.gitSync.resetGitSettings'),
    confirmText: getString('reset'),
    message: (
      <Text font={{ variation: FontVariation.BODY }} className={css.confirmationModalText}>
        {getString('cf.gitSync.resetGitWarning')}
      </Text>
    ),
    intent: Intent.DANGER,
    action: resetGitSettings
  })

  return (
    <Layout.Vertical padding="medium" spacing="small" flex={{ alignItems: 'flex-start' }}>
      <Container flex={{ alignItems: 'start' }}>
        <Switch
          data-testid="toggle-git-sync-pause-switch"
          alignIndicator="left"
          checked={!isGitSyncPaused}
          onChange={async event => {
            handleGitPause(event.currentTarget.checked)
          }}
          disabled={gitSyncLoading}
        />
        <Text color={Color.BLACK}>{getString('cf.gitSync.toggleGitSyncPause')}</Text>
      </Container>
      <Container flex={{ alignItems: 'start' }}>
        <Switch
          data-testid="auto-commit-switch"
          alignIndicator="left"
          checked={isAutoCommitEnabled}
          onChange={event => {
            handleAutoCommit(event.currentTarget.checked)
          }}
          disabled={gitSyncLoading || isGitSyncPaused}
        />
        <Text color={Color.BLACK}>{getString('cf.gitSync.autoCommitStatusLabel')}</Text>
      </Container>
      <Container width="100%">
        <Divider />
      </Container>
      <Container>
        <RbacButton
          variation={ButtonVariation.SECONDARY}
          onClick={confirmResetGit}
          text={getString('cf.gitSync.resetGitSettings')}
          intent={Intent.DANGER}
          permission={{
            permission: PermissionIdentifier.UPDATE_PROJECT,
            resource: { resourceType: ResourceType.PROJECT, resourceIdentifier: projectIdentifier }
          }}
        />
      </Container>
    </Layout.Vertical>
  )
}

export default SettingsMenu
