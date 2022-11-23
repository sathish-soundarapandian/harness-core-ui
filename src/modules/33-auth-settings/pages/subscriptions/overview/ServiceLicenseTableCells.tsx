/* eslint-disable react/function-component-definition */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Classes, Menu, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { Color, FontVariation } from '@harness/design-system'
import { Button, Icon, Layout, Popover, Text, Container, TagsPopover, ButtonVariation } from '@harness/uicore'
import { defaultTo } from 'lodash-es'
import { useParams, Link } from 'react-router-dom'
import type { Cell, CellValue, ColumnInstance, Renderer, Row, TableInstance } from 'react-table'
import ReactTimeago from 'react-timeago'
import React, { ReactNode } from 'react'
import cx from 'classnames'
import { StoreType } from '@common/constants/GitSyncTypes'
import routes from '@common/RouteDefinitions'
import { useRunPipelineModal } from '@pipeline/components/RunPipelineModal/useRunPipelineModal'
import { StatusHeatMap } from '@pipeline/components/StatusHeatMap/StatusHeatMap'
import useDeleteConfirmationDialog from '@pipeline/pages/utils/DeleteConfirmDialog'
import { getFeaturePropsForRunPipelineButton } from '@pipeline/utils/runPipelineUtils'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import { usePermission } from '@rbac/hooks/usePermission'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import { Badge } from '@pipeline/pages/utils/Badge/Badge'
import { getReadableDateTime } from '@common/utils/dateUtils'
import type { PMSPipelineSummaryResponse, RecentExecutionInfoDTO } from 'services/pipeline-ng'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import { ExecutionStatus, ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { mapTriggerTypeToStringID } from '@pipeline/utils/triggerUtils'
import { AUTO_TRIGGERS } from '@pipeline/utils/constants'
import { killEvent } from '@common/utils/eventUtils'
import { getRouteProps } from '../PipelineListUtils'
import type { PipelineListPagePathParams } from '../types'
import type { PipelineListColumnActions } from './PipelineListTable'
import css from './PipelineListTable.module.scss'

export const LabeValue = ({ label, value }: { label: string; value: ReactNode }) => {
  return (
    <Layout.Horizontal spacing="xsmall">
      <Text color={Color.GREY_200} font={{ variation: FontVariation.SMALL_SEMI }} lineClamp={1}>
        {label}:
      </Text>
      <Text color={Color.WHITE} font={{ variation: FontVariation.SMALL }} lineClamp={1}>
        {value}
      </Text>
    </Layout.Horizontal>
  )
}

type CellTypeWithActions<D extends Record<string, any>, V = any> = TableInstance<D> & {
  column: ColumnInstance<D> & PipelineListColumnActions
  row: Row<D>
  cell: Cell<D, V>
  value: CellValue<V>
}

type CellType = Renderer<CellTypeWithActions<PMSPipelineSummaryResponse>>

export const LastModifiedCell: CellType = ({ row }) => {
  const data = row.original
  return (
    <Text color={Color.GREY_900} font={{ size: 'small' }}>
      {getReadableDateTime(data.lastUpdatedAt)}
    </Text>
  )
}
