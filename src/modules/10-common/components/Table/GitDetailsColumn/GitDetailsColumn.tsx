/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { CellProps, Renderer } from 'react-table'
import { defaultTo } from 'lodash-es'
import { Icon, Layout, Text } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { getRepoDetailsByIndentifier } from '@common/utils/gitSyncUtils'
import { GitSyncStoreProvider, useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import type { EntityGitDetails } from 'services/pipeline-ng'
import css from './GitDetailsColumn.module.scss'

const RenderGitDetails: React.FC<EntityGitDetails> = ({ repoIdentifier, branch }) => {
  const { gitSyncRepos, loadingRepos } = useGitSyncStore()

  return !!repoIdentifier && !!branch ? (
    <Layout.Horizontal style={{ alignItems: 'center' }} padding={{ right: 'medium' }} className={css.gitDetails}>
      <Text
        style={{ fontSize: '13px', wordWrap: 'break-word', maxWidth: '100px' }}
        color={Color.GREY_800}
        margin={{ right: 'small' }}
        lineClamp={1}
        title={repoIdentifier}
      >
        {(!loadingRepos && getRepoDetailsByIndentifier(repoIdentifier, gitSyncRepos)?.name) || ''}
      </Text>
      <Layout.Horizontal
        border={{ color: Color.GREY_200 }}
        spacing="xsmall"
        style={{ borderRadius: '5px', alignItems: 'center' }}
        padding={{ left: 'small', right: 'small', top: 'xsmall', bottom: 'xsmall' }}
        background={Color.GREY_100}
      >
        <Icon name="git-new-branch" size={11} color={Color.GREY_600} />
        <Text
          style={{ wordWrap: 'break-word', maxWidth: '100px' }}
          font={{ size: 'small' }}
          color={Color.GREY_800}
          title={branch}
          lineClamp={1}
        >
          {branch}
        </Text>
      </Layout.Horizontal>
    </Layout.Horizontal>
  ) : (
    <></>
  )
}

export const GitDetailsColumn: Renderer<CellProps<any>> = ({ row }) => {
  const { gitDetails } = row.original
  return (
    <GitSyncStoreProvider>
      <RenderGitDetails
        repoIdentifier={defaultTo(gitDetails?.repoIdentifier, '')}
        branch={defaultTo(gitDetails?.branch, '')}
      />
    </GitSyncStoreProvider>
  )
}

export default GitDetailsColumn
