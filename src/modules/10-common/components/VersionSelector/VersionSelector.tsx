/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Select, ItemListRenderer } from '@blueprintjs/select'
import { Button, MenuItem, Menu } from '@blueprintjs/core'
import cx from 'classnames'

import { Avatar, Icon, Layout, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'

import css from './VersionSelector.module.scss'

export interface Version {
  commitHash?: string
  commitMssg?: string
  commitedAt?: number
  author?: string
  authorAvatarUrl?: string
  isLatest?: boolean
}
interface VersionSelectorProps {
  versions: Version[]
  isEditMode?: boolean
  isReadOnlyMode?: boolean
}

const VersionSelect = Select.ofType<Version>()

export const VersionSelector = ({
  versions,
  isEditMode = false,
  isReadOnlyMode = false
}: VersionSelectorProps): JSX.Element => {
  const [selectedVersion, setSelectedVersion] = useState<Version | undefined>(
    isEditMode ? { commitMssg: 'Local' } : undefined
  )
  const { getString } = useStrings()

  const handleSelect = (item: Version, _event?: React.SyntheticEvent<HTMLElement, Event> | undefined) => {
    setSelectedVersion(item)
  }

  const itemRenderer = (item: Version): JSX.Element => {
    const { commitMssg, commitHash, commitedAt, author, isLatest } = item
    return (
      <Layout.Vertical>
        <Layout.Horizontal flex style={{ alignItems: 'center' }}>
          <Layout.Horizontal style={{ alignItems: 'center' }}>
            <Icon name="git-commit" />
            &nbsp;
            <Text font={{ weight: 'bold' }}>{commitHash}</Text>
            {isLatest ? <Text font={{ weight: 'bold' }}>{`(${getString('common.latest')})`}</Text> : null}
          </Layout.Horizontal>
          <Layout.Horizontal style={{ alignItems: 'center' }}>
            <Avatar name={author} size="small" hoverCard={false} />
            <Text font={{ size: 'small' }}>{author}</Text>
          </Layout.Horizontal>
        </Layout.Horizontal>
        <Layout.Horizontal flex style={{ alignItems: 'center' }}>
          <Text lineClamp={1} width="60%" font={{ size: 'small' }} alwaysShowTooltip={false}>
            {commitMssg}
          </Text>
          {commitedAt && !isNaN(new Date(commitedAt).getTime()) ? (
            <Text font={{ size: 'small' }}>{new Date(commitedAt).toLocaleString()}</Text>
          ) : null}
        </Layout.Horizontal>
      </Layout.Vertical>
    )
  }

  const itemListRender: ItemListRenderer<Version> = itemListProps => (
    <Menu>
      {selectedVersion ? (
        <Menu.Item
          text={<Text>{getString('common.clearSelection')}</Text>}
          icon="cross"
          onClick={() => setSelectedVersion(undefined)}
          className={css.clear}
        />
      ) : null}
      {itemListProps.items.map((item, i) => itemListProps.renderItem(item, i))}
    </Menu>
  )

  return (
    <VersionSelect
      items={versions || []}
      className={css.versionSelect}
      onItemSelect={handleSelect}
      itemRenderer={(item, { handleClick }) => {
        return <MenuItem text={itemRenderer(item)} onClick={handleClick} key={item.commitHash} />
      }}
      itemListRenderer={itemListRender}
      noResults={<Text padding="small">{getString('noSearchResultsFoundPeriod')}</Text>}
      activeItem={selectedVersion}
      inputProps={{
        placeholder: getString('search')
      }}
      disabled={isReadOnlyMode}
    >
      <Button
        className={cx(css.versionSelect, { [css.disable]: isReadOnlyMode })}
        rightIcon="chevron-down"
        data-testid="version-select"
      >
        <Text lineClamp={1}>
          {selectedVersion ? (
            <Layout.Horizontal style={{ alignItems: 'center' }}>
              <Icon name="git-commit" />
              &nbsp;
              <Text font={{ weight: 'bold' }}>{selectedVersion?.commitHash}</Text>
              {selectedVersion?.isLatest ? (
                <Text font={{ weight: 'bold' }}>{`(${getString('common.latest')})`}</Text>
              ) : null}
              &nbsp;
              <Text lineClamp={1} width="70%" alwaysShowTooltip={false}>
                {selectedVersion?.commitMssg}
              </Text>
            </Layout.Horizontal>
          ) : (
            getString('common.selectVersion')
          )}
        </Text>
      </Button>
    </VersionSelect>
  )
}
