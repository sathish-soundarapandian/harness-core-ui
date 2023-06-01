/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { CellProps, Renderer } from 'react-table'
import { Container, Text, Layout, TableV2, NoDataCard, Heading, Utils, TagsPopover, Button } from '@harness/uicore'
import { Classes } from '@blueprintjs/core'
import { FontVariation, Color } from '@harness/design-system'
import { isEmpty } from 'lodash-es'
import { HelpPanel, HelpPanelType } from '@harness/help-panel'
import { useStrings } from 'framework/strings'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { usePermission } from '@rbac/hooks/usePermission'
import ToggleOnOff from '@cv/pages/monitored-service/CVMonitoredService/components/ToggleOnOff/ToggleOnOff'
import noServiceAvailableImage from '@cv/assets/noServiceAvailable.png'
import FilterCard from '@cv/components/FilterCard/FilterCard'
import ContextMenuActions from '@cv/components/ContextMenuActions/ContextMenuActions'
import type { MonitoredServiceListItemDTO } from 'services/cv'
import { EnvironmentToolTipDisplay } from '@cv/components/HarnessServiceAndEnvironment/components/EnvironmentToolTipDisplay'
import { useFeature } from '@common/hooks/useFeatures'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { ModuleName } from 'framework/types/ModuleName'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'
import { FeatureWarningTooltip } from '@common/components/FeatureWarning/FeatureWarningWithTooltip'
import { numberFormatter } from '@common/utils/utils'
import IconGrid from '../IconGrid/IconGrid'
import {
  calculateTotalChangePercentage,
  RenderHealthTrend,
  RenderHealthScore,
  ServiceDeleteContext,
  getMonitoredServiceFilterOptions
} from '../../CVMonitoredService.utils'
import type { MonitoredServiceListViewProps } from '../../CVMonitoredService.types'
import MonitoredServiceCategory from '../../../components/Configurations/components/Dependency/component/components/MonitoredServiceCategory/MonitoredServiceCategory'
import { getChangeSummaryInfo, getIsSwitchEnabled, getListTitle } from './MonitoredServiceListView.utils'
import SLOsIconGrid from '../SLOsIconGrid/SLOsIconGrid'
import css from '../../CVMonitoredService.module.scss'

const CategoryProps: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => (
  <MonitoredServiceCategory type={row.original.type} abbrText verticalAlign />
)

const RenderServiceName: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { identifier, serviceName, tags = {}, environmentRefList, type, environmentRef } = row.original || {}

  const envRefList = environmentRefList

  return (
    <Layout.Vertical>
      <Layout.Horizontal spacing="small" flex={{ alignItems: 'flex-start', justifyContent: 'start' }}>
        <Link
          to={routes.toCVAddMonitoringServicesEdit({
            accountId,
            orgIdentifier,
            projectIdentifier,
            identifier,
            module: 'cv'
          })}
          className={css.monitoredServiceLink}
        >
          <Text
            color={Color.PRIMARY_7}
            className={css.monitoredServiceName}
            title={serviceName}
            font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}
            tooltip={serviceName}
          >
            {serviceName}
          </Text>
        </Link>
        {!isEmpty(tags) ? (
          <TagsPopover
            tags={tags}
            iconProps={{ size: 12, color: Color.GREY_600 }}
            popoverProps={{ className: Classes.DARK }}
            className={css.tags}
          />
        ) : null}
      </Layout.Horizontal>
      <Link
        to={routes.toCVAddMonitoringServicesEdit({
          accountId,
          projectIdentifier,
          orgIdentifier,
          identifier,
          module: 'cv'
        })}
      >
        <EnvironmentToolTipDisplay
          type={type}
          color={Color.PRIMARY_7}
          font={{ align: 'left', size: 'xsmall' }}
          envRefList={envRefList}
          environmentRef={environmentRef}
        />
      </Link>
    </Layout.Vertical>
  )
}

const RenderServiceChanges: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => {
  const { getString } = useStrings()
  const monitoredService = row.original

  if (!monitoredService.changeSummary?.categoryCountMap) {
    return <></>
  }

  const { categoryCountMap, total } = monitoredService.changeSummary
  const { color, percentage, icon } = calculateTotalChangePercentage(total)
  const styles = {
    font: { variation: FontVariation.H6 },
    color: Color.BLACK
  }
  const totalPercentage = numberFormatter(Math.abs(percentage), {
    truncate: false
  })
  const percentageText = Math.abs(percentage) > 100 ? `100+ %` : `${totalPercentage}%`

  return (
    <Layout.Horizontal spacing="medium" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      {Object.entries(categoryCountMap).map(([changeCategory, categoryCountDetails]) => (
        <Text key={changeCategory} {...getChangeSummaryInfo(getString, changeCategory)} {...styles}>
          {categoryCountDetails.count ?? 0}
        </Text>
      ))}
      <Text
        icon={icon}
        color={color}
        font={{ variation: FontVariation.TINY_SEMI }}
        iconProps={{ size: 10, color: color }}
      >
        {percentageText}
      </Text>
    </Layout.Horizontal>
  )
}

const RenderDependenciesHealth: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => {
  const monitoredService = row.original

  if (monitoredService.dependentHealthScore?.length) {
    return (
      <IconGrid
        iconProps={{ name: 'polygon', size: 14, padding: { right: 'xsmall' } }}
        items={monitoredService.dependentHealthScore}
        width={100}
      />
    )
  }

  return null
}

const RenderSLOErrorBudgetData: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => {
  const monitoredService = row.original

  if (monitoredService.sloHealthIndicators?.length) {
    return (
      <SLOsIconGrid
        iconProps={{ name: 'symbol-square', size: 14, padding: { right: 'xsmall' } }}
        items={monitoredService.sloHealthIndicators}
        width={100}
      />
    )
  }

  return <></>
}

const MonitoredServiceListView: React.FC<MonitoredServiceListViewProps> = ({
  serviceCountData,
  monitoredServiceListData,
  selectedFilter,
  onFilter,
  onEditService,
  onDeleteService,
  onToggleService,
  healthMonitoringFlagLoading,
  setPage
}) => {
  const { getString } = useStrings()

  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()

  const { content, pageSize = 0, pageIndex = 0, totalPages = 0, totalItems = 0 } = monitoredServiceListData || {}

  const { enabled: srmServicesFeatureEnabled } = useFeature({
    featureRequest: {
      featureName: FeatureIdentifier.SRM_SERVICES
    }
  })

  const { licenseInformation } = useLicenseStore()

  const isSRMLicensePresentAndActive = licenseInformation[ModuleName.CV]?.status === 'ACTIVE'

  const { CVNG_ENABLED: isSRMEnabled, CVNG_LICENSE_ENFORCEMENT: isSRMEnforcementLicenseEnabled } = useFeatureFlags()

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

  const RenderStatusToggle: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => {
    const monitoredService = row.original

    const [canToggle] = usePermission(
      {
        resource: {
          resourceType: ResourceType.MONITOREDSERVICE,
          resourceIdentifier: projectIdentifier
        },
        permissions: [PermissionIdentifier.TOGGLE_MONITORED_SERVICE]
      },
      [projectIdentifier]
    )

    const canDisableMonitoredServiceToggle = !getIsSwitchEnabled({
      isSRMLicensePresentAndActive,
      isSRMEnforcementLicenseEnabled,
      srmServicesFeatureEnabled,
      serviceMonitoringEnabled: monitoredService?.serviceMonitoringEnabled,
      isSRMEnabled
    })

    const getTooltip = (): ReactElement | undefined => {
      if (!canToggle) {
        return (
          <RBACTooltip
            permission={PermissionIdentifier.TOGGLE_MONITORED_SERVICE}
            resourceType={ResourceType.MONITOREDSERVICE}
          />
        )
      } else if (canDisableMonitoredServiceToggle) {
        return (
          <FeatureWarningTooltip
            featureName={FeatureIdentifier.SRM_SERVICES}
            warningMessage={getString('cv.monitoredServices.listToggleSwitchDisableMessage')}
          />
        )
      }
    }

    return (
      <>
        <Layout.Horizontal flex={{ alignItems: 'center' }}>
          <Button
            noStyling
            tooltip={getTooltip()}
            className={css.toggleFlagButton}
            disabled={canDisableMonitoredServiceToggle || !canToggle}
          >
            <ToggleOnOff
              disabled={canDisableMonitoredServiceToggle || !canToggle}
              checked={Boolean(monitoredService.healthMonitoringEnabled)}
              loading={healthMonitoringFlagLoading}
              onChange={checked => {
                onToggleService(monitoredService.identifier as string, checked)
              }}
            />
          </Button>
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
                Header: getString('enabledLabel'),
                width: '6%',
                Cell: RenderStatusToggle
              },
              {
                Header: getString('name'),
                width: '13%',
                Cell: RenderServiceName
              },
              {
                Header: getString('cv.monitoredServices.sloErrorBudget'),
                width: '11%',
                Cell: RenderSLOErrorBudgetData
              },
              {
                Header: getString('cv.monitoredServices.table.changes'),
                width: '22.5%',
                Cell: RenderServiceChanges
              },
              {
                Header: getString('cv.monitoredServices.table.lastestHealthTrend'),
                width: '15%',
                Cell: RenderHealthTrend
              },
              {
                Header: getString('cv.monitoredServices.table.serviceHealthScore'),
                width: '13%',
                Cell: RenderHealthScore
              },
              {
                Header: getString('cv.monitoredServices.dependenciesHealth'),
                width: '15%',
                Cell: RenderDependenciesHealth
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

export default MonitoredServiceListView
