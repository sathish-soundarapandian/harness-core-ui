/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Intent, Layout, PageSpinner, TableV2, useConfirmationDialog, useToaster } from '@harness/uicore'
import React from 'react'
import type { CellProps, Column, Renderer } from 'react-table'

import { useStrings } from 'framework/strings'

import { useDeleteCluster } from 'services/cd-ng'
import css from './EnvironmentDetails.module.scss'
import ReactTimeago from 'react-timeago'
import { defaultTo } from 'lodash-es'

const RenderColumnMenu = ({ row, column }: any): React.ReactElement => {
  const data = row.original.clusterRef
  const { getString } = useStrings()
  const toast = useToaster()
  const { mutate } = useDeleteCluster({
    queryParams: {
      accountIdentifier: column.accountId,
      orgIdentifier: column.orgIdentifier,
      projectIdentifier: column.projectIdentifier,
      environmentIdentifier: row.original.envRef
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
  const { accountId, orgIdentifier, projectIdentifier, loading, linkedClusters } = props
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
        // eslint-disable-next-line react/display-name
        Cell: RenderColumnMenu,
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
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
