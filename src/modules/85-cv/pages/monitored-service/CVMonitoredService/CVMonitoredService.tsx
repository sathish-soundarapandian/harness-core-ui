/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useRef, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import {
  Page,
  ButtonVariation,
  Layout,
  Select,
  GridListToggle,
  Views,
  SelectOption,
  Heading,
  HarnessDocTooltip,
  ExpandingSearchInput,
  Container
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useGetMonitoredServiceListEnvironments, useGetCountOfServices } from 'services/cv'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import routes from '@common/RouteDefinitions'
import { useQueryParams } from '@common/hooks'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import RbacButton from '@rbac/components/Button/Button'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { TemplateUsage } from '@templates-library/utils/templatesUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useTemplateSelector } from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'
import { getCVMonitoringServicesSearchParam, getErrorMessage, getEnvironmentOptions } from '@cv/utils/CommonUtils'
import ServiceDependencyGraph from '@cv/pages/monitored-service/CVMonitoredService/components/MonitoredServiceGraphView/MonitoredServiceGraphView'
import type { MonitoredServiceConfig } from '@cv/components/MonitoredServiceListWidget/MonitoredServiceListWidget.types'
import { getEnvironmentIdentifier, getPathNameOnCreateMonitoredService } from './CVMonitoredService.utils'
import { FilterTypes } from './CVMonitoredService.types'
import MonitoredServiceList from './components/MonitoredServiceListView/MonitoredServiceList'
import css from './CVMonitoredService.module.scss'

interface MonitoredServiceProps {
  config?: MonitoredServiceConfig
}

const MonitoredService = (props: MonitoredServiceProps) => {
  const { config } = props
  const { getString } = useStrings()

  useDocumentTitle([getString('cv.srmTitle'), getString('cv.monitoredServices.title')])

  const history = useHistory()
  const { view } = useQueryParams<{ view?: Views.GRID }>()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const pathParams = {
    accountId,
    orgIdentifier,
    projectIdentifier
  }
  const { CVNG_TEMPLATE_MONITORED_SERVICE } = useFeatureFlags()

  const [page, setPage] = useState(0)
  const [selectedView, setSelectedView] = useState<Views>(view === Views.GRID ? Views.GRID : Views.LIST)
  const [environment, setEnvironment] = useState<SelectOption>()
  const [search, setSearch] = useState<string>('')
  const [selectedFilter, setSelectedFilter] = useState<FilterTypes>(FilterTypes.ALL)

  const projectRef = useRef(projectIdentifier)

  useEffect(() => {
    setPage(0)
  }, [search])

  const { data: environmentDataList, loading: loadingEnvironments } = useGetMonitoredServiceListEnvironments({
    queryParams: pathParams
  })

  const {
    data: serviceCountData,
    loading: serviceCountLoading,
    error: serviceCountError,
    refetch: refetchServiceCountData
  } = useGetCountOfServices({
    queryParams: {
      ...pathParams,
      environmentIdentifier: getEnvironmentIdentifier(environment),
      filter: search
    },
    lazy: true
  })

  useEffect(() => {
    if (projectRef.current !== projectIdentifier) {
      projectRef.current = projectIdentifier
      setPage(0)
      setSearch('')
      setEnvironment({ label: getString('all'), value: getString('all') })
      setSelectedFilter(FilterTypes.ALL)
    }
  }, [projectIdentifier])

  useEffect(() => {
    /* istanbul ignore else */ if (serviceCountData) {
      refetchServiceCountData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedView])

  const onFilter = (type: FilterTypes): void => {
    /* istanbul ignore else */ if (type !== selectedFilter) {
      setPage(0)
      setSelectedFilter(type)
    }
  }

  const { getTemplate } = useTemplateSelector()

  const onUseTemplate = async () => {
    const { template } = await getTemplate({ templateType: 'MonitoredService', allowedUsages: [TemplateUsage.USE] })
    const { identifier, versionLabel, templateScope } = template
    const templateRefData = {
      identifier,
      accountId: accountId,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      versionLabel,
      templateScope
    }
    history.push({
      pathname: routes.toCVMonitoringServicesInputSets(pathParams),
      search: getCVMonitoringServicesSearchParam({
        view: selectedView,
        templateRef: JSON.stringify(templateRefData)
      })
    })
  }

  const createButton = (hasMonitoredServices: boolean, configData?: MonitoredServiceConfig): JSX.Element => {
    const pathname = getPathNameOnCreateMonitoredService(pathParams, configData)
    {
      const LayoutOrientation = hasMonitoredServices ? Layout.Horizontal : Layout.Vertical
      return (
        <LayoutOrientation spacing="large">
          <RbacButton
            variation={ButtonVariation.PRIMARY}
            icon="plus"
            text={getString('common.newMonitoredService')}
            onClick={() => {
              history.push({
                pathname,
                search: getCVMonitoringServicesSearchParam({ view: selectedView })
              })
            }}
            permission={{
              permission: PermissionIdentifier.EDIT_MONITORED_SERVICE,
              resource: {
                resourceType: ResourceType.MONITOREDSERVICE,
                resourceIdentifier: projectIdentifier
              }
            }}
          />
          {hasMonitoredServices && CVNG_TEMPLATE_MONITORED_SERVICE && !config && (
            <RbacButton
              text={getString('common.useTemplate')}
              variation={ButtonVariation.SECONDARY}
              icon="template-library"
              onClick={onUseTemplate}
              featuresProps={{
                featuresRequest: {
                  featureNames: [FeatureIdentifier.TEMPLATE_SERVICE]
                }
              }}
            />
          )}
        </LayoutOrientation>
      )
    }
  }

  return (
    <>
      <Page.Header
        breadcrumbs={<NGBreadcrumbs />}
        title={
          <Heading level={3} font={{ variation: FontVariation.H4 }}>
            {getString('cv.monitoredServices.title')}
            <HarnessDocTooltip tooltipId={'monitoredServicesTitle'} useStandAlone />
          </Heading>
        }
      />
      <Page.Header
        title={createButton(Boolean(serviceCountData?.allServicesCount), config)}
        toolbar={
          <Layout.Horizontal spacing="medium">
            <Container data-name="monitoredServiceSeachContainer">
              <ExpandingSearchInput
                width={250}
                alwaysExpanded
                throttle={500}
                key={search}
                defaultValue={search}
                onChange={setSearch}
                placeholder={getString('cv.monitoredServices.searchMonitoredServices')}
              />
            </Container>
            <Select
              value={{
                label: `${getString('environment')}: ${defaultTo(environment?.label, getString('all'))}`,
                value: defaultTo(environment?.value, getString('all'))
              }}
              defaultSelectedItem={{ label: getString('all'), value: getString('all') }}
              items={getEnvironmentOptions({
                environmentList: environmentDataList,
                loading: loadingEnvironments,
                getString,
                returnAll: true
              })}
              onChange={item => {
                setPage(0)
                setEnvironment(item)
              }}
              className={css.filterSelect}
            />
            {!config ? (
              <GridListToggle
                initialSelectedView={selectedView}
                onViewToggle={setSelectedView}
                icons={{ left: 'graph' }}
              />
            ) : null}
          </Layout.Horizontal>
        }
      />

      {selectedView === Views.LIST ? (
        <MonitoredServiceList
          page={page}
          search={search}
          setPage={setPage}
          environmentIdentifier={getEnvironmentIdentifier(environment)}
          createButton={createButton(Boolean(!serviceCountData?.allServicesCount), config)}
          selectedFilter={selectedFilter}
          onFilter={onFilter}
          serviceCountData={serviceCountData}
          serviceCountLoading={serviceCountLoading}
          serviceCountErrorMessage={getErrorMessage(serviceCountError)}
          refetchServiceCountData={refetchServiceCountData}
          config={config}
        />
      ) : (
        <ServiceDependencyGraph
          isPageView
          search={search}
          serviceCountData={serviceCountData}
          selectedFilter={selectedFilter}
          onFilter={onFilter}
          refetchServiceCountData={refetchServiceCountData}
          serviceCountLoading={serviceCountLoading}
          createButton={createButton(Boolean(!serviceCountData?.allServicesCount), config)}
          environmentIdentifier={getEnvironmentIdentifier(environment)}
          serviceCountErrorMessage={getErrorMessage(serviceCountError)}
        />
      )}
    </>
  )
}

export default MonitoredService
