/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import type { CellProps, Renderer } from 'react-table'
import { Container, Layout, TableV2, NoDataCard, Heading, Utils } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { HelpPanel, HelpPanelType } from '@harness/help-panel'
import { useStrings } from 'framework/strings'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import noServiceAvailableImage from '@cv/assets/noServiceAvailable.png'
import FilterCard from '@cv/components/FilterCard/FilterCard'
import ContextMenuActions from '@cv/components/ContextMenuActions/ContextMenuActions'
import type { MonitoredServiceListItemDTO } from 'services/cv'
import {
  getMonitoredServiceFilterOptions,
  ServiceDeleteContext
} from '@cv/pages/monitored-service/CVMonitoredService/CVMonitoredService.utils'
import { getListTitle } from '@cv/pages/monitored-service/CVMonitoredService/components/MonitoredServiceListView/MonitoredServiceListView.utils'
import MonitoredServiceCategory from '@cv/pages/monitored-service/components/Configurations/components/Dependency/component/components/MonitoredServiceCategory/MonitoredServiceCategory'
import type { CommonMonitoredServiceListViewProps } from './CommonMonitoredServiceListView.types'
import ServiceName from './components/ServiceName/ServiceName'
import css from '@cv/pages/monitored-service/CVMonitoredService/CVMonitoredService.module.scss'

const CategoryProps: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => (
  <MonitoredServiceCategory type={row.original.type} abbrText verticalAlign />
)

const RenderServiceNameForProjects: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => {
  return <ServiceName row={row} />
}

const RenderServiceNameForCD: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => {
  return <ServiceName row={row} module={'cd'} />
}

const CommonMonitoredServiceListView: React.FC<CommonMonitoredServiceListViewProps> = ({
  serviceCountData,
  monitoredServiceListData,
  selectedFilter,
  onFilter,
  onEditService,
  onDeleteService,
  setPage,
  config
}) => {
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const { content, pageSize = 0, pageIndex = 0, totalPages = 0, totalItems = 0 } = monitoredServiceListData || {}

  const RenderContextMenu: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => {
    const monitoredService = row.original

    const onCopy = (): void => {
      const environmentVariables = `ET_COLLECTOR_URL: <check documentation for value>
ET_PROJECT_ID: ${projectIdentifier}
ET_ACCOUNT_ID: ${accountId}
ET_ORG_ID: ${orgIdentifier}
ET_ENV_ID: ${monitoredService.environmentRef}
ET_APPLICATION_NAME: ${monitoredService.serviceRef}
ET_DEPLOYMENT_NAME: <replace with deployment version>`
      Utils.copy(environmentVariables)
    }

    return (
      <>
        <Layout.Horizontal flex={{ alignItems: 'center' }}>
          <ContextMenuActions
            titleText={getString('common.delete', { name: monitoredService.serviceName })}
            contentText={<ServiceDeleteContext serviceName={monitoredService.serviceName} />}
            confirmButtonText={getString('yes')}
            deleteLabel={getString('cv.monitoredServices.deleteService')}
            onDelete={() => {
              onDeleteService(monitoredService.identifier as string)
            }}
            editLabel={getString('cv.monitoredServices.editService')}
            onEdit={() => {
              onEditService(monitoredService.identifier as string)
            }}
            copyLabel={getString('cv.monitoredServices.copyET')}
            onCopy={onCopy}
            RbacPermissions={{
              edit: {
                permission: PermissionIdentifier.EDIT_MONITORED_SERVICE,
                resource: {
                  resourceType: ResourceType.MONITOREDSERVICE,
                  resourceIdentifier: projectIdentifier
                }
              },
              delete: {
                permission: PermissionIdentifier.DELETE_MONITORED_SERVICE,
                resource: {
                  resourceType: ResourceType.MONITOREDSERVICE,
                  resourceIdentifier: projectIdentifier
                }
              }
            }}
          />
        </Layout.Horizontal>
      </>
    )
  }

  const filterOptions = getMonitoredServiceFilterOptions(getString, serviceCountData)

  return (
    <Container padding={{ top: 'medium', left: 'xlarge', right: 'xlarge' }} height="inherit">
      <HelpPanel referenceId="monitoredServiceDetails" type={HelpPanelType.FLOATING_CONTAINER} />
      <FilterCard
        data={filterOptions}
        cardClassName={css.filterCard}
        selected={filterOptions.find(card => card.type === selectedFilter)}
        onChange={item => onFilter(item.type)}
      />
      {content?.length ? (
        <>
          <Heading
            level={2}
            font={{ variation: FontVariation.H6 }}
            color={Color.GREY_800}
            padding={{ top: 'large', bottom: 'large' }}
          >
            {getListTitle(getString, selectedFilter, totalItems)}
          </Heading>
          <TableV2
            sortable={true}
            columns={[
              {
                Header: ' ',
                width: '2.5%',
                Cell: CategoryProps
              },

              {
                Header: getString('name'),
                width: '13.5%',
                Cell: config?.module === 'cd' ? RenderServiceNameForCD : RenderServiceNameForProjects
              },
              {
                id: 'contextMenu',
                width: '2%',
                Cell: RenderContextMenu
              }
            ]}
            data={content}
            pagination={{
              pageSize,
              pageIndex,
              pageCount: totalPages,
              itemCount: totalItems,
              gotoPage: nextPage => {
                setPage(nextPage)
              }
            }}
          />
        </>
      ) : content && !content.length ? (
        <NoDataCard
          image={noServiceAvailableImage}
          message={getString('cv.monitoredServices.youHaveNoMonitoredServices')}
          imageClassName={css.noServiceAvailableImage}
          containerClassName={css.noDataContainer}
        />
      ) : null}
    </Container>
  )
}

export default CommonMonitoredServiceListView
