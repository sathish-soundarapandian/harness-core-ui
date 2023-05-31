import React from 'react'
import { Page, PageError } from '@harness/uicore'
import { useHistory, useParams } from 'react-router-dom'
import Configurations from '@cv/pages/monitored-service/components/Configurations/Configurations'
import { useGetMonitoredService } from 'services/cv'
import type { Module, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import DetailsToolbar from '@cv/pages/monitored-service/views/DetailsToolbar'
import DetailsHeaderTitle from '@cv/pages/monitored-service/views/DetailsHeaderTitle'
import DetailsBreadcrumb from '@cv/pages/monitored-service/views/DetailsBreadcrumb'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { isProjectChangedOnMonitoredService } from '@cv/pages/monitored-service/MonitoredServicePage.utils'
import type { MonitoredServiceConfig } from '../../MonitoredServiceWidget.interface'
import css from './CommonMonitoredServiceDetails.module.scss'

interface CommonMonitoredServiceDetailsProps {
  config: MonitoredServiceConfig
}

export default function CommonMonitoredServiceDetails(props: CommonMonitoredServiceDetailsProps): JSX.Element {
  const { config } = props
  const { module } = config
  const { getString } = useStrings()
  const history = useHistory()
  const { orgIdentifier, projectIdentifier, accountId, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()
  const {
    data: monitoredServiceData,
    refetch,
    loading,
    error
  } = useGetMonitoredService({
    identifier,
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const { monitoredService, lastModifiedAt } = monitoredServiceData?.data ?? {}

  if (!loading && !monitoredService) {
    return <Page.NoDataCard message={getString('noData')} />
  }

  if (error) {
    if (isProjectChangedOnMonitoredService(error, identifier)) {
      history.push(
        routes.toMonitoredServices({
          projectIdentifier,
          orgIdentifier,
          accountId,
          ...(module ? { module: module as Module } : {})
        })
      )
    } else {
      return <PageError message={getErrorMessage(error)} onClick={() => refetch()} />
    }
  }

  return (
    <>
      <Page.Header
        size="large"
        // Todo - update this component
        breadcrumbs={<DetailsBreadcrumb />}
        title={<DetailsHeaderTitle loading={loading} monitoredService={monitoredService} />}
        toolbar={
          <DetailsToolbar loading={loading} monitoredService={monitoredService} lastModifiedAt={lastModifiedAt} />
        }
        className={css.header}
      />
      <Configurations config={config} />
    </>
  )
}
