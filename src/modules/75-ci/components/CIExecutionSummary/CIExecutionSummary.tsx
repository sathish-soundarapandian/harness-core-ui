/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Text, Icon, Layout } from '@harness/uicore'
import { useStrings, UseStringsReturn } from 'framework/strings'
import type { ExecutionSummaryProps } from '@pipeline/factories/ExecutionFactory/types'
import { getUIType, UIType } from '../common/getUIType'
import { CommitId } from '../CommitsInfo/CommitsInfo'
import { CICodebaseHeader } from '../CICodebaseHeader/CICodebaseHeader'
import css from './CIExecutionSummary.module.scss'

function getUIByType(
  uiType: UIType,
  { data, getString }: { data: ExecutionSummaryProps['data']; getString: UseStringsReturn['getString'] }
): React.ReactElement {
  let ui

  switch (uiType) {
    case UIType.Branch:
      ui = (
        <>
          <CICodebaseHeader repo={data.repoName} branch={data.branch} isDetailedView={true} />
          {data?.ciExecutionInfoDTO?.branch?.commits?.length > 0 && (
            <Layout.Horizontal flex spacing="small" margin={{ left: 'small' }}>
              <Icon name="git-branch-existing" size={14} />
              <div style={{ fontSize: 0 }}>
                <Text
                  font={{ size: 'small' }}
                  style={{ maxWidth: 150, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
                  title={data?.ciExecutionInfoDTO?.branch?.commits[0]?.message}
                >
                  {data?.ciExecutionInfoDTO?.branch?.commits[0]?.message}
                </Text>
              </div>
              {data?.ciExecutionInfoDTO?.branch?.commits[0]?.id && (
                <CommitId
                  commitId={data?.ciExecutionInfoDTO?.branch?.commits[0]?.id}
                  commitLink={data?.ciExecutionInfoDTO?.branch?.commits[0]?.link}
                />
              )}
            </Layout.Horizontal>
          )}
        </>
      )
      break
    case UIType.Tag:
      ui = (
        <>
          <CICodebaseHeader repo={data.repoName} tag={data.tag} isDetailedView={true} />
          {data?.ciExecutionInfoDTO?.branch?.commits?.length > 0 && (
            <Layout.Horizontal flex spacing="small">
              <Icon name="git-branch-existing" size={14} />
              <div style={{ fontSize: 0 }}>
                <Text
                  font={{ size: 'small' }}
                  style={{ maxWidth: 150, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
                  title={data?.ciExecutionInfoDTO?.branch?.commits[0]?.message}
                >
                  {data?.ciExecutionInfoDTO?.branch?.commits[0]?.message}
                </Text>
              </div>
              {data?.ciExecutionInfoDTO?.branch?.commits[0]?.id && (
                <CommitId
                  commitId={data?.ciExecutionInfoDTO?.branch?.commits[0]?.id}
                  commitLink={data?.ciExecutionInfoDTO?.branch?.commits[0]?.link}
                />
              )}
            </Layout.Horizontal>
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
            isDetailedView={true}
          />
          {data?.ciExecutionInfoDTO?.pullRequest && (
            <>
              {data?.ciExecutionInfoDTO?.pullRequest?.commits?.length > 0 && (
                <Layout.Horizontal flex spacing="small" margin={{ left: 'small' }}>
                  <Icon name="git-branch-existing" size={14} />
                  <div style={{ fontSize: 0 }}>
                    <Text
                      font={{ size: 'small' }}
                      style={{ maxWidth: 150, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
                      title={data?.ciExecutionInfoDTO?.pullRequest?.commits[0]?.message}
                    >
                      {data?.ciExecutionInfoDTO?.pullRequest?.commits[0]?.message}
                    </Text>
                  </div>
                  {data?.ciExecutionInfoDTO?.pullRequest?.commits[0]?.id && (
                    <CommitId
                      commitId={data?.ciExecutionInfoDTO?.pullRequest?.commits[0]?.id}
                      commitLink={data?.ciExecutionInfoDTO?.pullRequest?.commits[0]?.link}
                    />
                  )}
                </Layout.Horizontal>
              )}
              <Layout.Horizontal flex spacing="small" margin={{ left: 'small' }}>
                <Icon name="git-pull" size={14} />
                <div style={{ fontSize: 0 }}>
                  <Text
                    font={{ size: 'small' }}
                    style={{ maxWidth: 150, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
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
            </>
          )}
        </>
      )
      break
  }

  return ui
}

export const CIExecutionSummary = ({ data }: ExecutionSummaryProps): React.ReactElement => {
  const { getString } = useStrings()

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

  return (
    <div className={cx(css.main, { [css.pullRequest]: uiType === UIType.PullRequest })}>
      <Icon className={css.icon} size={18} name="ci-main" />
      {ui}
    </div>
  )
}
