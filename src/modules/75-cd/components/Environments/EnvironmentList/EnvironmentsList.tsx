/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import cx from 'classnames'
import { Pagination, Layout, Text, Container, Heading, TableV2 } from '@harness/uicore'
import { defaultTo } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { Column } from 'react-table'
import { useModalHook } from '@harness/use-modal'
import { Dialog } from '@blueprintjs/core'
import { useEntityDeleteErrorHandlerDialog } from '@common/hooks/EntityDeleteErrorHandlerDialog/useEntityDeleteErrorHandlerDialog'
import { useEnvironmentStore, ParamsType } from '@cd/components/Environments/common'
import { EnvironmentResponseDTO, useDeleteEnvironmentV2, useGetEnvironmentList } from 'services/cd-ng'
import { useToaster } from '@common/exports'
import RbacButton from '@rbac/components/Button/Button'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useStrings } from 'framework/strings'
import { NewEditEnvironmentModal } from '@cd/components/PipelineSteps/DeployEnvStep/DeployEnvStep'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import EnvironmentListingPageTemplate from './EnvironmentListingPageTemplate'
import {
  EnvironmentDescription,
  EnvironmentMenu,
  EnvironmentName,
  EnvironmentTypes
} from '../EnvironmentsListColumns/EnvironmentsListColumns'
import EnvironmentTabs from '../EnvironmentTabs'
import EmptyContent from './EmptyContent.svg'
import css from './EnvironmentsList.module.scss'

export const EnvironmentList: React.FC<{ isForceDeleteEnabled: boolean }> = ({ isForceDeleteEnabled }) => {
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ParamsType>()
  const { showError, showSuccess } = useToaster()
  const [page, setPage] = useState(0)
  const { fetchDeploymentList } = useEnvironmentStore()
  const [rowData, setRowData] = React.useState<EnvironmentResponseDTO>()
  const [editable, setEditable] = React.useState(false)
  const [environmentToDelete, setEnvironmentToDelete] = useState<EnvironmentResponseDTO>({})

  const queryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    page: page,
    size: 10
  }

  const {
    data: envData,
    loading,
    error,
    refetch
  } = useGetEnvironmentList({
    queryParams
  })
  const { mutate: deleteEnvironment } = useDeleteEnvironmentV2({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    }
  })

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        canEscapeKeyClose
        canOutsideClickClose
        onClose={
          /* istanbul ignore next*/ () => {
            hideModal()
            setEditable(false)
          }
        }
        title={editable ? getString('editEnvironment') : getString('cd.addEnvironment')}
        isCloseButtonShown
        className={cx('padded-dialog', css.dialogStylesEnv)}
      >
        <Container>
          <NewEditEnvironmentModal
            data={
              rowData && editable
                ? {
                    name: rowData.name,
                    identifier: rowData.identifier,
                    orgIdentifier,
                    projectIdentifier,
                    description: rowData.description,
                    tags: rowData.tags,
                    type: rowData.type
                  }
                : { name: '', identifier: '', orgIdentifier, projectIdentifier }
            }
            isEdit={editable}
            isEnvironment={!editable}
            onCreateOrUpdate={() => {
              ;(fetchDeploymentList.current as () => void)?.()
              hideModal()
              setEditable(false)
            }}
            closeModal={() => {
              hideModal()
              setEditable(false)
            }}
          />
        </Container>
      </Dialog>
    ),
    [fetchDeploymentList, orgIdentifier, projectIdentifier, rowData, editable]
  )
  const environments = envData?.data?.content?.map(environmentContent => environmentContent.environment)
  const hasEnvs = Boolean(!loading && envData?.data?.content?.length)
  const emptyEnvs = Boolean(!loading && envData?.data?.content?.length === 0)

  const handleEnvEdit = (id: string): void => {
    const dataRow = environments?.find(temp => {
      return temp?.identifier === id
    })
    setEditable(true)
    setRowData(dataRow)
    showModal()
  }

  const redirectToReferencedBy = (): void => {
    closeDialog()
  }

  const { openDialog: openReferenceErrorDialog, closeDialog } = useEntityDeleteErrorHandlerDialog({
    entity: {
      type: ResourceType.ENVIRONMENT,
      name: environmentToDelete.name as string
    },
    redirectToReferencedBy,
    hideReferencedByButton: true,
    forceDeleteCallback: () => handleEnvDelete(environmentToDelete as Required<EnvironmentResponseDTO>, true)
  })

  const handleEnvDelete = async (
    environment: Required<EnvironmentResponseDTO>,
    forceDelete?: boolean
  ): Promise<void> => {
    try {
      await deleteEnvironment(environment.identifier, {
        headers: { 'content-type': 'application/json' },
        queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier, forceDelete }
      })
      showSuccess(getString('cd.environment.deleted', { identifier: environment.identifier }))
      refetch()
    } catch (e: any) {
      if (isForceDeleteEnabled && e?.data?.code === 'ENTITY_REFERENCE_EXCEPTION') {
        setEnvironmentToDelete(environment)
        openReferenceErrorDialog()
      } else {
        showError(getRBACErrorMessage(e))
      }
    }
  }

  type CustomColumn<T extends Record<string, any>> = Column<T>

  const envColumns: CustomColumn<EnvironmentResponseDTO>[] = useMemo(
    () => [
      {
        Header: getString('environment').toUpperCase(),
        id: 'name',
        width: '40%',
        accessor: 'name',
        Cell: EnvironmentName
      },
      {
        Header: 'Description',
        id: 'description',
        accessor: 'description',
        width: '35%',
        Cell: EnvironmentDescription
      },
      {
        Header: getString('typeLabel').toUpperCase(),
        id: 'type',
        accessor: 'type',
        width: '15%',
        Cell: EnvironmentTypes
      },
      {
        id: 'modifiedBy',
        width: '10%',
        Cell: EnvironmentMenu,
        actions: {
          onEdit: handleEnvEdit,
          onDelete: handleEnvDelete
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getString, handleEnvDelete]
  )

  useEffect(() => {
    fetchDeploymentList.current = refetch
  }, [fetchDeploymentList, refetch])
  return (
    <>
      <EnvironmentListingPageTemplate
        title={getString('environments')}
        titleTooltipId="ff_env_heading"
        toolbar={
          <Layout.Horizontal flex={{ distribution: 'space-between' }}>
            <Layout.Horizontal>
              <RbacButton
                intent="primary"
                data-testid="add-environment"
                icon="plus"
                iconProps={{ size: 10 }}
                text={getString('newEnvironment')}
                permission={{
                  permission: PermissionIdentifier.EDIT_ENVIRONMENT,
                  resource: {
                    resourceType: ResourceType.ENVIRONMENT
                  }
                }}
                onClick={() => {
                  showModal()
                }}
              />
            </Layout.Horizontal>
          </Layout.Horizontal>
        }
        headerToolbar={<EnvironmentTabs />}
        pagination={
          <Pagination
            itemCount={envData?.data?.totalItems || 0}
            pageSize={envData?.data?.pageSize || 0}
            pageCount={envData?.data?.totalPages || 0}
            pageIndex={page}
            gotoPage={index => {
              setPage(index)
            }}
          />
        }
        error={error}
        retryOnError={refetch}
        loading={loading}
      >
        {hasEnvs && (
          <Container padding={{ top: 'medium', right: 'xlarge', left: 'xlarge' }}>
            <TableV2<EnvironmentResponseDTO>
              columns={envColumns}
              data={(environments as EnvironmentResponseDTO[]) || []}
              onRowClick={(row: EnvironmentResponseDTO) => {
                handleEnvEdit(defaultTo(row.identifier, ''))
              }}
            />
          </Container>
        )}
        {emptyEnvs && (
          <Container flex={{ align: 'center-center' }} height="100%">
            <Container flex style={{ flexDirection: 'column' }}>
              <img src={EmptyContent} width={220} height={220} />
              <Heading className={css.noEnvHeading} level={2}>
                {getString('cd.noEnvironment.title')}
              </Heading>
              <Text className={css.noEnvText}>{getString('cd.noEnvironment.message')}</Text>
            </Container>
          </Container>
        )}
      </EnvironmentListingPageTemplate>
    </>
  )
}
