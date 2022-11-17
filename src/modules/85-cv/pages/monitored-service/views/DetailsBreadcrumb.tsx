/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import type { Views } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useQueryParams } from '@common/hooks'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { getCVMonitoringServicesSearchParam } from '@cv/utils/CommonUtils'

const DetailsBreadcrumb: React.FC = () => {
  const { getString } = useStrings()
  const { view } = useQueryParams<{ view?: Views.GRID }>()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  return (
    <NGBreadcrumbs
      links={[
        {
          url: `${routes.toCVMonitoringServices({
            accountId,
            orgIdentifier,
            projectIdentifier
          })}${getCVMonitoringServicesSearchParam({ view })}`,
          label: getString('cv.monitoredServices.title')
        }
      ]}
    />
  )
}

export default DetailsBreadcrumb
