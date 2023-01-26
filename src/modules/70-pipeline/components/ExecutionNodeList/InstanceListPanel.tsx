/* eslint-disable react/function-component-definition */
/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { Checkbox, DropDown, DropDownProps, ExpandingSearchInput, TableV2, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { defaultTo, get } from 'lodash-es'
import type { CellProps, Column, HeaderProps, Renderer } from 'react-table'
import type { CheckboxProps } from '@harness/uicore/dist/components/Checkbox/Checkbox'
import { useStrings } from 'framework/strings'
import type { ExecutionNode } from 'services/pipeline-ng'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { getExecutionStatusOptions } from '@pipeline/utils/PipelineExecutionFilterRequestUtils'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import { getExecutionNodeName } from '@pipeline/utils/execUtils'
import { CollapsedNodeActionType, useCollapsedNodeStore } from './CollapsedNodeStore'
import { ExecutionStatusIcon } from '../ExecutionStatusIcon/ExecutionStatusIcon'
import ExecutionStatusLabel from '../ExecutionStatusLabel/ExecutionStatusLabel'
import styles from './InstanceListPanel.module.scss'

type HeaderRenderer = Renderer<HeaderProps<ExecutionNode>>
type CellRenderer = Renderer<CellProps<ExecutionNode>>

const statusOptions = getExecutionStatusOptions()

const GlobalCheckboxHeader: HeaderRenderer = () => {
  const [{ visibilityMap }, collapsedNodeDispatch] = useCollapsedNodeStore()
  const { selectedCollapsedNodeId, pipelineExecutionDetail } = useExecutionContext()
  const nodeAdjacencyListMap = pipelineExecutionDetail?.executionGraph?.nodeAdjacencyListMap
  const childNodeIds = nodeAdjacencyListMap?.[selectedCollapsedNodeId]?.children

  const checkedCount = useMemo(() => {
    if (!Array.isArray(childNodeIds)) return 0
    return childNodeIds.filter(id => visibilityMap.get(id)).length
  }, [childNodeIds, visibilityMap])

  const checked = !!childNodeIds?.length && checkedCount === childNodeIds.length
  const indeterminate = !!childNodeIds?.length && checkedCount > 0 && checkedCount < childNodeIds.length

  const checkChildNodes = (): void => {
    if (!childNodeIds?.length) return

    collapsedNodeDispatch({
      type: CollapsedNodeActionType.custom,
      callback: prevState => {
        const _visibilityMap = new Map(prevState.visibilityMap)
        childNodeIds.forEach(id => _visibilityMap.set(id, true))
        return { ...prevState, visibilityMap: _visibilityMap }
      }
    })
  }

  const uncheckChildNodes = (): void => {
    if (!childNodeIds?.length) return

    collapsedNodeDispatch({
      type: CollapsedNodeActionType.custom,
      callback: prevState => {
        const _visibilityMap = new Map(prevState.visibilityMap)
        childNodeIds?.forEach(id => _visibilityMap.delete(id))
        return { ...prevState, visibilityMap: _visibilityMap }
      }
    })
  }

  const onChange: CheckboxProps['onChange'] = event => {
    if (event.currentTarget.checked) {
      checkChildNodes()
    } else {
      uncheckChildNodes()
    }
  }

  return <Checkbox name="globalInstancesCheckbox" checked={checked} indeterminate={indeterminate} onChange={onChange} />
}

const InstanceCheckboxCell: CellRenderer = ({ row }) => {
  const [{ visibilityMap }, collapsedNodeDispatch] = useCollapsedNodeStore()
  const nodeId = row.original.uuid
  const checked = !!(nodeId && visibilityMap.get(nodeId))

  const onChange: CheckboxProps['onChange'] = event => {
    const _checked = event.currentTarget.checked
    if (!nodeId) return

    collapsedNodeDispatch({
      type: CollapsedNodeActionType.custom,
      callback: prevState => {
        const _visibilityMap = new Map(prevState.visibilityMap)

        if (_checked) {
          _visibilityMap.set(nodeId, true)
        } else {
          _visibilityMap.delete(nodeId)
        }
        return { ...prevState, visibilityMap: _visibilityMap }
      }
    })
  }

  return <Checkbox name={`instanceCheckbox-${row.original.name}`} checked={checked} onChange={onChange} />
}

const NameAndIconCell: CellRenderer = ({ row }) => {
  const node = row.original

  return (
    <div className={styles.nameAndIconCell}>
      {node?.status && <ExecutionStatusIcon status={node.status as ExecutionStatus} size={20} />}
      <Text lineClamp={1} font={{ variation: FontVariation.SMALL_SEMI }}>
        {getExecutionNodeName(node)}
      </Text>
    </div>
  )
}

const StatusCell: CellRenderer = ({ row }) => {
  const node = row.original
  if (!node?.status) return null
  return <ExecutionStatusLabel status={node.status as ExecutionStatus} withoutIcon />
}

export function InstanceListPanel(): JSX.Element | null {
  const { getString } = useStrings()
  const { selectedCollapsedNodeId, pipelineExecutionDetail } = useExecutionContext()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  const nodeAdjacencyListMap = pipelineExecutionDetail?.executionGraph?.nodeAdjacencyListMap
  const nodeMap = pipelineExecutionDetail?.executionGraph?.nodeMap
  const node = nodeMap?.[selectedCollapsedNodeId]
  const childNodeIds: string[] = useMemo(
    () => defaultTo(get(nodeAdjacencyListMap, [selectedCollapsedNodeId, 'children']), []),
    [nodeAdjacencyListMap, selectedCollapsedNodeId]
  )

  const onStatusChange: DropDownProps['onChange'] = item => {
    setStatus(item.value as string)
  }

  const instancesHeaderText = getString('pipeline.execution.instances')
  const statusHeaderText = getString('status').toLocaleUpperCase()
  const columns: Column<ExecutionNode>[] = React.useMemo(() => {
    return [
      {
        Header: GlobalCheckboxHeader,
        Cell: InstanceCheckboxCell,
        disableSortBy: true,
        accessor: 'identifier'
      },
      {
        Header: instancesHeaderText,
        accessor: 'name',
        disableSortBy: true,
        Cell: NameAndIconCell
      },
      {
        Header: statusHeaderText,
        accessor: 'status',
        disableSortBy: true,
        Cell: StatusCell
      }
    ]
  }, [instancesHeaderText, statusHeaderText])

  const tableData = useMemo(() => {
    const searchTerm = search.trim().toLocaleLowerCase()

    return childNodeIds.reduce((acc, childNodeId) => {
      const childNode = nodeMap?.[childNodeId]
      if (!childNode) return acc

      let include = true
      if (searchTerm) {
        const nodeName = getExecutionNodeName(childNode)?.toLocaleLowerCase()

        include = include && !!nodeName?.includes(searchTerm)
      }
      if (status) {
        include = include && childNode?.status === status
      }
      include && acc.push(childNode)
      return acc
    }, [] as ExecutionNode[])
  }, [childNodeIds, nodeMap, search, status])

  if (!node || !childNodeIds.length) {
    return null
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Text
          data-testid="nodes-total-count"
          lineClamp={1}
          font={{
            size: 'normal',
            weight: 'bold'
          }}
        >
          {getString('pipeline.totalCount', { count: childNodeIds.length })}
        </Text>
        <div className={styles.end}>
          <ExpandingSearchInput name="instanceListSearch" defaultValue={search} onChange={setSearch} alwaysExpanded />
          <DropDown
            minWidth={123}
            value={status}
            onChange={onStatusChange}
            items={statusOptions}
            placeholder={getString('status')}
            addClearBtn
            usePortal
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <TableV2 className={styles.table} columns={columns} data={tableData} sortable={false} />
      </div>
    </div>
  )
}
