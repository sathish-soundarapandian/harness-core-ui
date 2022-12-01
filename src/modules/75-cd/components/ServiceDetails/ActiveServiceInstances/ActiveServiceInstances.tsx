/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import { Card, Layout, Tab, Tabs } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { ActiveServiceInstancesHeader } from '@cd/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstancesHeader'
import {
  GetEnvArtifactDetailsByServiceIdQueryParams,
  GetEnvBuildInstanceCountQueryParams,
  NGServiceConfig,
  useGetEnvArtifactDetailsByServiceId,
  useGetEnvBuildInstanceCount
} from 'services/cd-ng'
import { yamlParse } from '@common/utils/YamlHelperMethods'
import { useServiceContext } from '@cd/context/ServiceContext'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { ActiveServiceInstancesContent } from './ActiveServiceInstancesContent'
import { Deployments } from '../DeploymentView/DeploymentView'
import css from '@cd/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstances.module.scss'

export enum ServiceDetailTabs {
  ACTIVE = 'Active Service Instances',
  DEPLOYMENT = 'Deployments'
}

export const ActiveServiceInstances: React.FC = () => {
  const { getString } = useStrings()
  const { serviceResponse } = useServiceContext()
  const serviceDataParse = React.useMemo(
    () => yamlParse<NGServiceConfig>(defaultTo(serviceResponse?.yaml, '')),
    [serviceResponse?.yaml]
  )
  const gitopsEnabled = serviceDataParse?.service?.gitOpsEnabled

  const { accountId, orgIdentifier, projectIdentifier, serviceId } = useParams<ProjectPathProps & ServicePathProps>()
  const queryParams: GetEnvBuildInstanceCountQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    serviceId
  }

  const {
    loading: activeInstanceLoading,
    data: activeInstanceData,
    error: activeInstanceError,
    refetch: activeInstanceRefetch
  } = useGetEnvBuildInstanceCount({ queryParams })

  const queryParamsDeployments: GetEnvArtifactDetailsByServiceIdQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    serviceId
  }

  const { data: deploymentData } = useGetEnvArtifactDetailsByServiceId({
    queryParams: queryParamsDeployments
  })

  const isDeploymentTab = (): boolean => {
    return Boolean(
      activeInstanceData &&
        deploymentData &&
        !gitopsEnabled &&
        !(activeInstanceData?.data?.envBuildIdAndInstanceCountInfoList || []).length &&
        (deploymentData?.data?.environmentInfoByServiceId || []).length
    )
  }

  const [defaultTab, setDefaultTab] = useState(ServiceDetailTabs.ACTIVE)

  useEffect(() => {
    if (isDeploymentTab()) {
      setDefaultTab(ServiceDetailTabs.DEPLOYMENT)
    } else {
      setDefaultTab(ServiceDetailTabs.ACTIVE)
    }
  }, [deploymentData, activeInstanceData])

  const handleTabChange = (data: string): void => {
    setDefaultTab(data as ServiceDetailTabs)
  }

  return (
    <Card className={css.activeServiceInstances}>
      <Layout.Vertical className={css.tabsStyle}>
        <Tabs id="ServiceDetailTabs" selectedTabId={defaultTab} onChange={handleTabChange}>
          <Tab
            id={ServiceDetailTabs.ACTIVE}
            title={getString('cd.serviceDashboard.runningServiceInstancesLabel')}
            panel={
              <>
                <ActiveServiceInstancesHeader />
                <ActiveServiceInstancesContent
                  loading={activeInstanceLoading}
                  data={activeInstanceData?.data?.envBuildIdAndInstanceCountInfoList}
                  error={activeInstanceError}
                  refetch={activeInstanceRefetch}
                />
              </>
            }
          />
          {gitopsEnabled ? (
            <></>
          ) : (
            <Tab
              id={ServiceDetailTabs.DEPLOYMENT}
              title={getString('cd.serviceDashboard.recentDeployments')}
              panel={<Deployments />}
            />
          )}
        </Tabs>
      </Layout.Vertical>
    </Card>
  )
}
