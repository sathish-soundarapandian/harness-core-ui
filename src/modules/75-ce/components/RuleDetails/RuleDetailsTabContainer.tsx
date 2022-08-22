/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { isEmpty, defaultTo, get } from 'lodash-es'
import {
  Accordion,
  Color,
  Container,
  FontVariation,
  Icon,
  IconName,
  Layout,
  Table,
  Text,
  TextProps,
  Toggle,
  useToaster
} from '@harness/uicore'
import { useParams } from 'react-router-dom'
import type { Column } from 'react-table'
import { AccessPoint, Opts, Resource, Service, ServiceDep, useRouteDetails, useSaveService } from 'services/lw'
import { useStrings } from 'framework/strings'
import { InstanceStatusIndicatorV2 } from '@ce/common/InstanceStatusIndicator/InstanceStatusIndicator'
import { Utils } from '@ce/common/Utils'
import CopyButton from '@ce/common/CopyButton'
import { allProviders, ceConnectorTypes, GatewayKindType } from '@ce/constants'
import { ConnectorInfoDTO, useGetConnector } from 'services/cd-ng'
import { useBooleanStatus } from '@common/hooks'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import FixedScheduleAccordion from '../COGatewayList/components/FixedScheduleAccordion/FixedScheduleAccordion'
import css from './RuleDetailsBody.module.scss'

interface RuleDetailsTabContainerProps {
  service: Service
  healthStatus: string
  refetchHealthStatus: () => void
  connectorData?: ConnectorInfoDTO
  accessPointData?: AccessPoint
  resources?: Resource[]
  dependencies?: ServiceDep[]
  setService: (data?: Service) => void
}

interface DetailRowProps {
  label: string
  value: string | React.ReactNode
}

interface AdvancedConfigurationRowProps {
  service: Service
  dependencies?: ServiceDep[]
  setService: (data?: Service) => void
}

interface DisplayConnectorProps {
  service: Service
  connectorName: string
  iconName?: IconName
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => {
  return (
    <Container className={css.detailRow}>
      <Text font={{ variation: FontVariation.BODY2 }}>{label}</Text>
      {typeof value === 'string' ? <Text font={{ variation: FontVariation.BODY }}>{value}</Text> : value}
    </Container>
  )
}

const LinkWithCopy: React.FC<{ url: string; protocol: string }> = ({ url, protocol = 'http' }) => {
  const completeUrl = `${protocol}://${url}`
  return (
    <Layout.Horizontal>
      <Text
        lineClamp={1}
        className={css.link}
        onClick={() => {
          window.open(completeUrl, '_blank')
        }}
      >
        {url}
      </Text>
      <CopyButton
        className={css.copyBtn}
        textToCopy={completeUrl}
        iconProps={{ size: 14, color: Color.PRIMARY_7 }}
        small
      />
    </Layout.Horizontal>
  )
}

const ManagedVms: React.FC<{ resources: Resource[] }> = ({ resources }) => {
  const { getString } = useStrings()
  const { state, toggle } = useBooleanStatus()

  const getTableText = (/* istanbul ignore next */ str = '', props?: TextProps) => (
    <Text font={{ variation: FontVariation.SMALL }} lineClamp={1} {...props}>
      {str}
    </Text>
  )

  return (
    <Layout.Vertical>
      <Layout.Horizontal spacing={'medium'} flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
        <Text>{resources.length}</Text>
        {resources.length && (
          <Container>
            <Text
              rightIcon={state ? 'main-chevron-up' : 'main-chevron-down'}
              rightIconProps={{ color: Color.PRIMARY_7, size: 14 }}
              color={Color.PRIMARY_7}
              onClick={toggle}
            >
              {state ? getString('ce.common.collapse') : getString('ce.common.expand')}
            </Text>
          </Container>
        )}
      </Layout.Horizontal>
      {state && (
        <Container className={css.vmsTableContainer}>
          <Table<Resource>
            className={css.vmsTable}
            data={resources}
            bpTableProps={{ bordered: true, condensed: true, striped: false }}
            columns={[
              {
                accessor: 'name',
                Header: getTableText(getString('ce.co.ruleDetails.detailsTab.managedVmTableHeaders.name'), {
                  font: { variation: FontVariation.SMALL_BOLD }
                }),
                width: '25%',
                Cell: ({ row }) => (
                  <Layout.Vertical>
                    {getTableText(row.original.name, { font: { variation: FontVariation.SMALL_SEMI } })}
                    {getTableText(row.original.id, { color: Color.GREY_400 })}
                  </Layout.Vertical>
                )
              },
              {
                accessor: 'ipv4',
                Header: getTableText(getString('ce.co.ruleDetails.detailsTab.managedVmTableHeaders.ip'), {
                  font: { variation: FontVariation.SMALL_BOLD }
                }),
                width: '25%',
                Cell: ({ row }) => (
                  <Layout.Vertical>
                    {getTableText(get(row.original, 'ipv4.0'), { font: { variation: FontVariation.SMALL_SEMI } })}
                    {getTableText(get(row.original, 'private_ipv4.0'), { color: Color.GREY_400 })}
                  </Layout.Vertical>
                )
              },
              {
                accessor: 'type',
                Header: getTableText(getString('ce.nodeRecommendation.instanceFam'), {
                  font: { variation: FontVariation.SMALL_BOLD }
                }),
                width: '25%',
                Cell: ({ row }) => (
                  <Layout.Vertical>
                    {getTableText(row.original.type, { font: { variation: FontVariation.SMALL_SEMI } })}
                  </Layout.Vertical>
                )
              },
              {
                accessor: 'tags',
                Header: getTableText(getString('tagsLabel'), { font: { variation: FontVariation.SMALL_BOLD } }),
                width: '25%',
                Cell: ({ row }) => (
                  <Layout.Vertical>
                    {row.original.tags &&
                      Object.entries(row.original.tags).map(([key, value]) => {
                        return getTableText(`${key}: ${value}`)
                      })}
                  </Layout.Vertical>
                )
              }
            ]}
          />
        </Container>
      )}
    </Layout.Vertical>
  )
}

const DisplayConnector: React.FC<DisplayConnectorProps> = ({ service, iconName, connectorName }) => {
  const { accountId } = useParams<AccountPathProps>()
  const isK8sRule = service.kind === GatewayKindType.KUBERNETES

  const { data: connectorData, loading } = useGetConnector({
    identifier: get(service, 'routing.k8s.ConnectorID', ''),
    queryParams: { accountIdentifier: accountId },
    lazy: !isK8sRule
  })
  const k8sConnector = get(connectorData, 'data.connector', {})

  return (
    <Layout.Horizontal spacing={'small'}>
      <Text icon={iconName} iconProps={{ size: 22 }}>
        {defaultTo(connectorName, '')}
      </Text>
      {!isEmpty(k8sConnector) && !loading && (
        <>
          <Text>{' / '}</Text>
          <Text icon={'app-kubernetes'} iconProps={{ size: 22 }}>
            {defaultTo(k8sConnector.name, '')}
          </Text>
        </>
      )}
    </Layout.Horizontal>
  )
}

const RuleDetailsTabContainer: React.FC<RuleDetailsTabContainerProps> = ({
  service,
  healthStatus,
  refetchHealthStatus,
  connectorData,
  accessPointData,
  resources,
  dependencies,
  setService
}) => {
  const { getString } = useStrings()

  const domainProtocol = useMemo(() => {
    const hasHttpsConfig = !isEmpty(
      service.routing?.ports?.find(portConfig => portConfig.protocol?.toLowerCase() === 'https')
    )
    return Utils.getConditionalResult(hasHttpsConfig, 'https', 'http')
  }, [service.routing?.ports])

  const cloudProvider = connectorData?.type && ceConnectorTypes[connectorData?.type]
  const provider = useMemo(() => allProviders.find(item => item.value === cloudProvider), [cloudProvider])
  const iconName = defaultTo(provider?.icon, 'spinner') as IconName

  return (
    <Container>
      {!service ? (
        /* istanbul ignore next */ <Icon name="spinner" />
      ) : (
        <>
          <Layout.Vertical spacing={'medium'} className={css.tabRowContainer}>
            <Text font={{ variation: FontVariation.H5 }}>{getString('ce.co.gatewayReview.gatewayDetails')}</Text>
            <DetailRow label={getString('ce.co.ruleDetails.detailsTab.label.ruleId')} value={`${service.id}`} />
            <DetailRow label={getString('ce.co.ruleDetailsHeader.idleTime')} value={`${service.idle_time_mins} min`} />
            {/* AWS Details - EC2 */}
            <DetailRow
              label={getString('ce.co.gatewayReview.instanceType')}
              value={
                service.fulfilment === 'ondemand'
                  ? getString('ce.nodeRecommendation.onDemand')
                  : /* istanbul ignore next */ getString('ce.nodeRecommendation.spot')
              }
            />
            <DetailRow
              label={getString('ce.co.ruleDetailsHeader.hostName')}
              value={<LinkWithCopy url={defaultTo(service.host_name, '')} protocol={domainProtocol} />}
            />
            <DetailRow
              label={getString('connector')}
              value={
                <DisplayConnector
                  service={service}
                  connectorName={get(connectorData, 'name', '')}
                  iconName={iconName}
                />
              }
            />
            <DetailRow label={getString('ce.co.accessPoint.loadbalancer')} value={get(accessPointData, 'name', '')} />
            <DetailRow
              label={getString('ce.co.ruleDetails.detailsTab.label.vmsManaged')}
              value={<ManagedVms resources={defaultTo(resources, [])} />}
            />
            {/* AWS Details end */}
            <DetailRow
              label={getString('ce.co.rulesTableHeaders.status')}
              value={
                <InstanceStatusIndicatorV2
                  status={healthStatus}
                  disabled={service.disabled}
                  refetchStatus={refetchHealthStatus}
                />
              }
            />
          </Layout.Vertical>
          <AdvancedConfigurationRow service={service} dependencies={dependencies} setService={setService} />
        </>
      )}
    </Container>
  )
}

const DependenciesAccordion: React.FC<{ data?: ServiceDep[] }> = ({ data = [] }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const columns: Column<ServiceDep>[] = useMemo(
    () => [
      {
        accessor: 'dep_id',
        Header: getString('ce.co.ruleDetails.detailsTab.label.dependantRule'),
        width: '50%',
        Cell: ({ row }) => {
          const { data: ruleData, loading } = useRouteDetails({
            account_id: accountId,
            rule_id: Number(row.original.dep_id)
          })
          return loading ? <Icon name="spinner" size={20} /> : <Text>{get(ruleData, 'response.service.name', '')}</Text>
        }
      },
      {
        accessor: 'delay_secs',
        Header: getString('ce.co.ruleDetails.detailsTab.label.delayInSec'),
        width: '50%',
        Cell: ({ row }) => {
          return <Text>{row.original.delay_secs}</Text>
        }
      }
    ],
    [data]
  )
  return (
    <Accordion className={css.dependenciesAccordion}>
      <Accordion.Panel
        id="deps"
        summary={`${data.length} ${getString('ce.co.autoStoppingRule.configuration.step4.tabs.deps.title')}`}
        details={
          <Table<ServiceDep>
            data={data}
            bpTableProps={{ bordered: true, condensed: true, striped: false }}
            columns={columns}
          />
        }
      />
    </Accordion>
  )
}

const AdvancedConfigurationRow: React.FC<AdvancedConfigurationRowProps> = ({ service, dependencies, setService }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { showError, showSuccess } = useToaster()

  const { state: hideProgressPage, toggle: toggleHideProgressPage } = useBooleanStatus(
    get(service, 'opts.hide_progress_page')
  )
  const { state: dryRunMode, toggle: toggleDryRunMode } = useBooleanStatus(get(service, 'opts.dry_run'))

  const { mutate: saveService } = useSaveService({
    account_id: accountId,
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const handleSaveService = async (opts: Opts) => {
    try {
      const { response } = await saveService({
        service: { ...service, opts: { ...service.opts, ...opts } },
        deps: dependencies
      })
      showSuccess(getString('ce.co.ruleDetails.successfulResponse'))
      setService(response)
    } catch (err) /* istanbul ignore next */ {
      showError(err.data?.errors?.join('\n') || err.data?.message)
      if ('dry_run' in opts) {
        toggleDryRunMode()
      }
      if ('hide_progress_page' in opts) {
        toggleHideProgressPage()
      }
    }
  }

  const handleHideProgressPageToggle = () => {
    handleSaveService({ hide_progress_page: !hideProgressPage })
    toggleHideProgressPage()
  }

  const handleDryRunModeToggle = () => {
    handleSaveService({ dry_run: !dryRunMode })
    toggleDryRunMode()
  }

  return (
    <Layout.Vertical spacing={'medium'} margin={{ top: 'xlarge' }} className={css.tabRowContainer}>
      <Text font={{ variation: FontVariation.H5 }}>
        {getString('ce.co.autoStoppingRule.configuration.step4.advancedConfiguration')}
      </Text>
      <Toggle
        checked={hideProgressPage}
        disabled={service.disabled}
        label={getString('ce.co.autoStoppingRule.review.hideProgressPage')}
        onToggle={handleHideProgressPageToggle}
        data-testid={'progressPageViewToggle'}
        className={css.toggleInput}
      />
      <Toggle
        checked={dryRunMode}
        disabled={service.disabled}
        label={getString('ce.co.dryRunLabel')}
        onToggle={handleDryRunModeToggle}
        data-testid={'dryRunToggle'}
        className={css.toggleInput}
      />
      {!isEmpty(dependencies) && <DependenciesAccordion data={dependencies} />}
      <FixedScheduleAccordion service={service} />
    </Layout.Vertical>
  )
}

export default RuleDetailsTabContainer
