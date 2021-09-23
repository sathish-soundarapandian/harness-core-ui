import React, { useState } from 'react'
import cx from 'classnames'
import { Text, Icon, Container, Utils, Layout } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { ExecutionSummaryProps } from '@pipeline/factories/ExecutionFactory/types'
import css from './CIExecutionSummary.module.scss'

enum Type {
  Branch = 'branch',
  Tag = 'tag',
  PullRequest = 'pull-request'
}

export function CIExecutionSummary({ data }: ExecutionSummaryProps): React.ReactElement {
  const { getString } = useStrings()

  const [isCommitIdCopied, setIsCommitIdCopied] = useState(false)

  const handleCommitIdClick = (commitId: string): void => {
    Utils.copy(commitId)
    setIsCommitIdCopied(true)
  }

  const handleCommitIdTooltipClosed = (): void => {
    setIsCommitIdCopied(false)
  }

  let type: Type

  switch (data?.buildType as 'branch' | 'tag' | 'PR') {
    case 'branch':
      type = Type.Branch
      break
    case 'tag':
      type = Type.Tag
      break
    case 'PR':
      type = Type.PullRequest
      break
  }

  if (!type) {
    return <></>
  }

  let ui = null
  switch (type) {
    case Type.Branch:
      ui = (
        <>
          <div className={cx(css.label, css.multiple)}>
            <Container flex>
              <Icon name="repository" size={14} color="primary7" />
              <div className={css.truncated}>{data.repoName}</div>
            </Container>
            <Container flex>
              <Icon name="git-new-branch" size={12} color="primary7" />
              <div className={css.truncated}>{data.branch}</div>
            </Container>
          </div>
          <Layout.Horizontal flex spacing="small" style={{ marginLeft: 'var(--spacing-3)' }}>
            <Icon name="git-branch-existing" size={14} />
            <div style={{ fontSize: 0 }}>
              <Text
                font={{ size: 'small' }}
                style={{ maxWidth: 150, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
                tooltip={
                  <Container padding="small" style={{ whiteSpace: 'pre-line' }}>
                    {data?.ciExecutionInfoDTO?.branch.commits[0].message}
                  </Container>
                }
              >
                {data?.ciExecutionInfoDTO?.branch.commits[0].message}
              </Text>
            </div>
            <Text className={css.commit} style={{ cursor: 'pointer' }}>
              <a
                className={css.label}
                href={data?.ciExecutionInfoDTO?.branch.commits[0].link}
                rel="noreferrer"
                target="_blank"
              >
                {data?.ciExecutionInfoDTO?.branch.commits[0].id.slice(0, 7)}
              </a>
              <Text
                tooltip={
                  <Container padding="small">
                    {getString(isCommitIdCopied ? 'copiedToClipboard' : 'clickToCopy')}
                  </Container>
                }
                tooltipProps={{
                  onClosed: handleCommitIdTooltipClosed
                }}
                style={{ cursor: 'pointer' }}
              >
                <Icon
                  name="copy"
                  size={14}
                  onClick={() => handleCommitIdClick(data?.ciExecutionInfoDTO?.branch.commits[0].link)}
                />
              </Text>
            </Text>
          </Layout.Horizontal>
        </>
      )
      break
    case Type.Tag:
      ui = (
        <Layout.Horizontal flex spacing="small">
          <div className={css.label}>
            <Icon name="repository" size={14} color="primary7" />
            <div className={css.truncated}>{data.repoName}</div>
          </div>
          <div className={css.label}>
            <Icon name="tag" size={14} color="primary7" />
            <div className={css.truncated}>{data.tag}</div>
          </div>
          {/* <Text tooltip={<Container padding="small"> Notes</Container>}>
            <Icon name="more" size={14} />
          </Text> */}
          <Layout.Horizontal flex spacing="small">
            <Icon name="git-branch-existing" size={14} />
            <div style={{ fontSize: 0 }}>
              <Text
                font={{ size: 'small' }}
                style={{ maxWidth: 150, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
                tooltip={
                  <Container padding="small" style={{ whiteSpace: 'pre-line' }}>
                    {data?.ciExecutionInfoDTO?.branch.commits[0].message}
                  </Container>
                }
              >
                {data?.ciExecutionInfoDTO?.branch.commits[0].message}
              </Text>
            </div>
            <Text className={css.commit} style={{ cursor: 'pointer' }}>
              <a
                className={css.label}
                href={data?.ciExecutionInfoDTO?.branch.commits[0].link}
                rel="noreferrer"
                target="_blank"
              >
                {data?.ciExecutionInfoDTO?.branch.commits[0].id.slice(0, 7)}
              </a>
              <Text
                tooltip={
                  <Container padding="small">
                    {getString(isCommitIdCopied ? 'copiedToClipboard' : 'clickToCopy')}
                  </Container>
                }
                tooltipProps={{
                  onClosed: handleCommitIdTooltipClosed
                }}
                style={{ cursor: 'pointer' }}
              >
                <Icon
                  name="copy"
                  size={14}
                  onClick={() => handleCommitIdClick(data?.ciExecutionInfoDTO?.branch.commits[0].link)}
                />
              </Text>
            </Text>
          </Layout.Horizontal>
        </Layout.Horizontal>
      )
      break
    case Type.PullRequest:
      ui = (
        <>
          <div className={cx(css.label, css.multiple)}>
            <Container flex>
              <Icon name="repository" size={14} color="primary7" />
              <div className={css.truncated}>{data.repoName}</div>
            </Container>
            <Container flex>
              <Icon name="git-new-branch" size={12} color="primary7" />
              <div className={css.truncated}>{data?.ciExecutionInfoDTO?.pullRequest.sourceBranch}</div>
            </Container>
          </div>
          <Icon name="arrow-right" size={14} />
          <Container className={css.label}>
            <Icon name="git-new-branch" size={12} color="primary7" />
            <div className={css.truncated}>{data?.ciExecutionInfoDTO?.pullRequest.targetBranch}</div>
          </Container>
          <Layout.Horizontal flex spacing="small" style={{ marginLeft: 'var(--spacing-3)' }}>
            <Icon name="git-branch-existing" size={14} />
            <div style={{ fontSize: 0 }}>
              <Text
                font={{ size: 'small' }}
                style={{ maxWidth: 150, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
                tooltip={
                  <Container padding="small" style={{ whiteSpace: 'pre-line' }}>
                    {data?.ciExecutionInfoDTO?.pullRequest.commits[0].message}
                  </Container>
                }
              >
                {data?.ciExecutionInfoDTO?.pullRequest.commits[0].message}
              </Text>
            </div>
            <Text className={css.commit} style={{ cursor: 'pointer' }}>
              <a
                className={css.label}
                href={data?.ciExecutionInfoDTO?.pullRequest.commits[0].link}
                rel="noreferrer"
                target="_blank"
              >
                {data?.ciExecutionInfoDTO?.pullRequest.commits[0].id.slice(0, 7)}
              </a>
              <Text
                tooltip={
                  <Container padding="small">
                    {getString(isCommitIdCopied ? 'copiedToClipboard' : 'clickToCopy')}
                  </Container>
                }
                tooltipProps={{
                  onClosed: handleCommitIdTooltipClosed
                }}
                style={{ cursor: 'pointer' }}
              >
                <Icon
                  name="copy"
                  size={14}
                  onClick={() => handleCommitIdClick(data?.ciExecutionInfoDTO?.pullRequest.commits[0].link)}
                />
              </Text>
            </Text>
          </Layout.Horizontal>
          <Layout.Horizontal flex spacing="small" style={{ marginLeft: 'var(--spacing-3)' }}>
            <Icon name="git-pull" size={14} />
            <div style={{ fontSize: 0 }}>
              <Text
                font={{ size: 'small' }}
                style={{ maxWidth: 150, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
                tooltip={<Container padding="small">{data?.ciExecutionInfoDTO?.pullRequest.title}</Container>}
              >
                {data?.ciExecutionInfoDTO?.pullRequest.title}
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
            <div className={css.state}>{data?.ciExecutionInfoDTO?.pullRequest.state}</div>
          </Layout.Horizontal>
        </>
      )
      break
  }

  if (!ui) {
    return <></>
  }

  return (
    <div className={cx(css.main, { [css.pullRequest]: type === Type.PullRequest })}>
      <Icon className={css.icon} size={18} name="ci-main" />
      {ui}
    </div>
  )
}
