/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import type { SelectOption } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useGetOrganizationAggregateDTOList, useGetProjectList, useGetServiceList } from 'services/cd-ng'
import { ResourcesInterface, FreezeWindowLevels } from '@freeze-windows/types'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { FreezeWindowContext } from './FreezeWindowContext/FreezeWindowContext'
import { allProjectsObj, allServicesObj } from './FreezeWindowStudioUtil'

export const useFreezeStudioData = (): ResourcesInterface => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { freezeWindowLevel } = React.useContext(FreezeWindowContext)
  const { getString } = useStrings()

  const {
    loading: loadingOrgs,
    data: orgsData,
    refetch: refetchOrgs
    // error: orgsError
  } = useGetOrganizationAggregateDTOList({
    queryParams: { accountIdentifier: accountId },
    lazy: true
  })

  const {
    data: serviceData,
    // error,
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
  const [projects, setProjects] = React.useState<SelectOption[]>([])
  const [projectsMap, setProjectsMap] = React.useState<Record<string, SelectOption>>({
    All: allProjectsObj(getString)
  })
  const [services, setServices] = React.useState<SelectOption[]>([allServicesObj(getString)])
  const [servicesMap, setServicesMap] = React.useState<Record<string, SelectOption>>({
    All: allServicesObj(getString)
  })
  // data.content[1].organizationResponse.organization.identifier
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
      const adaptedOrgsData = orgsData.data.content.map(org => {
        const organization = org?.organizationResponse?.organization
        return {
          label: organization?.name,
          value: organization?.identifier
        }
      })
      setOrgs(adaptedOrgsData)
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
      setProjects(adaptedProjectsData)
      setProjectsMap(projectsMapp)
    }
  }, [loadingProjects])

  React.useEffect(() => {
    if (freezeWindowLevel === FreezeWindowLevels.ORG && orgIdentifier) {
      refetchProjects()
    }
  }, [orgIdentifier, freezeWindowLevel])

  return {
    orgs,
    projects,
    projectsMap,
    services,
    servicesMap,
    freezeWindowLevel
  }
}
