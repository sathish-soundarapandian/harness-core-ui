/* eslint-disable react/function-component-definition */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color, FontVariation } from '@harness/design-system'
import { Icon, IconName, Layout, Text } from '@harness/uicore'
import React, { FC } from 'react'
import { killEvent } from '@common/utils/eventUtils'
import css from './ExecutionListTable.module.scss'

export interface CITriggerInfoProps {
  repoName?: string
  branch?: string
  tag?: string
  ciExecutionInfoDTO: any
}

export const CITriggerInfo: FC<CITriggerInfoProps> = props => {
  const { repoName, branch, tag, ciExecutionInfoDTO } = props

  return repoName || branch ? (
    <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'start' }}>
      {ciExecutionInfoDTO.pullRequest ? (
        <>
          <Element value={ciExecutionInfoDTO.pullRequest.sourceBranch} icon="git-branch" />
          <Icon name="arrow-right" size={12} color={Color.GREY_400} />
          <Element value={ciExecutionInfoDTO.pullRequest.targetBranch} icon="git-branch" />
          <div className={css.separator} />
          <ElementWithLink
            value={ciExecutionInfoDTO.pullRequest.id}
            link={ciExecutionInfoDTO.pullRequest.link}
            icon="git-pull"
          />
          <Text font={{ variation: FontVariation.TINY_SEMI }} className={css.prState}>
            {ciExecutionInfoDTO?.pullRequest?.state}
          </Text>
        </>
      ) : (
        branch && (
          <>
            <Element value={branch} icon="git-branch" />
            <div className={css.separator} />
            <ElementWithLink
              value={ciExecutionInfoDTO.branch?.commits[0]?.id?.slice(0, 7)}
              link={ciExecutionInfoDTO.branch?.commits?.[0]?.link}
              icon="git-commit"
            />
          </>
        )
      )}

      {tag && (
        <>
          <div className={css.separator} />
          <Element value={tag} icon="tag" />
        </>
      )}
    </Layout.Horizontal>
  ) : null
}

const ElementWithLink: FC<{ value: string; link: string; icon: IconName }> = ({ value, link, icon }) => {
  return (
    <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'start' }} onClick={killEvent}>
      <Icon name={icon} size={12} color={Color.GREY_600} />
      <a target="_blank" rel="noreferrer" href={link}>
        <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.PRIMARY_7} lineClamp={1}>
          {value}
        </Text>
      </a>
    </Layout.Horizontal>
  )
}

const Element: FC<{ value: string; icon: IconName }> = ({ value, icon }) => {
  return (
    <Layout.Horizontal
      spacing="small"
      flex={{ alignItems: 'center', justifyContent: 'start' }}
      style={{ flexShrink: 1 }}
    >
      <Icon name={icon} size={12} color={Color.GREY_600} />
      <Text lineClamp={1} color={Color.GREY_800} font={{ variation: FontVariation.SMALL_SEMI }} title={value}>
        {value}
      </Text>
    </Layout.Horizontal>
  )
}
