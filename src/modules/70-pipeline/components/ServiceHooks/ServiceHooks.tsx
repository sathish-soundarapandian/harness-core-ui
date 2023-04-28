/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { defaultTo, get } from 'lodash-es'
import { Layout } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { useGetServiceV2 } from 'services/cd-ng'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { ServiceHooksMap } from './ServiceHooksHelper'
import type { ServiceHooksSelectionProps, ServiceHookStoreType } from './ServiceHooksInterface'
import ServiceHooksListView from './ServiceHooksListView/ServiceHooksListView'

export default function ServiceHooksSelection({
  isPropagating,
  deploymentType,
  isReadonlyServiceMode,
  readonly
}: ServiceHooksSelectionProps): JSX.Element {
  const {
    state: {
      selectionState: { selectedStageId }
    },
    getStageFromPipeline,
    updateStage,
    allowableTypes
  } = usePipelineContext()

  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(defaultTo(selectedStageId, ''))
  const [selectedStoreType, setSelectedStoreType] = useState<ServiceHookStoreType>(ServiceHooksMap.Inline)

  const { accountId, orgIdentifier, projectIdentifier } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      accountId: string
    }>
  >()

  const { data: selectedServiceResponse } = useGetServiceV2({
    serviceIdentifier: get(stage, 'stage.spec.service.serviceRef', ''),
    queryParams: { accountIdentifier: accountId, orgIdentifier: orgIdentifier, projectIdentifier: projectIdentifier },
    lazy: true
  })

  const handleSelect = /* istanbul ignore next */ (storeType: ServiceHookStoreType): void => {
    setSelectedStoreType(storeType)
  }

  return (
    <Layout.Vertical margin={{ top: 'small' }}>
      <ServiceHooksListView
        isPropagating={isPropagating}
        updateStage={updateStage}
        stage={stage}
        setSelectedStoreType={handleSelect}
        selectedStoreType={selectedStoreType}
        isReadonly={!!readonly}
        deploymentType={deploymentType}
        allowableTypes={allowableTypes}
        selectedServiceResponse={selectedServiceResponse}
        isReadonlyServiceMode={isReadonlyServiceMode}
      />
    </Layout.Vertical>
  )
}
