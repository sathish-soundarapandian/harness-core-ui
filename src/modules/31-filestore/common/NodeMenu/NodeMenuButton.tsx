/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement, Fragment, useState } from 'react'
import { Classes, IMenuItemProps, Menu, PopoverPosition } from '@blueprintjs/core'
import { Button, ButtonProps, Popover } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { FileStoreContext } from '@filestore/components/FileStoreContext/FileStoreContext'

import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import {
  getIconByActionType,
  getPermissionsByActionType,
  getSortIconByActionType,
  getSortLabelByActionType
} from '@filestore/utils/FileStoreUtils'
import { FileStoreActionTypes, defaultSortItems } from '@filestore/utils/constants'
import type { SortType } from '@filestore/interfaces/FileStore'

import css from './NodeMenuButton.module.scss'

interface NodeMenuItem extends Omit<IMenuItemProps, 'icon'> {
  node?: ReactElement
  actionType: FileStoreActionTypes
  identifier?: string
}

export type Item = NodeMenuItem | '-'

export interface NodeMenuButtonProps extends ButtonProps {
  items: Item[]
  position: PopoverPosition
  isReadonly?: boolean
  sortItems?: SortType[] | []
}

const NodeMenuButton = ({
  items,
  position,
  isReadonly = false,
  sortItems = defaultSortItems
}: NodeMenuButtonProps): ReactElement => {
  const { getString } = useStrings()

  const [menuOpen, setMenuOpen] = useState(false)

  const context = React.useContext(FileStoreContext)
  const { updateSortNode } = context

  return (
    <Popover
      isOpen={menuOpen}
      onInteraction={nextOpenState => {
        setMenuOpen(nextOpenState)
      }}
      boundary="viewport"
      className={Classes.DARK}
      popoverClassName={css.popover}
      position={position}
      content={
        <Menu style={{ minWidth: '180px' }}>
          {items.map((item: Item, key: number) => {
            if (item !== '-' && item.actionType === FileStoreActionTypes.SORT_NODE) {
              return (
                <RbacMenuItem
                  icon={getIconByActionType(item.actionType)}
                  text={getString('filestore.sort.nodeBy')}
                  permission={getPermissionsByActionType(item.actionType, item.identifier)}
                >
                  {sortItems.length &&
                    sortItems.map((sortItem: SortType) => {
                      return (
                        <RbacMenuItem
                          key={sortItem}
                          icon={getSortIconByActionType(sortItem)}
                          text={getString(getSortLabelByActionType(sortItem))}
                          permission={getPermissionsByActionType(item.actionType, item.identifier)}
                          onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>) => {
                            e.stopPropagation()
                            updateSortNode({
                              identifier: item.identifier as string,
                              sortType: sortItem
                            })
                          }}
                        />
                      )
                    })}
                </RbacMenuItem>
              )
            }
            return (
              <Fragment key={key}>
                {item === '-' ? (
                  key !== 0 && <Menu.Divider />
                ) : (
                  <RbacMenuItem
                    icon={getIconByActionType(item.actionType)}
                    text={item.text}
                    permission={getPermissionsByActionType(item.actionType, item.identifier)}
                    onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>) => {
                      e.stopPropagation()
                      if (item?.onClick) {
                        item.onClick(e)
                        setMenuOpen(false)
                      }
                    }}
                  />
                )}
              </Fragment>
            )
          })}
        </Menu>
      }
    >
      <Button
        minimal
        disabled={isReadonly}
        intent="primary"
        icon="Options"
        withoutBoxShadow
        onClick={e => {
          e.stopPropagation()
          setMenuOpen(!menuOpen)
        }}
      />
    </Popover>
  )
}

export default NodeMenuButton
