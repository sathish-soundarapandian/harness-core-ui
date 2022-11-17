/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import moment from 'moment'
import { get } from 'lodash-es'
import { Card, Layout, Text, Icon, Accordion, Container } from '@harness/uicore'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import type { CIBuildCommit, CIPipelineModuleInfo } from 'services/ci'
import { UserLabel, TimeAgoPopover } from '@common/exports'
import { useStrings } from 'framework/strings'
import { CommitId } from '@ci/components/CommitsInfo/CommitsInfo'
import commitsEmptyState from './images/commits_empty_state.svg'
import css from './BuildCommits.module.scss'

interface CommitsGroupedByTimestamp {
  timeStamp: number
  commits: CIBuildCommit[]
}

const Commits: React.FC<{ commits: CIBuildCommit[]; showAvatar?: boolean }> = ({ commits, showAvatar }): any => {
  const context = useExecutionContext()

  // NOTE: Not commit author!!!
  const author = get(
    context,
    'pipelineExecutionDetail.pipelineExecutionSummary.moduleInfo.ci.ciExecutionInfoDTO.author'
  )

  return commits.map(({ id = '', message = '', timeStamp = 0, ownerName, link, ownerEmail }) => {
    const [title, description] = message.split('\n\n')
    // we should use only first part of a name
    // in order to show a single letter
    return (
      <Card className={css.commit} key={id}>
        <div>
          <Text className={css.commitTitle} font="small">
            {title}
          </Text>
          {description && (
            <Text className={css.commitDescription} font="small" margin={{ top: 'xsmall' }}>
              {description}
            </Text>
          )}
        </div>
        <Layout.Horizontal
          className={css.rightSideCommitDetails}
          style={{ marginLeft: 'var(--spacing-3)' }}
          flex={{ alignItems: 'center' }}
          spacing="medium"
        >
          {ownerName && (
            <UserLabel
              className={css.user}
              name={ownerName}
              email={ownerEmail}
              profilePictureUrl={showAvatar ? author?.avatar : undefined}
              iconProps={{ size: 16 }}
            />
          )}
          <TimeAgoPopover className={css.timeStamp} time={timeStamp} inline={false} />
          {id && <CommitId commitId={id} commitLink={link} />}
        </Layout.Horizontal>
      </Card>
    )
  })
}

const CommitsGroupedByTimestamp: React.FC<{
  commitsGroupedByTimestamp: CommitsGroupedByTimestamp[]
  showCommitAuthorAvatar?: boolean
}> = ({ commitsGroupedByTimestamp, showCommitAuthorAvatar }): any => {
  const { getString } = useStrings()

  return commitsGroupedByTimestamp.map(({ timeStamp, commits }) => (
    <div className={css.stack} key={String(timeStamp)}>
      <div className={css.stackHeader}>
        <Icon className={css.stackHeaderIcon} name="git-commit" size={20} margin={{ right: 'medium' }} />
        <Text className={css.stackHeaderText} font="small">
          {getString('ci.commitsOn')} {moment(timeStamp).format('MMM D, YYYY')}
        </Text>
      </div>
      <Commits commits={commits} showAvatar={showCommitAuthorAvatar} />
    </div>
  ))
}

const BuildCommits: React.FC = () => {
  const context = useExecutionContext()
  const { getString } = useStrings()

  const ciData = get(context, 'pipelineExecutionDetail.pipelineExecutionSummary.moduleInfo.ci') as CIPipelineModuleInfo

  const codebaseCommits = ciData?.ciExecutionInfoDTO?.branch?.commits?.length
    ? ciData.ciExecutionInfoDTO.branch.commits
    : ciData?.ciExecutionInfoDTO?.pullRequest?.commits
  const triggerCommits = ciData?.ciExecutionInfoDTO?.branch?.triggerCommits?.length
    ? ciData.ciExecutionInfoDTO.branch.triggerCommits
    : ciData?.ciExecutionInfoDTO?.pullRequest?.triggerCommits

  const codebaseCommitsGroupedByTimestamp: CommitsGroupedByTimestamp[] = []
  codebaseCommits?.forEach((commit: CIBuildCommit) => {
    const index = codebaseCommitsGroupedByTimestamp.findIndex(({ timeStamp: timestamp2 }) =>
      moment(commit.timeStamp).isSame(timestamp2, 'day')
    )

    if (index > -1) {
      codebaseCommitsGroupedByTimestamp[index].commits.push(commit)
    } else {
      codebaseCommitsGroupedByTimestamp.push({ timeStamp: commit.timeStamp || 0, commits: [commit] })
    }
  })

  const triggerCommitsGroupedByTimestamp: CommitsGroupedByTimestamp[] = []
  triggerCommits?.forEach((commit: CIBuildCommit) => {
    const index = triggerCommitsGroupedByTimestamp.findIndex(({ timeStamp: timestamp2 }) =>
      moment(commit.timeStamp).isSame(timestamp2, 'day')
    )

    if (index > -1) {
      triggerCommitsGroupedByTimestamp[index].commits.push(commit)
    } else {
      triggerCommitsGroupedByTimestamp.push({ timeStamp: commit.timeStamp || 0, commits: [commit] })
    }
  })
  const hasTriggerCommits = triggerCommits && triggerCommits.length > 0
  if (!hasTriggerCommits && codebaseCommitsGroupedByTimestamp.length === 0) {
    return (
      <Container className={css.emptyCommits}>
        <img src={commitsEmptyState} />
        <Text font={{ size: 'medium' }} padding={{ top: 'xlarge' }}>
          {getString('ci.commitsTab.youHaveNoCommits')}
        </Text>
        <Text padding={{ top: 'xsmall' }}>{getString('ci.commitsTab.youWillSeeYourCommitsHere')}</Text>
      </Container>
    )
  }

  return (
    <div className={css.wrapper}>
      {hasTriggerCommits ? (
        <>
          <Accordion activeId="codebase-commits">
            <Accordion.Panel
              id="codebase-commits"
              summary={`${ciData?.repoName} (Codebase)`}
              details={<CommitsGroupedByTimestamp commitsGroupedByTimestamp={codebaseCommitsGroupedByTimestamp} />}
            />
          </Accordion>

          <Accordion activeId="trigger-commits">
            <Accordion.Panel
              id="trigger-commits"
              summary={`${ciData?.triggerRepoName} (Trigger)`}
              details={
                <CommitsGroupedByTimestamp
                  commitsGroupedByTimestamp={triggerCommitsGroupedByTimestamp}
                  showCommitAuthorAvatar
                />
              }
            />
          </Accordion>
        </>
      ) : (
        <CommitsGroupedByTimestamp
          commitsGroupedByTimestamp={codebaseCommitsGroupedByTimestamp}
          showCommitAuthorAvatar
        />
      )}
    </div>
  )
}

export default BuildCommits
