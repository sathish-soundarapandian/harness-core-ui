/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { createContext, useState, useCallback, useEffect } from 'react'
import type { FileStoreNodeDTO as NodeDTO, FileDTO, NGTag } from 'services/cd-ng'
import { useGetFolderNodes, getFileStoreNodesOnPathPromise } from 'services/cd-ng'
import { FILE_VIEW_TAB, FileStoreNodeTypes, SORT_TYPE } from '@filestore/interfaces/FileStore'
import { FILE_STORE_ROOT } from '@filestore/utils/constants'
import type { FileUsage, SortType, NodeSortDTO } from '@filestore/interfaces/FileStore'
import { sortNodesByType } from '@filestore/utils/FileStoreUtils'

import { ScopedObjectDTO, useFileStoreScope } from '../../common/useFileStoreScope/useFileStoreScope'

export interface FileContentDTO extends FileDTO {
  content: string
}

export interface FileStoreNodeDTO extends NodeDTO {
  content?: string | undefined
  children?: FileStoreNodeDTO[] | undefined
  tempNode?: boolean
  mimeType?: string
  fileUsage?: FileUsage | null
  parentIdentifier?: string
  description?: string
  tags?: NGTag[]
  parentName?: string
  path?: string
  initialContent?: string
  savedFileUsage?: boolean
  isOpen?: boolean
}

export interface FileStoreContextState {
  currentNode: FileStoreNodeDTO
  setCurrentNode: (node: FileStoreNodeDTO) => void
  fileStore: FileStoreNodeDTO[] | undefined
  setFileStore: (nodes: FileStoreNodeDTO[]) => void
  updateFileStore: (nodes: FileStoreNodeDTO[]) => void
  getNode: (node: FileStoreNodeDTO, config?: GetNodeConfig) => void
  loading: boolean
  setLoading: (loading: boolean) => void
  activeTab: string
  setActiveTab: (tab: FILE_VIEW_TAB) => void
  updateCurrentNode: (node: FileStoreNodeDTO) => void
  tempNodes: FileStoreNodeDTO[]
  setTempNodes: (node: FileStoreNodeDTO[]) => void
  unsavedNodes: FileStoreNodeDTO[]
  setUnsavedNodes: (node: FileStoreNodeDTO[]) => void
  updateTempNodes: (node: FileStoreNodeDTO, isReplace?: boolean) => void
  deletedNode: string
  addDeletedNode: (node: string) => void
  removeFromTempNodes: (nodeId: string) => void
  isCachedNode: (nodeId: string) => FileStoreNodeDTO | undefined
  isModalView: boolean
  scope: string
  queryParams: ScopedObjectDTO
  fileUsage?: FileUsage
  handleSetIsUnsaved?: (status: boolean) => void
  closedNode: string
  handleClosedNode: (nodeId: string, filter: boolean) => void
  isClosedNode: (nodeId: string) => boolean
  sortNode: NodeSortDTO[]
  updateSortNode: (node: NodeSortDTO) => void
  getSortTypeById: (nodeId: string, nodes: NodeSortDTO[]) => SortType
  globalSort: SortType
  updateGlobalSort: (sortType: SortType) => void
  pathValue: string
  scopeValue: string
  getNodeByPath: () => void
  isReadonly: boolean
}

export interface GetNodeConfig {
  setNewCurrentNode?: boolean
  newNode?: FileStoreNodeDTO
  identifier?: string
  type: FileStoreNodeTypes
  parentName?: string
  switchNode?: string
}

export const FileStoreContext = createContext({} as FileStoreContextState)

interface FileStoreContextProps {
  scope?: string
  isModalView?: boolean
  children?: any
  fileUsage?: FileUsage
  handleSetIsUnsaved?: (status: boolean) => void
  scopeValue?: string
  pathValue?: string
  isReadonly?: boolean
}

export const FileStoreContextProvider: React.FC<FileStoreContextProps> = (props: FileStoreContextProps) => {
  const {
    scope = '',
    isModalView = false,
    fileUsage,
    handleSetIsUnsaved,
    scopeValue = '',
    pathValue = '',
    isReadonly = false
  } = props
  const queryParams = useFileStoreScope({
    scope,
    isModalView,
    scopeValue,
    pathValue
  })
  const [fileStore, setFileStore] = useState<FileStoreNodeDTO[] | undefined>()
  const [tempNodes, setTempNodes] = useState<FileStoreNodeDTO[]>([])
  const [unsavedNodes, setUnsavedNodes] = useState<FileStoreNodeDTO[]>([])
  const [deletedNode, setDeletedNodes] = useState<string>('')
  const [activeTab, setActiveTab] = useState<FILE_VIEW_TAB>(FILE_VIEW_TAB.DETAILS)
  const [loading, setLoading] = useState<boolean>(false)
  const [closedNode, setClosedNode] = useState<string>('')
  const [globalSort, setGlobalSort] = useState<SortType>(SORT_TYPE.ALPHABETICAL_FILE_TYPE)
  const [sortNode, setSortNode] = useState<NodeSortDTO[]>([
    { identifier: FILE_STORE_ROOT, sortType: SORT_TYPE.ALPHABETICAL_FILE_TYPE }
  ])

  const [currentNode, setCurrentNodeState] = useState<FileStoreNodeDTO>({
    identifier: FILE_STORE_ROOT,
    name: FILE_STORE_ROOT,
    type: FileStoreNodeTypes.FOLDER,
    children: []
  } as FileStoreNodeDTO)

  const { mutate: getFolderNodes, loading: isGettingFolderNodes } = useGetFolderNodes({
    queryParams: {
      ...queryParams,
      fileUsage
    }
  })

  const updateGlobalSort = (sortType: SortType): void => {
    setGlobalSort(sortType)
  }

  useEffect(() => {
    setSortNode([
      ...sortNode.map((sort: NodeSortDTO) => ({
        ...sort,
        sortType: globalSort
      }))
    ])
    setFileStore(sortNodesByType(fileStore as FileStoreNodeDTO[], globalSort))
  }, [globalSort])

  const updateSortNode = (node: NodeSortDTO): void => {
    const nodeHasSortType = sortNode.find((item: NodeSortDTO) => item.identifier === node.identifier)
    if (nodeHasSortType) {
      return setSortNode([
        ...sortNode.map((item: NodeSortDTO) => {
          if (item.identifier === node.identifier) {
            return {
              ...item,
              sortType: node.sortType
            }
          }
          return item
        })
      ])
    }
    setSortNode([...sortNode, node])
  }

  const getSortTypeById = (nodeId: string, nodes: NodeSortDTO[]): SortType => {
    const assignedSortType = nodes.find((item: NodeSortDTO) => item.identifier === nodeId)
    return assignedSortType ? assignedSortType.sortType : globalSort
  }

  const setCurrentNode = (node: FileStoreNodeDTO): void => {
    setCurrentNodeState(node)
  }

  const handleClosedNode = (id: string, filter = false): void => {
    if (filter && id !== FILE_STORE_ROOT) {
      setClosedNode('')
      return
    }
    setClosedNode(id)
  }

  const isClosedNode = React.useCallback(
    (nodeIdentifier: string): boolean => {
      return closedNode === nodeIdentifier
    },
    [closedNode]
  )

  const updateCurrentNode = (node: FileStoreNodeDTO): void => {
    setCurrentNode(node)
  }

  const updateFileStore = useCallback(
    (store: FileStoreNodeDTO[]): void => {
      setFileStore(store)
    },
    [setFileStore]
  )

  const updateTempNodes = (node: FileStoreNodeDTO, isReplace?: boolean): void => {
    if (isReplace) {
      return setTempNodes([node])
    }
    setTempNodes([
      ...tempNodes.map(
        (tempNode: FileStoreNodeDTO): FileStoreNodeDTO => (tempNode.identifier === node.identifier ? node : tempNode)
      )
    ])
  }

  const addDeletedNode = (node: string): void => {
    setDeletedNodes(node)
  }

  const removeFromTempNodes = (nodeIdentifier: string): void => {
    setTempNodes(tempNodes.filter((tempNode: FileStoreNodeDTO) => tempNode.identifier !== nodeIdentifier))
  }

  const isCachedNode = useCallback(
    (nodeIdentifier: string): FileStoreNodeDTO | undefined => {
      return tempNodes.find((tempNode: FileStoreNodeDTO): boolean => tempNode.identifier === nodeIdentifier)
    },
    [tempNodes]
  )

  const findNodeByPath = (nodes: FileStoreNodeDTO[], paths: string[], parentName: string): void => {
    if (nodes) {
      paths.forEach((path: string) => {
        nodes.find((node: FileStoreNodeDTO) => {
          if (node.name === path) {
            setCurrentNode({
              ...node,
              children: node?.children?.map((nodeItem: FileStoreNodeDTO) => {
                return {
                  ...nodeItem,
                  parentName: parentName
                }
              })
            })
            if (node?.children?.length) {
              findNodeByPath(
                node.children,
                paths.filter(pathItem => pathItem !== path),
                node.name
              )
            }
          }
        })
      })
    }
  }

  const getNodeByPath = async (): Promise<void> => {
    getFileStoreNodesOnPathPromise({
      queryParams: {
        ...queryParams,
        path: queryParams?.path as string
      }
    }).then(res => {
      if (res?.data?.children) {
        setFileStore(
          sortNodesByType(
            res.data.children.map(node => {
              return {
                ...node,
                parentName: FILE_STORE_ROOT
              }
            }),
            globalSort
          )
        )

        if (pathValue === '/') {
          setCurrentNode({
            ...res.data,
            parentName: FILE_STORE_ROOT
          })
        } else {
          const paths = pathValue.split('/').slice(1)
          setCurrentNode({
            ...res.data,
            parentName: FILE_STORE_ROOT
          })
          findNodeByPath(res.data.children, paths, FILE_STORE_ROOT)
        }
      }
      if (!res?.data) {
        getFolderNodes({ identifier: FILE_STORE_ROOT, name: FILE_STORE_ROOT, type: FileStoreNodeTypes.FOLDER }).then(
          response => {
            if (response?.data?.children) {
              setFileStore(response.data.children)
              setCurrentNode({
                ...response.data,
                parentName: FILE_STORE_ROOT
              })
            }
          }
        )
      }
    })
  }

  const getNode = async (nodeParams: FileStoreNodeDTO, config?: GetNodeConfig): Promise<void> => {
    const getParentName = (node: FileStoreNodeDTO): string => {
      if (node?.path) {
        const path = node.path.slice(1).split('/')
        if (path.length < 2) {
          return path[0]
        } else {
          return path[path.length - 2]
        }
      } else {
        return FILE_STORE_ROOT
      }
    }
    getFolderNodes({ ...nodeParams, children: undefined }).then(response => {
      if (nodeParams?.identifier === FILE_STORE_ROOT) {
        setFileStore(
          sortNodesByType(
            response?.data?.children?.map((node: FileStoreNodeDTO) => {
              return {
                ...node,
                parentIdentifier: FILE_STORE_ROOT,
                parentName: FILE_STORE_ROOT
              }
            }) as FileStoreNodeDTO[],
            getSortTypeById(FILE_STORE_ROOT, sortNode)
          )
        )
      }
      if (response?.data) {
        if (!config?.switchNode) {
          updateCurrentNode({
            ...nodeParams,
            ...response.data,
            children: response.data?.children?.map((node: FileStoreNodeDTO) => {
              return {
                ...node,
                parentName: response?.data?.name
              }
            }),
            parentName: getParentName(response?.data)
          })
        }
        if (config?.newNode && config?.type === FileStoreNodeTypes.FOLDER) {
          setCurrentNode({
            ...nodeParams,
            ...config.newNode
          })
        }
        if (config?.switchNode && config?.type === FileStoreNodeTypes.FOLDER) {
          setCurrentNode({
            ...nodeParams,
            ...response.data,
            children: response.data?.children?.map((node: FileStoreNodeDTO) => ({
              ...node,
              parentName: response?.data?.name
            }))
          })
        }
        if (config) {
          if (config?.type === FileStoreNodeTypes.FILE && config?.identifier && response.data?.children) {
            const newFile = response.data.children.find(
              (node: FileStoreNodeDTO) => node.identifier === config.identifier
            )
            if (newFile) {
              setCurrentNode({
                ...nodeParams,
                ...newFile,
                parentName: config?.parentName || ''
              })
            }
          }
        }
      }
    })
  }

  return (
    <FileStoreContext.Provider
      value={{
        currentNode,
        setCurrentNode,
        fileStore,
        getNode,
        setFileStore,
        loading: loading || isGettingFolderNodes,
        setLoading,
        updateCurrentNode,
        updateFileStore,
        tempNodes,
        setTempNodes,
        updateTempNodes,
        removeFromTempNodes,
        isCachedNode,
        activeTab,
        setActiveTab,
        isModalView,
        scope,
        queryParams,
        deletedNode,
        addDeletedNode,
        unsavedNodes,
        setUnsavedNodes,
        fileUsage,
        handleSetIsUnsaved,
        closedNode,
        handleClosedNode,
        isClosedNode,
        updateSortNode,
        getSortTypeById,
        sortNode,
        globalSort,
        updateGlobalSort,
        scopeValue,
        pathValue,
        getNodeByPath,
        isReadonly
      }}
    >
      {props.children}
    </FileStoreContext.Provider>
  )
}
