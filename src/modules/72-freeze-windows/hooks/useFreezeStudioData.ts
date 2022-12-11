/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { debounce } from 'lodash-es'
import type { SelectOption } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useGetOrganizationAggregateDTOList, useGetProjectList, useGetServiceList } from 'services/cd-ng'
import { FreezeWindowLevels, ResourcesInterface, ProjctsByOrgId } from '@freeze-windows/types'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { FreezeWindowContext } from '@freeze-windows/context/FreezeWindowContext'
import { allOrgsObj, allProjectsObj, allServicesObj } from '@freeze-windows/utils/FreezeWindowStudioUtil'

export const useFreezeStudioData = (): ResourcesInterface => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { freezeWindowLevel } = React.useContext(FreezeWindowContext)
  const { getString } = useStrings()

  const {
    loading: loadingOrgs,
    data: orgsData,
    refetch: refetchOrgs
  } = useGetOrganizationAggregateDTOList({
    queryParams: { accountIdentifier: accountId },
    lazy: true
  })

  const {
    data: serviceData,
    loading: loadingServices,
    refetch: refetchServices
  } = useGetServiceList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })

  const {
    data: projectsData,
    loading: loadingProjects,
    refetch: refetchProjects
  } = useGetProjectList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier
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

  const [services, setServices] = React.useState<SelectOption[]>([allServicesObj(getString)])
  const [servicesMap, setServicesMap] = React.useState<Record<string, SelectOption>>({
    All: allServicesObj(getString)
  })

  React.useEffect(() => {
    refetchOrgs()
  }, [accountId])

  React.useEffect(() => {
    if (freezeWindowLevel === FreezeWindowLevels.PROJECT && projectIdentifier) {
      refetchServices()
    }
  }, [projectIdentifier, freezeWindowLevel])

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
  }, [loadingServices])

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

  const fetchProjectsForOrgId = debounce((_orgIdentifier: string) => {
    if (!_orgIdentifier) return
    refetchProjects({
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier: _orgIdentifier
      }
    })
  }, 300)

  const fetchProjectsByQuery = debounce((query: string, orgId?: string) => {
    if (freezeWindowLevel === FreezeWindowLevels.ACCOUNT) {
      if (!orgId) return
      refetchProjects({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier: orgId,
          searchTerm: (query || '').trim()
        }
      })
    } else if (freezeWindowLevel === FreezeWindowLevels.ORG) {
      refetchProjects({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          searchTerm: (query || '').trim()
        }
      })
    }
  }, 500)

  return {
    orgs,
    orgsMap,
    projects,
    projectsMap,
    services,
    servicesMap,
    freezeWindowLevel,
    projectsByOrgId,
    fetchProjectsForOrgId,
    fetchProjectsByQuery,
    loadingProjects
  }
}
