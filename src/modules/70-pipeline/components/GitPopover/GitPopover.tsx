/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { defaultTo } from 'lodash-es'
import { IPopoverProps, PopoverInteractionKind } from '@blueprintjs/core'
import { Icon, Layout, Popover, Text } from '@wings-software/uicore'
import type { IconProps } from '@harness/icons'
import { Color } from '@harness/design-system'
import { getRepoDetailsByIndentifier } from '@common/utils/gitSyncUtils'
import type { EntityGitDetails } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import { getEntityUrl, getRepoEntityObject } from '@gitsync/common/gitSyncUtils'
import type { GitSyncEntityDTO } from 'services/cd-ng'
import GitPopoverInfo, { GitPopoverInfoProps } from './GitPopoverInfo'

export interface GitPopoverProps {
  data: EntityGitDetails
  iconProps?: Omit<IconProps, 'name'>
  popoverProps?: IPopoverProps
  customUI?: JSX.Element
}

const breakWord = 'break-word'

export function RenderGitPopover(props: GitPopoverProps): React.ReactElement | null {
  const { getString } = useStrings()
  const { data, iconProps, popoverProps, customUI } = props
  const { gitSyncRepos, loadingRepos } = useGitSyncStore()

  const repoLabel = useMemo(() => {
    return defaultTo(data?.repoIdentifier, data?.repoName)
  }, [data?.repoIdentifier, data?.repoName])

  const repo = getRepoDetailsByIndentifier(repoLabel, gitSyncRepos)
  const repoEntity: GitSyncEntityDTO = getRepoEntityObject(repo, data)
  const popoverContent: GitPopoverInfoProps[] = [
    {
      heading: getString('repository'),
      content:
        (!loadingRepos && defaultTo(getRepoDetailsByIndentifier(repoLabel, gitSyncRepos)?.name, repoLabel)) || '',
      iconName: 'repository'
    },

    {
      heading: getString('common.git.filePath'),
      content: getEntityUrl(repoEntity),
      iconName: 'repository',
      contentTextProps: {
        style: { wordWrap: breakWord, maxWidth: '200px' },
        lineClamp: 1
      }
    },
    {
      heading: getString('pipelineSteps.deploy.inputSet.branch'),
      content: data?.branch || '',
      iconName: 'git-new-branch'
    }
  ]
  const gitPopover = React.useCallback(() => {
    return (
      <Popover interactionKind={PopoverInteractionKind.HOVER} {...popoverProps} autoFocus={false}>
        <Icon
          name={'service-github'}
          color={Color.GREY_700}
          {...iconProps}
          size={iconProps?.size || 16}
          data-testid={'git-popover'}
        />
        <Layout.Vertical padding={{ top: 'large', bottom: 'large', left: 'xlarge', right: 'xlarge' }}>
          <Text font={{ size: 'small', weight: 'bold' }} color={Color.BLACK}>
            {getString('pipeline.gitDetails').toUpperCase()}
          </Text>
          {customUI ?? (
            <>
              {popoverContent.map((item: GitPopoverInfoProps) => {
                const key = `${item.content}-${item.heading}`
                return <GitPopoverInfo key={key} {...item} />
              })}
            </>
          )}
        </Layout.Vertical>
      </Popover>
    )
  }, [gitSyncRepos, data, loadingRepos, iconProps, popoverProps])

  if (!repoLabel) {
    return null
  }

  return <>{gitPopover()}</>
}

export default function GitPopover(props: GitPopoverProps): React.ReactElement | null {
  return <RenderGitPopover {...props} />
}
