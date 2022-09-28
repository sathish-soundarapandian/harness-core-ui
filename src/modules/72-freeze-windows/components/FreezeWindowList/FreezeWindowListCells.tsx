/* eslint-disable react/function-component-definition */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Classes, Menu, Position } from '@blueprintjs/core'
import { Color, FontVariation } from '@harness/design-system'
import { Button, Layout, Popover, Text, TagsPopover, ButtonVariation, Icon } from '@harness/uicore'
import { Link } from 'react-router-dom'
import type { Cell, CellValue, ColumnInstance, Renderer, Row, TableInstance } from 'react-table'
import React from 'react'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { getReadableDateTime } from '@common/utils/dateUtils'
import { killEvent } from '@common/utils/eventUtils'
import type { PageFreezeResponse } from 'services/cd-ng'
import type { FreezeWindowListColumnActions } from './FreezeWindowListTable'
import css from './FreezeWindowList.module.scss'

type CellTypeWithActions<D extends Record<string, any>, V = any> = TableInstance<D> & {
  column: ColumnInstance<D> & FreezeWindowListColumnActions
  row: Row<D>
  cell: Cell<D, V>
  value: CellValue<V>
}

type CellType = Renderer<CellTypeWithActions<PageFreezeResponse>>

export const FreezeNameCell: CellType = ({ row, column }) => {
  const data = row.original as any // TODO: remove once BE ready with proper swagger
  const { getString } = useStrings()

  return (
    <Layout.Vertical>
      <Layout.Horizontal
        spacing="small"
        flex={{ alignItems: 'center', justifyContent: 'start' }}
        margin={{ bottom: 'small' }}
      >
        <Link to={column.getViewFreezeWindowLink(data)}>
          <Text font={{ variation: FontVariation.LEAD }} color={Color.PRIMARY_7} lineClamp={1}>
            {data.name}
          </Text>
        </Link>

        {data.description && (
          <Popover className={Classes.DARK} position={Position.LEFT}>
            <Icon name="description" size={24} color={Color.GREY_600} />
            <Layout.Vertical spacing="medium" padding="large" style={{ maxWidth: 400 }}>
              <Text color={Color.GREY_200} font={{ variation: FontVariation.SMALL_SEMI }}>
                Description
              </Text>
              <Text color={Color.WHITE} font={{ variation: FontVariation.SMALL }}>
                {data.description}
              </Text>
            </Layout.Vertical>
          </Popover>
        )}

        {data.tags && Object.keys(data.tags || {}).length ? (
          <TagsPopover
            tags={data.tags}
            iconProps={{ size: 12, color: Color.GREY_600 }}
            popoverProps={{ className: Classes.DARK }}
            className={css.tags}
          />
        ) : null}
      </Layout.Horizontal>

      <Text color={Color.GREY_600} font="small" lineClamp={1}>
        {getString('idLabel', { id: data.identifier })}
      </Text>
    </Layout.Vertical>
  )
}

export const FreezeTimeCell: CellType = () => {
  return (
    <Layout.Vertical spacing="small">
      <Text color={Color.GREY_900} font={{ variation: FontVariation.SMALL_SEMI }} lineClamp={1}>
        Every Saturday and Sunday
      </Text>
      <Layout.Horizontal spacing="small">
        <Text color={Color.GREY_900} font={{ variation: FontVariation.SMALL }}>
          12:00 am - 12:00 pm
        </Text>
        <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL }}>
          (GMT+00:00)UTC
        </Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export const StatusCell: CellType = ({ row }) => {
  const data = row.original as any
  return (
    <Text
      font={{ variation: FontVariation.TINY_SEMI }}
      color={data.status === 'ACTIVE' ? Color.PRIMARY_7 : Color.GREY_700}
      className={cx(css.status, data.status === 'ACTIVE' ? css.active : css.inactive)}
    >
      {data.status}
    </Text>
  )
}

export const LastModifiedCell: CellType = ({ row }) => {
  const data = row.original as any
  return (
    <Text color={Color.GREY_900} font={{ size: 'small' }}>
      {getReadableDateTime(data.lastUpdatedAt)}
    </Text>
  )
}

export const MenuCell: CellType = ({ row, column }) => {
  const data = row.original as any

  return (
    <Layout.Horizontal style={{ justifyContent: 'flex-end' }} onClick={killEvent}>
      <Popover className={Classes.DARK} position={Position.LEFT}>
        <Button variation={ButtonVariation.ICON} icon="Options" aria-label="Freeze window menu actions" />
        <Menu style={{ backgroundColor: 'unset' }}>
          <Menu.Item
            className={css.link}
            text={<Link to={column.getViewFreezeWindowLink(data)}>Edit Freeze Window</Link>}
          />
          <Menu.Item text="Delete Freeze Window" onClick={() => column.onDeleteFreezeWindow(data)} />
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}
