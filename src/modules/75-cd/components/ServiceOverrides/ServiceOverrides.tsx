/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'

import { Container, HarnessDocTooltip, Heading, Page, Tabs } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { HelpPanel, HelpPanelType } from '@harness/help-panel'

import { useStrings } from 'framework/strings'

import type {
  ModulePathParams,
  ProjectPathProps,
  ServiceOverridesQueryParams
} from '@common/interfaces/RouteInterfaces'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'

import { ServiceOverridesTab } from './ServiceOverridesUtils'

import GlobalEnvironmentOverrides from './GlobalEnvironmentOverrides'
import EnvironmentServiceSpecificOverrides from './EnvironmentServiceSpecificOverrides'
import GlobalInfrastructureOverrides from './GlobalInfrastructureOverrides'
import InfrastructureServiceSpecificOverrides from './InfrastructureServiceSpecificOverrides'

import css from './ServiceOverrides.module.scss'

export default function ServiceOverrides(): React.ReactElement {
  const { module } = useParams<ProjectPathProps & ModulePathParams>()
  const { getString } = useStrings()
  const { sectionId } = useQueryParams<ServiceOverridesQueryParams>()
  const [selectedTabId, setSelectedTabId] = useState(defaultTo(sectionId, ServiceOverridesTab.ENVIRONMENT_GLOBAL))

  const { updateQueryParams } = useUpdateQueryParams<ServiceOverridesQueryParams>()

  const handleTabChange = (tabId: ServiceOverridesTab): void => {
    updateQueryParams({
      sectionId: ServiceOverridesTab[ServiceOverridesTab[tabId]]
    })
    setSelectedTabId(tabId)
  }

  return (
    <>
      <HelpPanel referenceId="serviceOverrides" type={HelpPanelType.FLOATING_CONTAINER} />
      <main className={css.layout}>
        <Page.Header
          title={
            <Heading level={3} font={{ variation: FontVariation.H4 }} data-tooltip-id={'serviceOverrides'}>
              {getString('common.overrides')}
              <HarnessDocTooltip tooltipId={'serviceOverrides'} useStandAlone />
            </Heading>
          }
          breadcrumbs={<NGBreadcrumbs customPathParams={{ module }} />}
          className={css.header}
        />

        <Page.Body>
          <Container className={css.serviceOverrideTabs}>
            <Tabs
              id="serviceOverrides"
              onChange={handleTabChange}
              selectedTabId={selectedTabId}
              data-tabId={selectedTabId}
              tabList={[
                {
                  id: ServiceOverridesTab.ENVIRONMENT_GLOBAL,
                  title: getString('common.serviceOverrides.globalEnvironment'),
                  panel: <GlobalEnvironmentOverrides />
                },
                {
                  id: ServiceOverridesTab.ENVIRONMENT_SERVICE_SPECIFIC,
                  title: getString('common.serviceOverrides.environmentServiceSpecific'),
                  panel: <EnvironmentServiceSpecificOverrides />
                },
                {
                  id: ServiceOverridesTab.INFRA_GLOBAL,
                  title: getString('common.serviceOverrides.globalInfra'),
                  panel: <GlobalInfrastructureOverrides />
                },
                {
                  id: ServiceOverridesTab.INFRA_SERVICE_SPECIFIC,
                  title: getString('common.serviceOverrides.infrastructureServiceSpecific'),
                  panel: <InfrastructureServiceSpecificOverrides />
                }
              ]}
            />
          </Container>
        </Page.Body>
      </main>
    </>
  )
}
