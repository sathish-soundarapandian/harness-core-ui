/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Intent, PageSpinner, TableV2, useConfirmationDialog, useToaster } from '@harness/uicore'
import React from 'react'
import { useParams } from 'react-router-dom'
import type { Column } from 'react-table'

import { useStrings } from 'framework/strings'

import { useDeleteCluster, useGetClusterList } from 'services/cd-ng'
import css from './EnvironmentDetails.module.scss'

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

const ClusterTableView = (props: any): React.ReactElement => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    orgIdentifier: string
    projectIdentifier: string
    accountId: string
  }>()

  const { data, loading } = useGetClusterList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier: props?.envRef
    }
  })

  const columns: Array<Column<any>> = React.useMemo(
    () => [
      {
        Header: 'Clusters',
        id: 'clusterRef',
        accessor: 'clusterRef',
        width: '90%'
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
        environmentIdentifier: props?.envRef
      }
    ],
    []
  )

  if (loading) {
    return <PageSpinner />
  }
  if (data && data?.data && data?.data?.content?.length) {
    return <div> No Clusters Linked</div>
  }

  return (
    <TableV2
      columns={columns}
      data={data?.data?.content || []}
      sortable
      rowDataTestID={() => {
        return `clusterDataRow`
      }}
      className={css.clusterDataTable}
    />
  )
}

export default ClusterTableView
