/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Text, Layout, Button, Icon, ButtonVariation, useConfirmationDialog } from '@harness/uicore'
import type { CellProps, Column, Renderer } from 'react-table'
import { Color } from '@harness/design-system'
import { useSourceCodeModal } from '@user-profile/modals/SourceCodeManager/useSourceCodeManager'
import { useStrings } from 'framework/strings'
import { SourceCodeManagerDTO, useDeleteSourceCodeManagers, useGetSourceCodeManagers } from 'services/cd-ng'
import { Table, useToaster } from '@common/components'
import { getIconBySCM, SourceCodeTypes } from '@user-profile/utils/utils'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'

const RenderColumnName: Renderer<CellProps<SourceCodeManagerDTO>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Horizontal
      padding={{ left: 'small' }}
      spacing="medium"
      flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
    >
      <Icon name={getIconBySCM(data.type as SourceCodeTypes)} size={25} />
      <Text color={Color.BLACK} lineClamp={1}>
        {data.name}
      </Text>
    </Layout.Horizontal>
  )
}

const RenderColumnEdit: Renderer<CellProps<SourceCodeManagerDTO>> = ({ row, column }) => {
  const sourceCodeManagerData = row.original

  const { openSourceCodeModal } = useSourceCodeModal({
    initialValues: sourceCodeManagerData,
    onSuccess: (column as any).reload
  })

  const handleEdit = (e: React.MouseEvent<Element, MouseEvent>): void => {
    e.stopPropagation()
    openSourceCodeModal()
  }

  return (
    <Button
      icon="Edit"
      data-testid={`${sourceCodeManagerData.name}-edit`}
      variation={ButtonVariation.ICON}
      onClick={handleEdit}
    />
  )
}

const RenderColumnDelete: Renderer<CellProps<SourceCodeManagerDTO>> = ({ row, column }) => {
  const data = row.original
  const { showSuccess, showError } = useToaster()
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { mutate: deleteSCM } = useDeleteSourceCodeManagers({ queryParams: { accountIdentifier: accountId } })

  const { openDialog } = useConfirmationDialog({
    contentText: `${getString('userProfile.confirmDelete', { name: data.name })}`,
    titleText: getString('userProfile.confirmDeleteTitle'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async (isConfirmed: boolean) => {
      /* istanbul ignore else */ if (isConfirmed) {
        try {
          const deleted = await deleteSCM(data.name, {
            headers: { 'content-type': 'application/json' }
          })
          /* istanbul ignore else */ if (deleted) {
            showSuccess(
              getString('userProfile.scmDeleteSuccess', {
                name: data.name
              })
            )
            ;(column as any).reload?.()
          } /* istanbul ignore next */ else {
            showError(
              getString('userProfile.scmDeleteFailure', {
                name: data.name
              })
            )
          }
        } /* istanbul ignore next */ catch (err) {
          showError(err?.data?.message || err?.message)
        }
      }
    }
  })

  const handleDelete = (e: React.MouseEvent<Element, MouseEvent>): void => {
    e.stopPropagation()
    openDialog()
  }

  return (
    <Button icon="trash" data-testid={`${data.name}-delete`} variation={ButtonVariation.ICON} onClick={handleDelete} />
  )
}

const SourceCodeManagerList: React.FC = () => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { data, loading, refetch } = useGetSourceCodeManagers({ queryParams: { accountIdentifier: accountId } })

  const { openSourceCodeModal } = useSourceCodeModal({ onSuccess: refetch })

  const columns: Column<SourceCodeManagerDTO>[] = useMemo(
    () => [
      {
        Header: '',
        id: 'name',
        accessor: 'name',
        width: '90%',
        Cell: RenderColumnName
      },
      {
        Header: '',
        id: 'edit',
        accessor: 'type',
        width: '5%',
        Cell: RenderColumnEdit,
        reload: refetch
      },
      {
        Header: '',
        id: 'delete',
        accessor: 'type',
        width: '5%',
        Cell: RenderColumnDelete,
        reload: refetch
      }
    ],
    [refetch]
  )

  const getContent = (): React.ReactElement => {
    if (data?.data?.length) {
      return <Table<SourceCodeManagerDTO> data={data.data} columns={columns} hideHeaders={true} />
    }
    if (!loading) {
      return (
        <Layout.Horizontal padding={{ top: 'large' }}>
          <Button
            text={getString('userProfile.plusSCM')}
            data-test="userProfileAddSCM"
            variation={ButtonVariation.LINK}
            onClick={openSourceCodeModal}
          />
        </Layout.Horizontal>
      )
    }
    return <></>
  }

  return (
    <Layout.Vertical spacing="large">
      <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.BLACK}>
        {getString('userProfile.mysourceCodeManagers')}
      </Text>
      {getContent()}
    </Layout.Vertical>
  )
}

export default SourceCodeManagerList
