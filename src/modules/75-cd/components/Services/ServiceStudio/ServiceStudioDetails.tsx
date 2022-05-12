/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Tabs, Tab, Button, ButtonVariation, Layout } from '@harness/uicore'
import { isEmpty } from 'lodash-es'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { useStrings } from 'framework/strings'
import ServiceDetailsSummary from '@cd/components/ServiceDetails/ServiceDetailsContent/ServiceDetailsSummary'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import EntitySetupUsage from '@common/pages/entityUsage/EntityUsage'
import { useGetServiceV2 } from 'services/cd-ng'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import ServiceConfiguration from './ServiceConfiguration/ServiceConfiguration'
import { ServiceTabs } from '../utils/ServiceUtils'
import css from '@cd/components/ServiceDetails/ServiceDetailsContent/ServicesDetailsContent.module.scss'

function ServiceStudioDetails({ serviceData }: any): React.ReactElement | null {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, serviceId } = useParams<ProjectPathProps & ServicePathProps>()
  const { tab } = useQueryParams<{ tab: string }>()
  const { updateQueryParams } = useUpdateQueryParams()
  const {
    state: { isUpdated }
  } = usePipelineContext()
  const [selectedTabId, setSelectedTabId] = useState(tab ?? ServiceTabs.SUMMARY)

  const { NG_SVC_ENV_REDESIGN } = useFeatureFlags()
  const handleTabChange = useCallback(
    (nextTab: ServiceTabs): void => {
      setSelectedTabId(nextTab)
      updateQueryParams({ tab: nextTab })
    },
    [updateQueryParams]
  )

  const { data: serviceResponse } = useGetServiceV2({
    serviceIdentifier: serviceId,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  if (isEmpty(serviceResponse?.data)) {
    return null
  }

  if (NG_SVC_ENV_REDESIGN) {
    return (
      <Container padding={{ left: 'xlarge', right: 'xlarge' }} className={css.tabsContainer}>
        <Tabs id="serviceDetailsTab" selectedTabId={selectedTabId} onChange={handleTabChange}>
          <Tab id={ServiceTabs.SUMMARY} title={getString('summary')} panel={<ServiceDetailsSummary />} />

          <Tab
            id={ServiceTabs.Configuration}
            title={getString('configuration')}
            panel={<ServiceConfiguration serviceData={serviceData} />}
          />

          <Tab
            id={ServiceTabs.REFERENCED_BY}
            title={getString('refrencedBy')}
            panel={<EntitySetupUsage entityType={'Service'} entityIdentifier={serviceId} />}
          />
          <Tab id={ServiceTabs.ActivityLog} title={getString('activityLog')} panel={<></>} />
        </Tabs>
        <Layout.Horizontal className={css.btnContainer}>
          <Button
            disabled={!isUpdated}
            // onClick={() => {
            //   updatePipelineView({ ...pipelineView, isYamlEditable: false })
            //   fetchPipeline({ forceFetch: true, forceUpdate: true })
            // }}
            className={css.discardBtn}
            variation={ButtonVariation.SECONDARY}
            text={getString('pipeline.discard')}
          />
        </Layout.Horizontal>
      </Container>
    )
  }

  return (
    <Container padding={{ left: 'xlarge', right: 'xlarge' }} className={css.tabsContainer}>
      <Tabs id="serviceDetailsTab" selectedTabId={selectedTabId} onChange={handleTabChange}>
        <Tab id={ServiceTabs.SUMMARY} title={getString('summary')} panel={<ServiceDetailsSummary />} />
        <Tab
          id={ServiceTabs.REFERENCED_BY}
          title={getString('refrencedBy')}
          panel={<EntitySetupUsage entityType={'Service'} entityIdentifier={serviceId} />}
        />
      </Tabs>
    </Container>
  )
}

export default ServiceStudioDetails
