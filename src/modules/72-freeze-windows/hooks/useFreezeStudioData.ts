/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { debounce, defaultTo, isEmpty } from 'lodash-es'
import type { SelectOption } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import {
  useGetEnvironmentListV2,
  useGetOrganizationAggregateDTOList,
  useGetProjectList,
  useGetServiceList
} from 'services/cd-ng'
import type { ResourcesInterface, ProjctsByOrgId } from '@freeze-windows/types';
import { FreezeWindowLevels } from '@freeze-windows/types'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { FreezeWindowContext } from '@freeze-windows/context/FreezeWindowContext'
import {
  allEnvironmentsObj,
  allOrgsObj,
  allPipelinesObj,
  allProjectsObj,
  allServicesObj
} from '@freeze-windows/utils/FreezeWindowStudioUtil'
import { useMutateAsGet } from '@common/hooks'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useGetPipelineList } from 'services/pipeline-ng'

export const useFreezeStudioData = (): ResourcesInterface => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { freezeWindowLevel } = React.useContext(FreezeWindowContext)
  const { getString } = useStrings()
  const { CDS_OrgAccountLevelServiceEnvEnvGroup } = useFeatureFlags()

  const {
    loading: loadingOrgs,
    data: orgsData,
    refetch: refetchOrgs
  } = useGetOrganizationAggregateDTOList({
    queryParams: { accountIdentifier: accountId, pageSize: 200 },
    lazy: true
  })

  const { data: serviceData, loading: loadingServices } = useGetServiceList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      size: 200,
      includeAllServicesAccessibleAtScope: CDS_OrgAccountLevelServiceEnvEnvGroup
    }
  })

  const { data: environmentsResponse, loading: isEnvironmentsLoading } = useMutateAsGet(useGetEnvironmentListV2, {
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      includeAllAccessibleAtScope: CDS_OrgAccountLevelServiceEnvEnvGroup
    },
    body: {
      filterType: 'Environment'
    }
  })

  const {
    data: projectsData,
    loading: loadingProjects,
    refetch: refetchProjects
  } = useGetProjectList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pageSize: 200
    },
    lazy: true
  })

  const {
    data: pipelinesData,
    loading: fetchingPipelines,
    refetch: refetchPipelines
  } = useMutateAsGet(useGetPipelineList, {
    body: {
      filterType: 'PipelineSetup'
    },
    queryParamStringifyOptions: { arrayFormat: 'comma' },
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      size: 200
    },
    lazy: true
  })

  const [orgs, setOrgs] = React.useState<SelectOption[]>([])
  const [orgsMap, setOrgsMap] = React.useState<Record<string, SelectOption>>({
    All: allOrgsObj(getString)
  })

  const [projects, setProjects] = React.useState<SelectOption[]>([])
  const [projectsMap, setProjectsMap] = React.useState<Record<string, SelectOption>>({
    All: allProjectsObj(getString)
  })
  const [projectsByOrgId, setProjectsByOrgId] = React.useState<Record<string, ProjctsByOrgId>>({})

  const [pipelineOptions, setPipelineOptions] = React.useState<SelectOption[]>([])
  const [pipelinesMap, setPipelinesMap] = React.useState<Record<string, SelectOption>>({
    All: allPipelinesObj(getString)
  })

  const [services, setServices] = React.useState<SelectOption[]>([allServicesObj(getString)])
  const [servicesMap, setServicesMap] = React.useState<Record<string, SelectOption>>({
    All: allServicesObj(getString)
  })

  const [environments, setEnvironments] = React.useState<SelectOption[]>([allEnvironmentsObj(getString)])
  const [environmentsMap, setEnvironmentsMap] = React.useState<Record<string, SelectOption>>({
    All: allEnvironmentsObj(getString)
  })

  React.useEffect(() => {
    refetchOrgs()
  }, [accountId])

  React.useEffect(() => {
    if (!loadingOrgs && orgsData?.data?.content) {
      const orgsMapp: Record<string, SelectOption> = { All: allOrgsObj(getString) }
      const adaptedOrgsData = orgsData.data.content.map(org => {
        const organization = org?.organizationResponse?.organization
        const label = organization?.name
        const value = organization?.identifier
        const obj = {
          label,
          value
        }
        orgsMapp[value] = obj
        return obj
      })
      setOrgs(adaptedOrgsData)
      setOrgsMap(orgsMapp)
    }
  }, [loadingOrgs])

  React.useEffect(() => {
    if (!loadingServices && serviceData?.data?.content) {
      const servicesMapp: Record<string, SelectOption> = { All: allServicesObj(getString) }
      const adaptedServicesData = serviceData?.data?.content.map(item => {
        const label = item?.service?.name || ''
        const value = item?.service?.identifier || ''
        const obj = {
          label,
          value
        }
        servicesMapp[value] = obj
        return obj
      })
      setServices([allServicesObj(getString), ...adaptedServicesData])
      setServicesMap(servicesMapp)
    }
  }, [loadingServices, serviceData?.data?.content])

  React.useEffect(() => {
    if (!isEnvironmentsLoading && environmentsResponse?.data?.content) {
      const envMap: Record<string, SelectOption> = { All: allEnvironmentsObj(getString) }
      const adaptedEnvData = environmentsResponse?.data?.content.map(item => {
        const label = item?.environment?.name || ''
        const value = item?.environment?.identifier || ''
        const obj = {
          label,
          value
        }
        envMap[value] = obj
        return obj
      })
      setEnvironments([allEnvironmentsObj(getString), ...adaptedEnvData])
      setEnvironmentsMap(envMap)
    }
  }, [environmentsResponse?.data?.content, isEnvironmentsLoading])

  React.useEffect(() => {
    if (!loadingProjects && projectsData?.data?.content) {
      const projectsMapp: Record<string, SelectOption> = { All: allProjectsObj(getString) }

      const adaptedProjectsData = projectsData.data.content.map(datum => {
        const project = datum.project || {}
        const label = project?.name
        const value = project?.identifier
        const obj = {
          label,
          value
        }
        projectsMapp[value] = obj
        return obj
      })

      if (freezeWindowLevel === FreezeWindowLevels.ORG) {
        setProjects(adaptedProjectsData)
        setProjectsMap(projectsMapp)
      }
      if (freezeWindowLevel === FreezeWindowLevels.ACCOUNT) {
        const accum = { projects: adaptedProjectsData, projectsMap: projectsMapp }
        const orgIdentifierr = projectsData.data?.content?.[0]?.project?.orgIdentifier
        if (!orgIdentifierr) return
        setProjectsByOrgId(_projectsByOrgId => ({
          ..._projectsByOrgId,
          [orgIdentifierr]: accum
        }))
      }
    }
  }, [loadingProjects])

  React.useEffect(() => {
    if (freezeWindowLevel === FreezeWindowLevels.ORG && orgIdentifier) {
      refetchProjects()
    }
  }, [orgIdentifier, freezeWindowLevel])

  React.useEffect(() => {
    if (!fetchingPipelines && pipelinesData?.data?.content) {
      const pipelineMap: Record<string, SelectOption> = { All: allPipelinesObj(getString) }

      const pipelineDataToOptions = pipelinesData.data.content.map(pipelineResponse => {
        const label = defaultTo(pipelineResponse?.name, '')
        const value = defaultTo(pipelineResponse?.identifier, '')
        const obj = {
          label,
          value
        }
        pipelineMap[value] = obj
        return obj
      })

      const adaptedPipelinesData = pipelineDataToOptions.filter(item => !isEmpty(item.value))
      if (freezeWindowLevel === FreezeWindowLevels.PROJECT) {
        setPipelineOptions(adaptedPipelinesData)
        setPipelinesMap(pipelineMap)
      }
    }
  }, [fetchingPipelines, pipelinesData?.data?.content])

  React.useEffect(() => {
    if (freezeWindowLevel === FreezeWindowLevels.PROJECT) {
      refetchPipelines()
    }
  }, [freezeWindowLevel])

  const fetchProjectsForOrgId = debounce((_orgIdentifier: string) => {
    if (!_orgIdentifier) return
    refetchProjects({
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier: _orgIdentifier,
        pageSize: 200
      }
    })
  }, 300)

  const fetchProject = (query: string, orgId?: string): void => {
    if (freezeWindowLevel === FreezeWindowLevels.ACCOUNT) {
      if (!orgId) return
      refetchProjects({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier: orgId,
          pageSize: 200,
          searchTerm: (query || '').trim()
        }
      })
    } else if (freezeWindowLevel === FreezeWindowLevels.ORG) {
      refetchProjects({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          pageSize: 200,
          searchTerm: (query || '').trim()
        }
      })
    }
  }
  const fetchProjectsByQuery = debounce((query: string, orgId?: string) => {
    fetchProject(query, orgId)
  }, 500)

  //additional debounce when we have to reset the options, so that user have enough time to select multiple from current search result.
  const fetchProjectsResetQuery = debounce((orgId?: string) => {
    fetchProject('', orgId)
  }, 5000)

  const fetchOrgs = (query: string): void => {
    if (freezeWindowLevel === FreezeWindowLevels.ACCOUNT) {
      refetchOrgs({
        queryParams: {
          accountIdentifier: accountId,
          pageSize: 200,
          searchTerm: (query || '').trim()
        }
      })
    }
  }
  const fetchOrgByQuery = debounce((query: string) => {
    fetchOrgs(query)
  }, 500)

  //additional debounce when we have to reset the options, so that user have enough time to select multiple from current search result.
  const fetchOrgResetQuery = debounce(() => {
    fetchOrgs('')
  }, 5000)

  const fetchPipelinesWithSearch = (query: string): void => {
    if (freezeWindowLevel === FreezeWindowLevels.PROJECT) {
      refetchPipelines({
        body: {
          filterType: 'PipelineSetup'
        },
        queryParamStringifyOptions: { arrayFormat: 'comma' },
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          size: 200,
          searchTerm: (query || '').trim()
        }
      })
    }
  }
  const fetchPipelinesByQuery = debounce((query: string) => {
    fetchPipelinesWithSearch(query)
  }, 500)

  //additional debounce when we have to reset the options, so that user have enough time to select multiple from current search result.
  const fetchPipelinesResetQuery = debounce(() => {
    fetchPipelinesWithSearch('')
  }, 5000)

  return {
    orgs,
    orgsMap,
    projects,
    projectsMap,
    services,
    servicesMap,
    environmentsMap,
    environments,
    freezeWindowLevel,
    projectsByOrgId,
    fetchProjectsForOrgId,
    fetchProjectsByQuery,
    fetchOrgByQuery,
    loadingOrgs,
    loadingProjects,
    fetchOrgResetQuery,
    fetchProjectsResetQuery,
    fetchPipelinesByQuery,
    fetchPipelinesResetQuery,
    pipelineOptions,
    pipelinesMap,
    loadingPipelines: fetchingPipelines
  }
}
