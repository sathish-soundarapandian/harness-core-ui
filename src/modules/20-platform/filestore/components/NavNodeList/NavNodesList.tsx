/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { PropsWithChildren, ReactElement, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { Container, Layout, Text, Icon } from '@harness/uicore'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import { Position, Spinner } from '@blueprintjs/core'
import RootFolderIcon from '@filestore/images/root-folder.svg'
import ClosedFolderIcon from '@filestore/images/closed-folder.svg'
import OpenFolderIcon from '@filestore/images/open-folder.svg'
import FileIcon from '@filestore/images/file-.svg'
import type { FileStoreNodeDTO } from '@filestore/components/FileStoreContext/FileStoreContext'
import { FileStoreContext } from '@filestore/components/FileStoreContext/FileStoreContext'
import { FileStoreNodeTypes, StoreNodeType, SortType } from '@filestore/interfaces/FileStore'
import { FILE_STORE_ROOT, ExtensionType, FileStoreActionTypes } from '@filestore/utils/constants'
import NodeMenuButton from '@filestore/common/NodeMenu/NodeMenuButton'
import useNewNodeModal from '@filestore/common/useNewNodeModal/useNewNodeModal'
import useUploadFile, { UPLOAD_EVENTS } from '@filestore/common/useUpload/useUpload'
import {
  getMenuOptionItems,
  FileStorePopoverOptionItem,
  checkSupportedMime,
  sortNodesByType
} from '@filestore/utils/FileStoreUtils'
import { useUnsavedConfirmation } from '@filestore/common/useUnsavedConfirmation/useUnsavedConfirmation'

import useDelete from '@filestore/common/useDelete/useDelete'
import css from './NavNodeList.module.scss'

export interface FolderNodesListProps {
  fileStore: FileStoreNodeDTO[]
}
export interface RootNodesListProps {
  rootStore: FileStoreNodeDTO[]
}

export const FolderNodesList = ({ fileStore }: FolderNodesListProps): React.ReactElement => (
  <>
    {fileStore?.length &&
      fileStore.map((node: FileStoreNodeDTO) => {
        return <FolderNode key={node.identifier} {...node} />
      })}
  </>
)

export const FolderNode = React.memo((props: PropsWithChildren<FileStoreNodeDTO>): ReactElement => {
  const { identifier, type } = props
  const context = useContext(FileStoreContext)
  const {
    currentNode,
    setCurrentNode,
    getNode,
    loading,
    tempNodes,
    isCachedNode,
    deletedNode,
    fileStore,
    setFileStore,
    unsavedNodes,
    updateCurrentNode,
    handleClosedNode,
    isClosedNode,
    getSortTypeById,
    sortNode,
    globalSort
  } = context

  const [childNodes, setChildNodes] = useState<FileStoreNodeDTO[]>([])
  const [isOpenNode, setIsOpenNode] = useState<boolean>(false)
  const [nodeItem, setNodeItem] = useState<FileStoreNodeDTO>(props)
  const [currentSortType, setCurrentSortType] = useState<SortType>(globalSort)
  const uploadFile = useUploadFile({
    isBtn: false,
    eventMethod: UPLOAD_EVENTS.UPLOAD
  })

  const handleSetChildNodes = (nodes: FileStoreNodeDTO[]): void => {
    setChildNodes(sortNodesByType(nodes, getSortTypeById(nodeItem.identifier, sortNode)))
  }

  const handleSetFileStore = (nodes: FileStoreNodeDTO[]): void => {
    setFileStore(sortNodesByType(nodes, getSortTypeById(nodeItem.identifier, sortNode)))
  }

  useEffect(() => {
    const newSort = getSortTypeById(identifier, sortNode)
    if (currentSortType === newSort) {
      return
    }
    setCurrentSortType(newSort)
    if (currentNode.identifier === FILE_STORE_ROOT) {
      return setFileStore(
        sortNodesByType(fileStore as FileStoreNodeDTO[], getSortTypeById(nodeItem.identifier, sortNode))
      )
    }
    handleSetChildNodes(childNodes)
  }, [sortNode])

  useEffect(() => {
    if (identifier === FILE_STORE_ROOT) {
      setIsOpenNode(true)
    }
  }, [identifier])

  useEffect(() => {
    const cachedNode = isCachedNode(props.identifier)
    if (cachedNode && props?.type === FileStoreNodeTypes.FILE) {
      setNodeItem({
        ...props,
        ...cachedNode
      })
    }
  }, [tempNodes, isCachedNode, props])

  useEffect(() => {
    if (!!tempNodes.length && tempNodes[0].parentIdentifier === nodeItem.identifier && Array.isArray(fileStore)) {
      const existChildNode =
        childNodes.find(item => item.identifier === tempNodes[0].identifier) ||
        fileStore.find(item => item.identifier === tempNodes[0].identifier)
      if (!existChildNode) {
        if (identifier === FILE_STORE_ROOT) {
          handleSetFileStore([tempNodes[0], ...fileStore])
        } else {
          handleSetChildNodes([tempNodes[0], ...childNodes])
        }
        setCurrentNode(tempNodes[0])
      }
    }
  }, [tempNodes])

  React.useEffect(() => {
    const existDeletedItem = childNodes.find(item => item.identifier === deletedNode)

    if (existDeletedItem && identifier !== FILE_STORE_ROOT) {
      handleSetChildNodes(childNodes.filter(node => node.identifier !== deletedNode))
    }
    const existInFS = !!fileStore && fileStore.find((item: FileStoreNodeDTO) => item.identifier === deletedNode)

    if (identifier === FILE_STORE_ROOT && existInFS && !!fileStore) {
      handleSetFileStore(fileStore.filter((item: FileStoreNodeDTO) => item.identifier !== deletedNode))
    }
  }, [deletedNode])

  const isActiveNode = React.useMemo(() => currentNode.identifier === identifier, [currentNode, identifier])
  const isRootNode = React.useMemo(() => identifier === FILE_STORE_ROOT, [identifier])
  const isFolderNode = React.useMemo(() => type === FileStoreNodeTypes.FOLDER, [type])

  useEffect(() => {
    if (isActiveNode && !isClosedNode(identifier) && !isOpenNode) {
      setIsOpenNode(true)
    }
  }, [isActiveNode, isClosedNode, isOpenNode, setIsOpenNode, identifier])

  useEffect(() => {
    if (currentNode.identifier === nodeItem.identifier) {
      setNodeItem(prevState => {
        return {
          ...prevState,
          ...currentNode
        }
      })
    }
    if (currentNode?.children && isActiveNode && !isRootNode) {
      setNodeItem(currentNode)
      handleSetChildNodes(
        currentNode.children.map(node => ({
          ...node,
          parentName: props.name,
          isOpen: false
        }))
      )
    }
  }, [currentNode, isActiveNode, isRootNode, setNodeItem])

  const handleGetNodes = (e: React.MouseEvent, isCollapse?: boolean): void => {
    if (isOpenNode && nodeItem.type === FileStoreNodeTypes.FOLDER && identifier !== FILE_STORE_ROOT && isCollapse) {
      setIsOpenNode(false)
      setCurrentNode({ ...nodeItem, children: [], isOpen: false })
      handleClosedNode(nodeItem.identifier, false)
      return
    }
    if (!tempNodes[0] && !unsavedNodes[0]) {
      e.stopPropagation()
    }
    handleClosedNode(nodeItem.identifier, true)

    updateCurrentNode({ ...currentNode, isOpen: true })
    if (!loading) {
      setIsOpenNode(true)
      if (!isActiveNode) {
        setCurrentNode(nodeItem)
      }
      if (props.type === FileStoreNodeTypes.FILE) {
        return
      }
      if (!isRootNode) {
        getNode({
          ...nodeItem,
          children: undefined
        })
      } else {
        getNode({
          identifier: FILE_STORE_ROOT,
          name: FILE_STORE_ROOT,
          type: FileStoreNodeTypes.FOLDER
        })
      }
    }
  }

  const { handleUnsavedConfirmation } = useUnsavedConfirmation({
    callback: (e: React.MouseEvent) => handleGetNodes(e),
    isNavigationBar: true
  })

  const getNodeIcon = useCallback(
    (nodeType: StoreNodeType): string => {
      switch (nodeType) {
        case FileStoreNodeTypes.FILE:
          return FileIcon
        case FileStoreNodeTypes.FOLDER:
          if (isRootNode) {
            return RootFolderIcon
          }
          return isOpenNode ? OpenFolderIcon : ClosedFolderIcon
        default:
          return RootFolderIcon
      }
    },
    [isRootNode, isOpenNode]
  )

  const configNewNode = useMemo(() => {
    return {
      parentIdentifier: identifier,
      editMode: false,
      tempNode: context.isCachedNode(identifier),
      currentNode: context.currentNode,
      fileStoreContext: context,
      type: context.currentNode.type as FileStoreNodeTypes
    }
  }, [identifier, context])

  const newFileMenuItem = useNewNodeModal({
    ...configNewNode,
    type: FileStoreNodeTypes.FILE
  })
  const newFolderMenuItem = useNewNodeModal({
    ...configNewNode
  })
  const editMenuItem = useNewNodeModal({
    ...configNewNode,
    editMode: true
  })
  const deleteMenuItem = useDelete(identifier, props.name, type)

  const sortNodeMenuItem: FileStorePopoverOptionItem = {
    actionType: FileStoreActionTypes.SORT_NODE,
    label: 'filestore.sort.nodeBy',
    onClick: () => null,
    identifier
  }

  const ACTIONS: FileStorePopoverOptionItem[] =
    identifier !== FILE_STORE_ROOT
      ? [newFileMenuItem, newFolderMenuItem, uploadFile, '-', editMenuItem, deleteMenuItem, '-', sortNodeMenuItem]
      : [newFileMenuItem, newFolderMenuItem, uploadFile, '-', sortNodeMenuItem]

  const isUnsupported =
    isCachedNode(currentNode.identifier) &&
    !checkSupportedMime(currentNode?.mimeType as ExtensionType) &&
    currentNode.type === FileStoreNodeTypes.FILE

  const optionsMenuItems = isUnsupported
    ? [
        {
          actionType: deleteMenuItem.actionType,
          text: deleteMenuItem.label,
          onClick: deleteMenuItem.onClick,
          identifier: deleteMenuItem.identifier
        }
      ]
    : getMenuOptionItems(ACTIONS, nodeItem.type as FileStoreNodeTypes)

  const NodesList = React.useMemo(() => {
    return (
      <Layout.Vertical style={{ marginLeft: '3%' }}>
        <FolderNodesList fileStore={childNodes} />
      </Layout.Vertical>
    )
  }, [childNodes])

  const collapseIconType = React.useMemo(() => {
    return isOpenNode ? 'main-chevron-down' : 'main-chevron-right'
  }, [isOpenNode])

  const CollapseIcon = React.useMemo(() => {
    return !isRootNode ? (
      <Icon className={cx(css.nodeCollapseItem, css.nodeCollapseActive)} name={collapseIconType} size={12} />
    ) : null
  }, [isRootNode, collapseIconType])

  return (
    <Layout.Vertical style={{ marginLeft: !isRootNode ? '3%' : 'none', cursor: 'pointer' }} key={identifier}>
      {isFolderNode ? (
        <Container
          className={css.nodeCollapseContainer}
          onClick={e => {
            handleGetNodes(e, true)
          }}
        >
          {CollapseIcon}
        </Container>
      ) : null}
      <div
        className={cx(css.mainNode, isActiveNode && css.activeNode)}
        style={{ position: 'relative', width: '100%' }}
        onClick={e => {
          handleUnsavedConfirmation(e)
        }}
      >
        <div style={{ display: 'flex', width: '80%' }} className={css.navItemName}>
          <img src={getNodeIcon(type)} alt={type} />
          <Text
            font={{ size: 'normal' }}
            color={!isActiveNode ? Color.PRIMARY_9 : Color.GREY_0}
            tooltip={nodeItem.name}
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            width={'100%'}
          >
            {nodeItem.name}
          </Text>
        </div>
        {isActiveNode &&
          (!loading ? (
            <NodeMenuButton items={optionsMenuItems} position={Position.RIGHT_TOP} />
          ) : (
            <Container margin={{ right: 'small' }}>
              <Spinner size={20} />
            </Container>
          ))}
      </div>
      {!!childNodes.length && NodesList}
    </Layout.Vertical>
  )
})

FolderNode.displayName = 'FolderNode'

export const RootNodesList = ({ rootStore }: RootNodesListProps): React.ReactElement => (
  <Layout.Vertical padding={{ left: 'small' }} margin={{ top: 'xlarge' }}>
    <Container>
      <FolderNode type={FileStoreNodeTypes.FOLDER} identifier={FILE_STORE_ROOT} name={FILE_STORE_ROOT} />
    </Container>
    <FolderNodesList fileStore={rootStore} />
  </Layout.Vertical>
)
