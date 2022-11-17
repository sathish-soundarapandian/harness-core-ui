/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import ReactTimeago from 'react-timeago'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import cx from 'classnames'
import { Card, Icon, IconName, Layout, Text, useToaster } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { GitSyncErrorDTO, listGitToHarnessErrorsForCommitPromise } from 'services/cd-ng'
import {
  GitSyncErrorMessageItem,
  GitSyncErrorMessageProps
} from '@gitsync/components/GitSyncErrorMessage/GitSyncErrorMessageItem'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import styles from '@gitsync/components/GitSyncErrorMessage/GitSyncErrorMessage.module.scss'

const MESSAGE_LIMIT = 5

const renderComponentConditionally = (Component: React.ReactElement, condition: boolean): React.ReactElement => {
  if (condition) {
    return Component
  }
  return <></>
}

const CountComponent: React.FC<{ count?: number }> = ({ count }) => {
  return (
    <Layout.Horizontal margin={{ right: 'medium' }}>
      <Icon name="warning-sign" color={Color.RED_600} padding={{ right: 'small' }} />
      <Text font={{ weight: 'bold' }} color={Color.RED_600} data-testid="gitSyncErrorCount">
        {count}
      </Text>
    </Layout.Horizontal>
  )
}

const IconValue: React.FC<{ icon: IconName; value?: string; background?: Color; color?: Color; type: string }> = ({
  icon,
  value,
  background,
  color,
  type
}) => {
  return (
    <Layout.Horizontal
      background={background || Color.GREY_100}
      padding={{ left: 'small', right: 'small', top: 'small', bottom: 'small' }}
      margin={{ right: 'medium' }}
    >
      <Icon name={icon} color={color || Color.GREY_600} size={14} padding={{ right: 'small' }}></Icon>
      <Text
        font={{ weight: 'semi-bold', size: 'small' }}
        color={color || Color.GREY_900}
        data-testid={`gitSyncErrorIconValue${type}`}
      >
        {value}
      </Text>
    </Layout.Horizontal>
  )
}

const TimestampComponent: React.FC<{ timestamp?: number }> = ({ timestamp }) => {
  return (
    <Layout.Horizontal
      className={styles.timestamp}
      padding={{ left: 'medium' }}
      data-testid="gitSyncErrorTimestamp"
      data-value={timestamp}
    >
      <ReactTimeago date={timestamp || 0} />
    </Layout.Horizontal>
  )
}

export const parseCommitItems = (items: GitSyncErrorDTO[]): GitSyncErrorMessageProps['items'] => {
  return items.map(error => ({
    title: error.completeFilePath,
    reason: error.failureReason || '',
    ...(error.status === 'RESOLVED' ? { fixCommit: error.additionalErrorDetails?.['resolvedByCommitId'] } : {})
  }))
}

export const GitSyncErrorMessage: React.FC<GitSyncErrorMessageProps> = props => {
  const { mode, title, count, repo, branch, commitId = '', timestamp, items } = props
  const { showError } = useToaster()

  const [messageItems, setMessageItems] = useState(items)

  useEffect(() => {
    setMessageItems(items)
  }, [items])

  const SeeMore: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false)
    const { getString } = useStrings()
    const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

    const expandMode = messageItems.length <= MESSAGE_LIMIT

    const onClick = (): void => {
      if (expandMode) {
        setIsLoading(true)
        listGitToHarnessErrorsForCommitPromise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            branch,
            repoIdentifier: repo
          },
          commitId
        })
          .then(commitData => {
            setIsLoading(false)
            if (commitData.status === 'ERROR') {
              throw new Error()
            }
            if (defaultTo(commitData.data?.content, []).length > 0) {
              setMessageItems(parseCommitItems(defaultTo(commitData.data?.content, [])))
            }
          })
          .catch(() => {
            setIsLoading(false)
            showError(getString('gitsync.failedToLoadData'))
          })
      } else {
        setMessageItems(messageItems.splice(0, MESSAGE_LIMIT))
      }
    }
    return (
      <Layout.Horizontal margin={{ top: 'small' }}>
        {!isLoading ? (
          <Text color={Color.PRIMARY_7} onClick={onClick} className={styles.seeMore} data-testid="seeMore">
            {expandMode ? getString('gitsync.seeMore') : getString('gitsync.seeLess')}
          </Text>
        ) : (
          <Icon name="spinner" />
        )}
      </Layout.Horizontal>
    )
  }

  return (
    <Card className={styles.gitSyncErrorMessage} data-testid="gitSyncErrorMessage">
      <Layout.Vertical>
        <Layout.Horizontal className={styles.section} flex={{ justifyContent: 'space-between' }}>
          <Text
            font={{ weight: 'bold' }}
            color={Color.GREY_900}
            className={cx(styles.title, { [styles.titleDirection]: mode === 'FILE' })}
            data-testid="gitSyncErrorTitle"
          >
            {title}
          </Text>
          <Layout.Horizontal flex={{ alignItems: 'center' }}>
            {renderComponentConditionally(<CountComponent count={count} />, !!count)}
            {renderComponentConditionally(<IconValue type="Repo" icon={'repository'} value={repo} />, !!repo)}
            {renderComponentConditionally(<IconValue type="Branch" icon={'git-new-branch'} value={branch} />, !!branch)}
            {renderComponentConditionally(
              <IconValue
                icon={'git-commit'}
                type="CommitId"
                value={commitId?.slice(0, 7)}
                background={Color.PRIMARY_1}
                color={Color.PRIMARY_7}
              />,
              !!commitId
            )}
            {renderComponentConditionally(<TimestampComponent timestamp={timestamp} />, !!timestamp)}
          </Layout.Horizontal>
        </Layout.Horizontal>
        {(messageItems || []).map((item, key) => (
          <GitSyncErrorMessageItem key={key} {...item} />
        ))}
        {renderComponentConditionally(<SeeMore />, mode === 'COMMIT' && defaultTo(count, 0) > MESSAGE_LIMIT)}
      </Layout.Vertical>
    </Card>
  )
}
