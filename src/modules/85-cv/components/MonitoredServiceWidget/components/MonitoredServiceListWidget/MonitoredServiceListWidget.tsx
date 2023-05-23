import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { Text } from '@harness/uicore'
import routes from '@common/RouteDefinitions'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { MonitoredServiceConfig } from '../../MonitoredServiceWidget.interface'

interface MonitoredServiceListWidgetProps {
  config: MonitoredServiceConfig
}

export default function MonitoredServiceListWidget(props: MonitoredServiceListWidgetProps): JSX.Element {
  const { config } = props
  const params = useParams<PipelinePathProps>()
  const { selectedProject } = useAppStore()

  const projectDetailsParams = {
    accountId: params.accountId,
    projectIdentifier: selectedProject?.identifier ? selectedProject.identifier : '',
    orgIdentifier: selectedProject?.orgIdentifier ? selectedProject.orgIdentifier : ''
  }

  if (config?.listing?.changeSource) {
    return (
      <Link to={routes.toMonitoredServicesConfigurations({ ...projectDetailsParams, identifier: 'CD_prod' })}>
        <Text>{'Project level MonitoredServiceListWidget'}</Text>
      </Link>
    )
  } else {
    return (
      <Link
        to={routes.toMonitoredServicesConfigurations({ ...projectDetailsParams, module: 'cd', identifier: 'CD_prod' })}
      >
        <Text>{'Deployments level MonitoredServiceListWidget'}</Text>
      </Link>
    )
  }
}
