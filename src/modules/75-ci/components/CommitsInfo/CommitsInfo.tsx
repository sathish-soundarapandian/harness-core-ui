/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { first } from 'lodash-es'
import { Text, Button, Icon, Utils, Container, Layout } from '@harness/uicore'
import { Collapse } from '@blueprintjs/core'
import { FontVariation, Color } from '@harness/design-system'
import type { CIBuildCommit } from 'services/ci'
import { String, useStrings } from 'framework/strings'
import { UserLabel, TimeAgoPopover } from '@common/exports'

import css from './CommitsInfo.module.scss'

export interface CommitIdProps {
  commitId: string
  commitLink?: string
}

export function CommitId({ commitId, commitLink }: CommitIdProps): React.ReactElement {
  const [isCommitIdCopied, setIsCommitIdCopied] = useState(false)
  const { getString } = useStrings()

  const slicedCommitId = commitId.slice(0, 7)

  const handleCopyButtonClick = (e: React.SyntheticEvent): void => {
    e.stopPropagation()
    Utils.copy(commitLink || commitId)
    setIsCommitIdCopied(true)
  }

  const handleCopyButtonTooltipClosed = (): void => {
    setIsCommitIdCopied(false)
  }

  const handleLinkClick = (event: any): void => {
    event.stopPropagation()
    window.open(event.target.href, '_blank')
  }

  return (
    <Text data-name="commitId" className={css.commitId} font={{ variation: FontVariation.SMALL }}>
      {commitLink ? (
        <a className={css.label} href={commitLink} rel="noreferrer" target="_blank" onClick={handleLinkClick}>
          {slicedCommitId}
        </a>
      ) : (
        <span className={css.label}>{slicedCommitId}</span>
      )}
      <Text
        tooltip={
          <Container padding="small">{getString(isCommitIdCopied ? 'copiedToClipboard' : 'clickToCopy')}</Container>
        }
        tooltipProps={{
          onClosed: handleCopyButtonTooltipClosed
        }}
        style={{ cursor: 'pointer' }}
        font={{ variation: FontVariation.SMALL }}
      >
        <Icon name="copy" size={14} onClick={handleCopyButtonClick} />
      </Text>
    </Text>
  )
}

export interface LastCommitProps {
  lastCommit: CIBuildCommit
}

export function LastCommit({ lastCommit }: LastCommitProps): React.ReactElement {
  const { message, id, link } = lastCommit
  return (
    <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small">
      <Icon className={css.icon} name="git-commit" size={14} color={Color.GREY_700} />
      {message ? (
        <Text className={css.message} title={message} font={{ variation: FontVariation.SMALL }} lineClamp={1}>
          {message}
        </Text>
      ) : null}
      {id ? <CommitId commitId={id} commitLink={link} /> : null}
    </Layout.Horizontal>
  )
}

export interface CommitsInfoProps {
  commits?: CIBuildCommit[]
  authorAvatar?: string
}

export function CommitsInfo(props: CommitsInfoProps): React.ReactElement | null {
  const [showCommits, setShowCommits] = React.useState(false)
  const { getString } = useStrings()

  const { commits = [], authorAvatar } = props
  const lastCommit = first(commits || [])

  function toggleCommits(e: React.SyntheticEvent): void {
    e.stopPropagation()
    setShowCommits(status => !status)
  }

  return (
    <div className={css.commitsInfo}>
      {lastCommit?.message && lastCommit?.id ? (
        <LastCommit lastCommit={lastCommit} />
      ) : (
        <Text font={{ variation: FontVariation.SMALL }}>{getString('common.noInfo')}</Text>
      )}
      {commits && commits.length > 1 ? (
        <React.Fragment>
          <div className={css.divider} data-show={showCommits} />
          <Button
            minimal
            icon={showCommits ? 'minus' : 'plus'}
            className={css.moreCommits}
            iconProps={{ size: 8 }}
            onClick={toggleCommits}
          >
            <String stringID="ci.moreCommitsLabel" />
          </Button>

          <Collapse isOpen={showCommits}>
            {commits.slice(1).map((commit, i) => {
              return (
                <div className={css.commit} key={i}>
                  <div style={{ fontSize: 0 }}>
                    <Text className={css.commitText} title={commit.message} font={{ variation: FontVariation.SMALL }}>
                      {commit.message}
                    </Text>
                  </div>
                  <Container flex>
                    {commit.ownerName && (
                      <UserLabel
                        className={css.user}
                        name={commit.ownerName}
                        email={commit.ownerEmail}
                        profilePictureUrl={authorAvatar}
                        iconProps={{ size: 16 }}
                      />
                    )}
                    <TimeAgoPopover time={commit.timeStamp || 0} inline={false} />
                  </Container>
                  {commit.id && <CommitId commitId={commit.id} commitLink={commit.link} />}
                </div>
              )
            })}
          </Collapse>
        </React.Fragment>
      ) : null}
    </div>
  )
}
