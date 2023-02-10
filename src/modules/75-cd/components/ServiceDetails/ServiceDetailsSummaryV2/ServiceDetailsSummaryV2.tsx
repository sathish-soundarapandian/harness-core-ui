/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Page } from '@harness/uicore'
import type { ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { ExecutionList } from '@pipeline/pages/execution-list/ExecutionList'
import { ServiceDetailsEnvView } from './ServiceDetailsEnvView'
import css from '@cd/components/ServiceDetails/ServiceDetailsContent/ServicesDetailsContent.module.scss'

export default function ServiceDetailsSummaryV2(): JSX.Element {
  const { serviceId } = useParams<ServicePathProps>()
  const [envIdFilter, setEnvIdFilter] = useState<string>()
  const [artifactNameFilter, setArtifactNameFilter] = useState<string>()

  const executionListFilter = {
    moduleProperties: {
      cd: {
        envIdentifiers: envIdFilter,
        serviceIdentifiers: serviceId && serviceId.length ? serviceId : undefined,
        artifactDisplayNames: artifactNameFilter
      }
    },
    filterType: 'PipelineExecution'
  }

  return (
    <Page.Body className={css.pageStyles}>
      <ServiceDetailsEnvView setEnvId={setEnvIdFilter} setArtifactName={setArtifactNameFilter} />
      <ExecutionList isExecutionPage={false} filters={executionListFilter} />
    </Page.Body>
  )
}
