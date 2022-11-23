/* eslint-disable no-await-in-loop */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { Accordion, Container, PageSpinner, TableV2 } from '@harness/uicore'
import type { Column } from 'react-table'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/exports'
import { getLocationPathName } from 'framework/utils/WindowLocation'
import css from '../AccountOverview.module.scss'

const versionAPIs = [
  {
    label: 'Access Control',
    url: 'gateway/authz/api/version',
    id: 'access_control'
  },
  {
    url: 'auth/version.json',
    label: 'Auth UI',
    id: 'ng_auth_ui'
  },
  {
    label: 'Cloud Cost Management',
    url: 'ccm/api/version',
    id: 'ccm'
  },
  {
    label: 'Feature Flags',
    url: 'cf/version',
    id: 'cf'
  },
  {
    label: 'Continuous Integration',
    url: 'ci/version',
    id: 'ci'
  },
  {
    label: 'Security Tests',
    url: 'sto/api/v2/system/version',
    id: 'sto'
  },
  {
    label: 'Security Tests Manager',
    url: 'sto-manager/version',
    id: 'sto_manager'
  },
  {
    label: 'Continuous Verification',
    url: 'cv/api/version',
    id: 'cv'
  },
  {
    label: 'Light Wing',
    url: 'lw/api',
    id: 'lw'
  },
  {
    label: 'Custom Dashboards',
    url: 'dashboard/version',
    id: 'ng_custom_dashboards'
  },
  {
    label: 'Manager',
    url: 'ng/api/version',
    id: 'ng_manager'
  },
  {
    url: 'ng/static/version.json',
    label: 'NextGen UI',
    id: 'ng_ui'
  },
  {
    label: 'Notifications',
    url: 'notifications/api/version',
    id: 'notifications'
  },
  {
    label: 'Pipelines',
    url: 'pipeline/api/version',
    id: 'pms'
  },
  {
    label: 'Resource Group',
    url: 'resourcegroup/api/version',
    id: 'resource_group'
  },
  {
    label: 'Template Service',
    url: 'template/api/version',
    id: 'template_service'
  }
]

const BASE_URL = getLocationPathName().replace(/\/ng\/?/, '/')

interface ServiceData {
  label?: string
  version?: string
}

const ServiceVersions = () => {
  const [data, setData] = useState<ServiceData[]>([])
  const [loading, setLoading] = useState<boolean>()
  const { getString } = useStrings()
  const { showError } = useToaster()

  const fetchServices = () => {
    const servicesLength = data.length
    if (servicesLength <= 0) {
      const promiseArr = versionAPIs.map(row => fetch(row.url.startsWith('http') ? row.url : BASE_URL + row.url))

      setLoading(true)
      Promise.allSettled(promiseArr)
        .then(async responses => {
          Promise.allSettled(
            responses.map(response => (response.status === 'fulfilled' ? response.value.json() : response))
          ).then(resArr => {
            const labelVersionsArr = resArr.map((response: any, index) => {
              const row = versionAPIs[index]
              if (response.status === 'fulfilled') {
                const serviceRow: ServiceData = {
                  label: row.label
                }
                if (response.value.version) {
                  // for NGUI
                  serviceRow['version'] = response.value.version
                } else if (response.value.versionInfo) {
                  // for CF
                  serviceRow['version'] = response.value.versionInfo
                } else if (response.value.resource && response.value.resource.versionInfo) {
                  serviceRow['version'] = response.value.resource.versionInfo.version
                }
                return serviceRow
              } else {
                return {
                  label: row.label,
                  version: 'NA'
                }
              }
            })
            setData(labelVersionsArr)
          })
          setLoading(false)
        })
        .catch(() => {
          showError('Error fetching Service Versions')
        })
    }
  }

  const columns: Column<any>[] = useMemo(
    () => [
      {
        Header: 'Service',
        id: 'service',
        width: '30%',
        Cell: row => {
          return row.row.original.label
        }
      },
      {
        Header: 'Version',
        id: 'version',
        width: '30%',
        Cell: row => {
          return row.row.original.version || 'NA'
        }
      }
    ],
    [data]
  )

  return (
    <Container margin="xlarge" padding={{ left: 'large', right: 'large' }} className={css.container} background="white">
      <Accordion
        onChange={isOpen => {
          if (isOpen) {
            fetchServices()
          }
        }}
      >
        <Accordion.Panel
          id="serviceVersions"
          details={loading ? <PageSpinner /> : <TableV2 data={data} columns={columns} />}
          summary={getString('common.platformServiceVersions')}
        />
      </Accordion>
    </Container>
  )
}

export default ServiceVersions
