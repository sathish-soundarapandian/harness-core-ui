import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { Text } from '@harness/uicore'
import routes from '@common/RouteDefinitions'
import type { MonitoredServiceConfig } from '@cv/interfaces/MonitoredService'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { useAppStore } from 'framework/AppStore/AppStoreContext'

interface MonitoredServiceListProps {
  config: MonitoredServiceConfig
}

export default function MonitoredServiceList(props: MonitoredServiceListProps): JSX.Element {
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
      <Link to={routes.toMonitoredServicesConfigurations(projectDetailsParams)}>
        <Text>{'Project level MonitoredServiceList'}</Text>
      </Link>
    )
  } else {
    return (
      <Link to={routes.toMonitoredServicesConfigurations({ ...projectDetailsParams, module: 'cd' })}>
        <Text>{'Deployments level MonitoredServiceList'}</Text>
      </Link>
    )
  }
}
