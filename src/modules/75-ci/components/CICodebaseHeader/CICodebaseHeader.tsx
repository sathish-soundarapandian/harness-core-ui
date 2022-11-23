/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { truncate } from 'lodash-es'
import cx from 'classnames'
import { Text, Icon, Container, Layout } from '@harness/uicore'

import css from './CICodebaseHeader.module.scss'

interface CICodebaseHeaderProps {
  repo?: string
  branch?: string
  targetBranch?: string
  tag?: string
  isDetailedView?: boolean
}

const MAX_LABEL_CHAR_LENGTH = 30

export const CICodebaseHeader: React.FC<CICodebaseHeaderProps> = props => {
  const { repo = '', branch = '', tag = '', targetBranch = '', isDetailedView } = props

  return repo || branch ? (
    <Layout.Horizontal className={cx({ [css.strip]: isDetailedView })} spacing={tag ? 'small' : ''}>
      <div className={css.label}>
        {repo ? (
          <Container flex className={cx({ [css.separator]: branch })} padding={{ right: 'small' }}>
            <Icon name="repository" size={14} color="primary7" />
            <Text
              lineClamp={1}
              color="primary7"
              font={{ size: 'small', weight: 'semi-bold' }}
              className={css.partLabel}
              title={repo}
            >
              {truncate(repo, { length: MAX_LABEL_CHAR_LENGTH })}
            </Text>
          </Container>
        ) : null}
        {branch ? (
          <Container flex padding={{ left: repo ? 'small' : 0 }}>
            <Icon name="git-new-branch" size={12} color="primary7" />
            <Text
              lineClamp={1}
              color="primary7"
              font={{ size: 'small', weight: 'semi-bold' }}
              className={css.partLabel}
              title={branch}
            >
              {truncate(branch, { length: MAX_LABEL_CHAR_LENGTH })}
            </Text>
          </Container>
        ) : null}
      </div>
      {targetBranch ? (
        <Container flex>
          <Icon name="arrow-right" size={14} padding={{ left: 'small', right: 'small' }} />
          <Container flex padding={{ left: 'medium', right: 'small' }} className={css.label}>
            <Icon name="git-new-branch" size={12} color="primary7" />
            <Text lineClamp={1} color="primary7" font={{ size: 'small', weight: 'semi-bold' }} title={targetBranch}>
              {truncate(targetBranch, { length: MAX_LABEL_CHAR_LENGTH })}
            </Text>
          </Container>
        </Container>
      ) : null}
      {tag ? (
        <Container flex className={css.label}>
          <Icon name="tag" size={14} color="primary7" />
          <Text lineClamp={1} color="primary7" font={{ size: 'small', weight: 'semi-bold' }} title={tag}>
            {truncate(tag, { length: MAX_LABEL_CHAR_LENGTH })}
          </Text>
        </Container>
      ) : null}
    </Layout.Horizontal>
  ) : null
}
