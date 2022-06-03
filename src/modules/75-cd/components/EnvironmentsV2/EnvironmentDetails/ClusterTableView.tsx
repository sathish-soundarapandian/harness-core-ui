/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Intent, Layout, PageSpinner, TableV2, useConfirmationDialog, useToaster } from '@harness/uicore'
import React from 'react'
import { useParams } from 'react-router-dom'
import type { CellProps, Column, Renderer } from 'react-table'
import ReactTimeago from 'react-timeago'
import { defaultTo } from 'lodash-es'

import { useStrings } from 'framework/strings'

import { useDeleteCluster } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import css from './EnvironmentDetails.module.scss'

const RenderColumnMenu = ({ row, column }: any): React.ReactElement => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const data = row.original.clusterRef
  const { getString } = useStrings()
  const toast = useToaster()
  const { mutate } = useDeleteCluster({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      environmentIdentifier: row.original.envRef
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })

  const { openDialog } = useConfirmationDialog({
    contentText: 'Are you sure you want to unlink the cluster',
    titleText: 'Unlink cluster',
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: async didConfirm => {
      if (didConfirm) {
        try {
          const deleted = await mutate(data)
          if (deleted) {
            toast.showSuccess('Deleted Succesfully')
            column.refetch?.()
          }
        } catch (err) {
          if (err) {
            toast.showError(err?.data?.message || err?.message)
          }
        }
      }
    }
  })

  return (
    <>
      <Button
        icon="trash"
        minimal
        onClick={() => {
          openDialog()
        }}
      />
    </>
  )
}

const RenderLastUpdatedBy: Renderer<CellProps<any>> = ({ row }): JSX.Element => {
  const rowdata = row.original
  return (
    <Layout.Vertical spacing={'small'}>
      <ReactTimeago date={defaultTo(rowdata.linkedAt, 0)} />
    </Layout.Vertical>
  )
}

const ClusterTableView = (props: any): React.ReactElement => {
  const { loading, linkedClusters } = props
  const columns: Array<Column<any>> = React.useMemo(
    () => [
      {
        Header: 'Clusters',
        id: 'clusterRef',
        accessor: 'clusterRef',
        width: '75%'
      },
      {
        Header: 'Last Updated At',
        id: 'linkedAt',
        accessor: 'linkedAt',
        width: '15%',
        Cell: RenderLastUpdatedBy
      },
      {
        id: 'menuBtn',
        width: '5%',
        disableSortBy: true,
        Cell: RenderColumnMenu,
        environmentIdentifier: props?.envRef,
        refetch: props?.refetch
      }
    ],
    []
  )

  if (loading) {
    return <PageSpinner />
  }

  if (linkedClusters?.data?.content.length) {
    return (
      <TableV2
        columns={columns}
        data={linkedClusters?.data?.content}
        sortable
        rowDataTestID={() => {
          return `clusterDataRow`
        }}
        className={css.clusterDataTable}
      />
    )
  }
  return <div>No Linked Clusters Available</div>
}

export default ClusterTableView
