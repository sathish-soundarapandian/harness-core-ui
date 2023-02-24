/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import type { Column, Renderer, CellProps, UseExpandedRowProps } from 'react-table'
import ReactTimeago from 'react-timeago'
import { Classes, Position, Menu, Intent } from '@blueprintjs/core'

import type {
  StreamingDestinationDto,
  StreamingDestinationResponse,
  StreamingDestinationAggregateListResponseResponse,
  StreamingDestinationCards,
  StreamingDestinationAggregateDto,
  StreamingDetails,
  AwsS3StreamingDestinationSpecDto
} from '@harnessio/react-audit-service-client'
import { deleteDisabledStreamingDestination, updateStreamingDestination } from '@harnessio/react-audit-service-client'
import {
  TableV2,
  Text,
  Toggle,
  Button,
  ButtonVariation,
  Layout,
  Popover,
  useConfirmationDialog,
  useToaster,
  Icon,
  Container
} from '@harness/uicore'
import { Color } from '@harness/design-system'

import { killEvent } from '@common/utils/eventUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import AuditLogStreamingCards from '@audit-trail/components/AuditLogStreamingCards/AuditLogStreamingCards'
import AuditLogStreamingError from '@audit-trail/components/AuditLogStreamingError/AuditLogStreamingError'
import {
  mapAuditServiceConnectorToCDNGConnectorInfoDTO,
  StreamingDestinationSpecDTOTypeMap
} from '@audit-trail/interfaces/LogStreamingInterface'
import { getIconByType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { buildUpdateSDPayload } from '@audit-trail/utils/RequestUtil'
import { useStrings, UseStringsReturn } from 'framework/strings'
import AuditTrailFactory from 'framework/AuditTrail/AuditTrailFactory'
import { CONNECTOR_TYPE } from '@audit-trail/components/CreateStreamingDestination/StepStreamingConnector/StepStreamingConnector'
import type { UseCreateStreamingDestinationModalReturn } from '@audit-trail/modals/StreamingDestinationModal/useCreateStreamingDestinationModal'

import type { ConnectorInfoDTO } from 'services/cd-ng'
import type { ResourceDTO } from 'services/audit'
import css from './AuditLogStreaming.module.scss'

interface AuditLogStreamingListViewProps {
  data?: StreamingDestinationAggregateListResponseResponse
  cardsData?: StreamingDestinationCards
  refetchListingPageAPIs?: () => void
  openStreamingDestinationModal: UseCreateStreamingDestinationModalReturn['openStreamingDestinationModal']
}

const RenderColumnStatus: Renderer<CellProps<StreamingDestinationResponse>> = ({ value, row, column }) => {
  const streamingDestination = row.original.streaming_destination
  const { showSuccess, showError } = useToaster()
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [canEdit] = usePermission(
    {
      resourceScope: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      resource: {
        resourceType: ResourceType.STREAMING_DESTINATION,
        resourceIdentifier: streamingDestination.identifier
      },
      permissions: [PermissionIdentifier.CREATE_OR_EDIT_STREAMING_DESTINATION],
      options: {
        skipCache: true
      }
    },
    [projectIdentifier, orgIdentifier, accountId, streamingDestination.identifier]
  )

  const onStatusToggle = async (checked: boolean): Promise<void> => {
    const payload = buildUpdateSDPayload(streamingDestination, { status: checked ? 'ACTIVE' : 'INACTIVE' })
    if (streamingDestination.identifier) {
      try {
        const response = await updateStreamingDestination(payload)
        const { streaming_destination: updatedStreamingDestination } = response
        if (updatedStreamingDestination.identifier && updatedStreamingDestination.name) {
          showSuccess(
            getString('auditTrail.logStreaming.streamingDestinationSaved', { name: updatedStreamingDestination.name })
          )
          ;(column as any).refetchListingPageAPIs()
        }
      } catch (err) {
        showError(defaultTo(err?.data?.message, err?.message))
      }
    }
  }

  return (
    <Toggle
      data-testid="toggleStatus"
      checked={value === 'ACTIVE'}
      onToggle={onStatusToggle}
      label={value}
      disabled={!canEdit}
    />
  )
}

const renderColumnName: Renderer<CellProps<StreamingDestinationDto>> = ({ value }) => {
  return (
    <Layout.Horizontal padding={{ right: 'xlarge' }}>
      <Text lineClamp={1} margin={{ bottom: 'small' }}>
        {value}
      </Text>
    </Layout.Horizontal>
  )
}

const RenderColumnConnector: Renderer<CellProps<StreamingDestinationAggregateDto>> = ({ row }) => {
  const { accountId } = useParams<ProjectPathProps>()
  const streamingDestinationAggregateDto = row.original
  const sdType = streamingDestinationAggregateDto.streaming_destination.spec.type
  const iconName = getIconByType(CONNECTOR_TYPE[sdType] as ConnectorInfoDTO['type'])
  const connector = mapAuditServiceConnectorToCDNGConnectorInfoDTO(
    streamingDestinationAggregateDto.connector_info,
    CONNECTOR_TYPE[streamingDestinationAggregateDto.streaming_destination.spec?.type]
  )
  const connectorHandler = AuditTrailFactory.getResourceHandler('CONNECTOR')
  let url
  if (accountId && connector) {
    url = connectorHandler?.resourceUrl?.(connector as unknown as ResourceDTO, {
      accountIdentifier: accountId
    })
  }
  return (
    <Layout.Horizontal className={css.alignCenter} padding={{ right: 'xlarge' }}>
      <Icon name={iconName} size={25} margin={{ right: 'small' }}></Icon>
      {url ? (
        <Link className={css.resourceLink} to={url} target="_blank" rel="noopener noreferer">
          <Text lineClamp={1} margin={{ bottom: 'small' }}>
            {defaultTo(connector?.name, connector?.identifier)}
          </Text>
        </Link>
      ) : (
        <Text lineClamp={1} margin={{ bottom: 'small' }}>
          {defaultTo(connector?.name, connector?.identifier)}
        </Text>
      )}
    </Layout.Horizontal>
  )
}

const RenderColumnLastStreamed: Renderer<CellProps<StreamingDetails>> = ({ value }) => {
  const hasStreamed = value
  const isStatusFailed = value?.status === 'FAILED'
  const { getString } = useStrings()

  return hasStreamed ? (
    <Text color={isStatusFailed ? Color.RED_600 : Color.GREY_600} className={css.alignCenter}>
      <Icon name={isStatusFailed ? 'danger-icon' : 'success-tick'} size={25} margin={{ right: 'small' }} />
      <ReactTimeago date={value.last_streamed_at} live />
    </Text>
  ) : (
    <Text color={Color.GREY_600} className={css.alignCenter}>
      {getString('auditTrail.logStreaming.notStreamedYet')}
    </Text>
  )
}

const RenderColumnMenu: Renderer<CellProps<StreamingDestinationAggregateDto>> = ({ row, column }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const streamingDestination = row.original.streaming_destination

  const { openDialog: openDeleteDialog } = useConfirmationDialog({
    contentText: getString('auditTrail.logStreaming.deleteSDDialogContent', { name: streamingDestination.name }),
    titleText: getString('auditTrail.logStreaming.deleteSDDialogTitle'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: async didConfirm => {
      if (didConfirm && streamingDestination.identifier) {
        try {
          await deleteDisabledStreamingDestination({
            'streaming-destination': streamingDestination.identifier
          })
          showSuccess(getString('auditTrail.logStreaming.deleteSuccessful', { name: streamingDestination.name }))
          ;(column as any).refetchListingPageAPIs()
        } catch (err) {
          showError(
            defaultTo(
              err?.message,
              getString('auditTrail.logStreaming.errorWhileDeleting', { name: streamingDestination.name })
            )
          )
        }
      }
    }
  })

  const handleEdit = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.stopPropagation()
    setMenuOpen(false)
    if (!streamingDestination.identifier) {
      return
    }
    ;(column as any).openStreamingDestinationModal(true, undefined, row.original)
  }

  const handleDelete = async (): Promise<void> => {
    openDeleteDialog()
  }

  const editPermission = {
    resourceScope: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    resource: {
      resourceType: ResourceType.STREAMING_DESTINATION,
      resourceIdentifier: streamingDestination.identifier
    },
    permission: PermissionIdentifier.CREATE_OR_EDIT_STREAMING_DESTINATION
  }
  const deletePermission = {
    resourceScope: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    resource: {
      resourceType: ResourceType.STREAMING_DESTINATION,
      resourceIdentifier: streamingDestination.identifier
    },
    permission: PermissionIdentifier.DELETE_STREAMING_DESTINATION
  }

  return (
    <Layout.Horizontal flex={{ justifyContent: 'flex-end' }}>
      <Popover
        isOpen={menuOpen}
        onInteraction={nextOpenState => {
          setMenuOpen(nextOpenState)
        }}
        className={Classes.DARK}
        position={Position.BOTTOM_RIGHT}
      >
        <Button
          minimal
          icon="Options"
          withoutBoxShadow
          data-testid={`menu-${streamingDestination.identifier}`}
          onClick={e => {
            e.stopPropagation()
            setMenuOpen(true)
          }}
        />
        <Menu>
          <RbacMenuItem icon="edit" text={getString('edit')} onClick={handleEdit} permission={editPermission} />
          <RbacMenuItem
            icon="trash"
            text={getString('delete')}
            onClick={e => {
              e.stopPropagation()
              setMenuOpen(false)
              handleDelete()
            }}
            disabled={
              // Delete button to be disabled for ACTIVE Streaming Destinations
              streamingDestination.status === 'ACTIVE'
            }
            permission={deletePermission}
          />
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}

const ToggleAccordionCell: Renderer<{
  row: UseExpandedRowProps<CellProps<StreamingDetails>>
  value: StreamingDetails
}> = ({ row }) => {
  return (
    <Layout.Horizontal onClick={killEvent}>
      <Button
        data-testid="row-expand-btn"
        {...row.getToggleRowExpandedProps()}
        color={Color.GREY_600}
        icon={row.isExpanded ? 'chevron-down' : 'chevron-right'}
        variation={ButtonVariation.ICON}
        iconProps={{ size: 19 }}
        className={css.toggleAccordion}
      />
    </Layout.Horizontal>
  )
}

const renderAWSS3Fields = (
  getString: UseStringsReturn['getString'],
  streamingDestinationAggregateDto: StreamingDestinationAggregateDto
): JSX.Element => {
  const bucketName = (streamingDestinationAggregateDto.streaming_destination.spec as AwsS3StreamingDestinationSpecDto)
    .bucket
  return (
    <Layout.Horizontal>
      <Text font={{ weight: 'bold' }}>{getString('common.bucketName')}:</Text>
      &nbsp;
      <Text>{bucketName}</Text>
    </Layout.Horizontal>
  )
}

const getRowSubComponentFields = (
  getString: UseStringsReturn['getString'],
  streamingDestinationAggregateDto: StreamingDestinationAggregateDto
) => {
  const type = defaultTo(streamingDestinationAggregateDto.streaming_destination.spec.type, '')
  switch (type) {
    case StreamingDestinationSpecDTOTypeMap.AWS_S3: {
      return { fields: renderAWSS3Fields(getString, streamingDestinationAggregateDto) }
    }

    default:
      return { fields: <></> }
  }
}

const AuditLogStreamingListView: React.FC<AuditLogStreamingListViewProps> = ({
  data,
  cardsData,
  refetchListingPageAPIs,
  openStreamingDestinationModal
}) => {
  const { getString } = useStrings()

  const renderRowSubComponent = React.useCallback(({ row }) => {
    const streamingDestinationAggregateDto: StreamingDestinationAggregateDto = row.original
    const errorMessage = streamingDestinationAggregateDto.streaming_details?.error_message

    const { fields: fieldsByType } = getRowSubComponentFields(getString, streamingDestinationAggregateDto)
    return (
      <>
        <div className={css.rowSubComponent} data-testid="rowSubComponent">
          <Layout.Vertical spacing={'large'}>
            <Container>{fieldsByType}</Container>
            {errorMessage ? (
              <Container style={{ display: 'flex' }}>
                <AuditLogStreamingError errorMessage={errorMessage} />
              </Container>
            ) : null}
          </Layout.Vertical>
        </div>
      </>
    )
  }, [])

  const columns: (Column<StreamingDestinationAggregateDto> & {
    refetchListingPageAPIs?: () => void
    openStreamingDestinationModal?: UseCreateStreamingDestinationModalReturn['openStreamingDestinationModal']
  })[] = useMemo(
    () => [
      {
        Header: '',
        id: 'rowSelectOrExpander',
        accessor: row => row.streaming_details,
        width: '5%',
        Cell: ToggleAccordionCell
      },
      {
        Header: getString('status'),
        id: 'status',
        accessor: row => row.streaming_destination.status,
        width: '15%',
        Cell: RenderColumnStatus,
        refetchListingPageAPIs
      },
      {
        Header: getString('auditTrail.logStreaming.destinationName'),
        id: 'name',
        accessor: row => row.streaming_destination.name,
        width: '25%',
        Cell: renderColumnName
      },
      {
        Header: getString('auditTrail.logStreaming.streamingConnector'),
        id: 'connectorRef',
        accessor: row => row.connector_info.name,
        width: '25%',
        Cell: RenderColumnConnector
      },
      {
        Header: getString('auditTrail.logStreaming.lastStreamed'),
        id: 'lastStreamed',
        accessor: row => row.streaming_details,
        width: '25%',
        Cell: RenderColumnLastStreamed
      },
      {
        Header: '',
        id: 'menu',
        accessor: row => row.streaming_destination.identifier,
        width: '5%',
        Cell: RenderColumnMenu,
        refetchListingPageAPIs,
        openStreamingDestinationModal
      }
    ],
    [refetchListingPageAPIs, openStreamingDestinationModal, getString]
  )

  return (
    <>
      <AuditLogStreamingCards className={css.paddingCards} cardsData={cardsData} />
      <TableV2<StreamingDestinationAggregateDto>
        className={css.paddingTable}
        data={data || []}
        columns={columns}
        renderRowSubComponent={renderRowSubComponent}
      />
    </>
  )
}

export default AuditLogStreamingListView
