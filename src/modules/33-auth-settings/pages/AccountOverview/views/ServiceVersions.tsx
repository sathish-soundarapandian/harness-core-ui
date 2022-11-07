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
import css from '../AccountOverview.module.scss'

const versionAPIs = [
  {
    label: 'Access Control',
    url: 'authz/api/version',
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
    label: 'PMS',
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

const BASE_URL = window.location.pathname.replace(/\/ng\/?/, '/')

interface ServiceData {
  label?: string
  version?: string
}

const ServiceVersions = () => {
  const [data, setData] = useState<ServiceData[]>([])
  const [loading, setLoading] = useState<boolean>()
  const { getString } = useStrings()
  const { showError } = useToaster()

  const fetchServices = async () => {
    const servicesLength = Object.keys(data).length
    if (servicesLength <= 0) {
      const labelVersionsArr: ServiceData[] = []

      setLoading(true)
      for (const row of versionAPIs) {
        try {
          const res = await fetch(row.url.startsWith('http') ? row.url : BASE_URL + row.url)
          const response = await res.json()

          let serviceRow: ServiceData = {
            label: row.label
          }
          if (res.status === 200) {
            if (response.version) {
              // for NGUI
              serviceRow['version'] = response.version
            } else if (response.versionInfo) {
              // for CF
              serviceRow['version'] = response.versionInfo
            } else if (response.resource && response.resource.versionInfo) {
              serviceRow['version'] = response.resource.versionInfo.version
            }
          } else {
            serviceRow = {
              label: row.label,
              version: 'NA'
            }
          }
          labelVersionsArr.push(serviceRow)
        } catch (e) {
          setLoading(false)
          showError(`Error fetching ${row.label} version`)
        }
      }
      setData(labelVersionsArr)
      setLoading(false)
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
