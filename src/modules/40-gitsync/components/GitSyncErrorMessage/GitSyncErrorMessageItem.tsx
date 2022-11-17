/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import styles from '@gitsync/components/GitSyncErrorMessage/GitSyncErrorMessage.module.scss'

export interface GitSyncErrorMessageProps {
  mode: 'COMMIT' | 'FILE' | 'CONNECTIVITY'
  title: string
  count?: number
  repo?: string
  branch?: string
  commitId?: string
  timestamp?: number
  items: {
    title?: string
    reason: string
    showDetails?: () => void
    fixCommit?: string
  }[]
}

export const GitSyncErrorMessageItem: React.FC<GitSyncErrorMessageProps['items'][number]> = ({
  title,
  reason,
  showDetails,
  fixCommit
}) => {
  const { getString } = useStrings()
  const CustomComponent: React.ReactElement = React.useMemo(() => {
    if (showDetails) {
      return (
        <Text
          font={{ size: 'small', weight: 'semi-bold' }}
          color={Color.PRIMARY_7}
          className={styles.errorItemViewContent}
          onClick={() => showDetails()}
        >
          {getString('common.viewContent')}
        </Text>
      )
    }
    if (fixCommit) {
      return (
        <Layout.Horizontal
          className={styles.errorItemErrorFixed}
          background={Color.GREY_100}
          padding={{ left: 'small', right: 'small', top: 'small', bottom: 'small' }}
        >
          <Layout.Horizontal margin={{ right: 'medium' }}>
            <Icon name="command-artifact-check" color={Color.GREEN_500} size={14} margin={{ right: 'small' }} />
            <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.BLACK}>
              {getString('gitsync.errorFixed')}
            </Text>
          </Layout.Horizontal>
          <Layout.Horizontal>
            <Icon name="git-commit" color={Color.PRIMARY_7} margin={{ right: 'small' }} />
            <Text
              font={{ size: 'small', weight: 'semi-bold' }}
              color={Color.PRIMARY_7}
              data-testid="gitSyncErrorMessageItemFixCommit"
            >
              {fixCommit?.slice(0, 7)}
            </Text>
          </Layout.Horizontal>
        </Layout.Horizontal>
      )
    }
    return <></>
  }, [showDetails, fixCommit, getString])
  return (
    <Layout.Horizontal
      className={styles.section}
      flex={{ justifyContent: 'space-between' }}
      data-testid="gitSyncErrorMessageItem"
    >
      <Layout.Vertical
        className={cx({
          [styles.fixedError]: fixCommit,
          [styles.hasDetails]: showDetails,
          [styles.defaultErrorText]: !(fixCommit || showDetails)
        })}
      >
        {title ? (
          <Text
            font={{ size: 'small', weight: 'semi-bold' }}
            className={styles.errorItemTitle}
            lineClamp={2}
            data-testid="gitSyncErrorMessageItemTitle"
          >
            {title}
          </Text>
        ) : null}
        <Layout.Horizontal>
          <Text font={{ size: 'small' }} color={Color.RED_600} margin={{ right: 'large' }}>
            {getString('failed')}
          </Text>
          <Text
            font={{ size: 'small' }}
            color={Color.GREY_900}
            lineClamp={2}
            data-testid="gitSyncErrorMessageItemReason"
          >
            {reason}
          </Text>
        </Layout.Horizontal>
      </Layout.Vertical>
      {CustomComponent}
    </Layout.Horizontal>
  )
}
