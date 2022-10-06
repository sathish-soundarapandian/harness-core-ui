/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, Text, SelectOption } from '@wings-software/uicore'
import { PopoverInteractionKind, Position } from '@blueprintjs/core'
import cx from 'classnames'
import RepoBranchSelectV2 from '@common/components/RepoBranchSelectV2/RepoBranchSelectV2'
import css from './GitRemoteDetails.module.scss'

export interface GitRemoteDetailsProps {
  connectorRef?: string
  repoName?: string
  filePath?: string
  fileUrl?: string
  branch?: string
  onBranchChange?: (selectedFilter: { branch: string }, defaultSelected?: boolean) => void
  flags?: {
    borderless?: boolean
    showRepo?: boolean
    normalInputStyle?: boolean
    readOnly?: boolean
    fallbackDefaultBranch?: boolean
  }
}

const getTooltipContent = (filePath: string, fileUrl?: string) => {
  // fileUrl will available only once entity is saved in Git,
  // it will not be available while creating the entities
  if (fileUrl) {
    return (
      <a href={fileUrl} target="_blank" rel="noopener noreferrer">
        <Text className={css.tooltip}>{fileUrl}</Text>
      </a>
    )
  } else {
    return <Text className={css.tooltip}>{filePath}</Text>
  }
}

const GitRemoteDetails = ({
  connectorRef,
  repoName,
  filePath,
  fileUrl,
  branch = '',
  onBranchChange,
  flags: { borderless = true, showRepo = true, normalInputStyle = false, readOnly = false } = {}
}: GitRemoteDetailsProps): React.ReactElement => {
  return (
    <div className={cx(css.wrapper, { [css.normalInputStyle]: normalInputStyle })}>
      {showRepo && (
        <>
          <Icon
            name="repository"
            size={normalInputStyle ? undefined : 14}
            margin={{
              right: 'small'
            }}
          />
          <Text
            tooltip={filePath && getTooltipContent(filePath, fileUrl)}
            tooltipProps={{
              isDark: true,
              interactionKind: PopoverInteractionKind.HOVER,
              position: Position.BOTTOM_LEFT
            }}
            lineClamp={1}
            alwaysShowTooltip
            className={css.repoDetails}
          >
            {repoName}
          </Text>
          <span className={css.separator}></span>
        </>
      )}
      <Icon
        name="git-new-branch"
        size={normalInputStyle ? undefined : 14}
        margin={{
          right: 'small'
        }}
      />
      {readOnly ? (
        <Text lineClamp={1} className={css.repoDetails}>
          {branch}
        </Text>
      ) : (
        <RepoBranchSelectV2
          name="remoteBranch"
          noLabel={true}
          connectorIdentifierRef={connectorRef}
          repoName={repoName}
          onChange={(selected: SelectOption, defaultSelected = false): void => {
            onBranchChange?.(
              {
                branch: selected.value as string
              },
              defaultSelected
            )
          }}
          selectedValue={branch}
          branchSelectorClassName={cx(css.branchSelector, { [css.transparent]: borderless })}
          selectProps={{ borderless }}
          showIcons={false}
          showErrorInModal
        />
      )}
    </div>
  )
}

export default GitRemoteDetails
