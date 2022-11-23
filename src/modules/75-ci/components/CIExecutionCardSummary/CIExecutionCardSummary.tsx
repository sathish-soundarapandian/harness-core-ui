/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, Layout, Text } from '@harness/uicore'
import type { ExecutionSummaryProps, ExecutionCardInfoProps } from '@pipeline/factories/ExecutionFactory/types'
import { CommitsInfo } from '@ci/components/CommitsInfo/CommitsInfo'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { getUIType, UIType } from '../common/getUIType'
import { CICodebaseHeader } from '../CICodebaseHeader/CICodebaseHeader'

import css from './CIExecutionCardSummary.module.scss'

function getUIByType(
  uiType: UIType,
  { data, getString }: { data: ExecutionSummaryProps['data']; getString: UseStringsReturn['getString'] }
): React.ReactElement {
  let ui

  const handleLinkClick = (event: any): void => {
    event.stopPropagation()
    window.open(event.target.href, '_blank')
  }

  switch (uiType) {
    case UIType.Branch:
      ui = (
        <>
          <CICodebaseHeader repo={data.repoName} branch={data.branch} />
          {data?.ciExecutionInfoDTO?.branch?.commits?.length > 0 && (
            <CommitsInfo
              commits={data?.ciExecutionInfoDTO?.branch?.commits}
              authorAvatar={data?.ciExecutionInfoDTO?.author?.avatar}
            />
          )}
        </>
      )
      break
    case UIType.Tag:
      ui = (
        <>
          <CICodebaseHeader repo={data.repoName} tag={data.tag} />
          {data?.ciExecutionInfoDTO?.branch?.commits?.length > 0 && (
            <CommitsInfo
              commits={data?.ciExecutionInfoDTO?.branch?.commits}
              authorAvatar={data?.ciExecutionInfoDTO?.author?.avatar}
            />
          )}
        </>
      )
      break
    case UIType.PullRequest:
      ui = (
        <>
          <CICodebaseHeader
            repo={data.repoName}
            branch={data?.ciExecutionInfoDTO?.pullRequest?.sourceBranch}
            targetBranch={data?.ciExecutionInfoDTO?.pullRequest?.targetBranch}
          />
          <Layout.Horizontal className={css.alignSelfStart} flex spacing="small">
            <Icon name="git-pull" size={14} />
            <div style={{ fontSize: 0 }}>
              <Text
                font={{ size: 'small' }}
                color="grey900"
                style={{ maxWidth: 500, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
                title={data?.ciExecutionInfoDTO?.pullRequest?.title}
              >
                {data?.ciExecutionInfoDTO?.pullRequest?.title}
              </Text>
            </div>
            <a
              className={css.label}
              href={data?.ciExecutionInfoDTO?.pullRequest?.link || ''}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
            >
              {getString('ci.prSymbol')}
              {typeof data?.ciExecutionInfoDTO?.pullRequest?.id === 'string' ||
              typeof data?.ciExecutionInfoDTO?.pullRequest?.id === 'number'
                ? data?.ciExecutionInfoDTO?.pullRequest?.id
                : data?.ciExecutionInfoDTO?.pullRequest?.id?.['$numberLong']
                ? data?.ciExecutionInfoDTO?.pullRequest?.id?.['$numberLong']
                : ''}
            </a>
            <div className={css.state}>{data?.ciExecutionInfoDTO?.pullRequest?.state}</div>
          </Layout.Horizontal>
          {data?.ciExecutionInfoDTO?.pullRequest?.commits?.length > 0 && (
            <CommitsInfo
              commits={data?.ciExecutionInfoDTO?.pullRequest?.commits}
              authorAvatar={data?.ciExecutionInfoDTO?.author?.avatar}
            />
          )}
        </>
      )
      break
  }

  return ui
}

export function CIExecutionCardSummary(props: ExecutionCardInfoProps): React.ReactElement {
  const { getString } = useStrings()

  const { data } = props
  if (!data) {
    return <></>
  }

  const uiType = getUIType(data)
  if (!uiType) {
    return <></>
  }

  const ui = getUIByType(uiType, { data, getString })
  if (!ui) {
    return <></>
  }

  return <div className={css.main}>{ui}</div>
}
