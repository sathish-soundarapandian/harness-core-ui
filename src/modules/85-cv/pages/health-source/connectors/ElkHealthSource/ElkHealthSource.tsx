/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { omit } from 'lodash-es'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'
import { ElkQueryBuilder } from './components/MapQueriesToHarnessService/ElkQueryBuilder'
import { buildElkHealthSourceInfo, createElkHealthSourcePayload } from './ElkHealthSource.utils'
import type { ElkHealthSourceInfo } from './ElkHealthSource.types'

interface ElkMonitoringSourceProps {
  data: ElkHealthSourceInfo
  onSubmit: (formdata: ElkHealthSourceInfo, UpdatedHealthSource: UpdatedHealthSource) => Promise<void>
  isTemplate?: boolean
  expressions?: string[]
}

export default function ElkHealthSource(props: ElkMonitoringSourceProps): JSX.Element {
  const { data: sourceData, onSubmit, isTemplate, expressions } = props
  const allParams = useParams<ProjectPathProps & { identifier: string }>()
  const { onPrevious } = useContext(SetupSourceTabsContext)
  const requiredParams = omit(allParams, 'identifier')

  const handleOnSubmit = useCallback(
    async (ElkFormData: ElkHealthSourceInfo) => {
      const ElkHealthSourcePayload = createElkHealthSourcePayload(ElkFormData)
      await onSubmit(sourceData, ElkHealthSourcePayload)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sourceData]
  )

  return (
    <ElkQueryBuilder
      data={buildElkHealthSourceInfo(requiredParams, sourceData)}
      onSubmit={handleOnSubmit}
      onPrevious={() => onPrevious(sourceData)}
      isTemplate={isTemplate}
      expressions={expressions}
    />
  )
}
