/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'

import { Layout, shouldShowError, useToaster } from '@harness/uicore'

import { useParams } from 'react-router-dom'
import { defaultTo, isEmpty, get } from 'lodash-es'
import { useCache } from '@common/hooks/useCache'
import { useDeepCompareEffect } from '@common/hooks'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'

import { PageConnectorResponse, useGetConnectorListV2 } from 'services/cd-ng'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import type { Scope } from '@common/interfaces/SecretsInterface'
import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import AzureWebAppListView from './AzureWebAppServiceConfigListView/AzureWebAppServiceListView'
import {
  AzureWebAppSelectionProps,
  AzureWebAppsServiceDefinition,
  ModalViewOption
} from './AzureWebAppServiceConfig.types'

export default function AzureWebAppConfigSelection({
  isPropagating,
  deploymentType,
  isReadonlyServiceMode,
  readonly
}: AzureWebAppSelectionProps): JSX.Element | null {
  const {
    state: {
      pipeline,
      selectionState: { selectedStageId }
    },
    getStageFromPipeline,
    updateStage,
    allowableTypes
  } = usePipelineContext()

  //for selecting which modal to open
  const [selectedOption, setSelectedOption] = React.useState<ModalViewOption | undefined>(undefined)
  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')
  const [stringsConnectorsResponse, setStringsConnectorResponse] = React.useState<PageConnectorResponse | undefined>()
  const [settingsConnectorsResponse, setSettingsConnectorResponse] = React.useState<PageConnectorResponse | undefined>()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const getServiceCacheId = `${pipeline.identifier}-${selectedStageId}-service`
  const { getCache } = useCache([getServiceCacheId])
  const serviceInfo = getCache<AzureWebAppsServiceDefinition>(getServiceCacheId)

  const { accountId, orgIdentifier, projectIdentifier } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      accountId: string
    }>
  >()
  const defaultQueryParams = {
    pageIndex: 0,
    pageSize: 10,
    searchTerm: '',
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    includeAllConnectorsAvailableAtScope: true
  }
  const { mutate: fetchConnectors } = useGetConnectorListV2({
    queryParams: defaultQueryParams
  })

  const applicationSettings = useMemo(() => {
    /* istanbul ignore else */
    /* istanbul ignore next */
    if (isReadonlyServiceMode && !isEmpty(serviceInfo)) {
      return defaultTo(serviceInfo?.spec.applicationSettings, {})
    }
    if (isPropagating) {
      return get(stage, 'stage.spec.serviceConfig.stageOverrides.applicationSettings', {})
    }

    return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.applicationSettings', {})
  }, [isReadonlyServiceMode, serviceInfo, isPropagating, stage, selectedOption])

  const connectionStrings = useMemo(() => {
    /* istanbul ignore else */
    /* istanbul ignore next */
    if (isReadonlyServiceMode && !isEmpty(serviceInfo)) {
      return defaultTo(serviceInfo?.spec?.connectionStrings, {})
    }
    if (isPropagating) {
      return get(stage, 'stage.spec.serviceConfig.stageOverrides.connectionStrings', {})
    }

    return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.connectionStrings', {})
  }, [isReadonlyServiceMode, serviceInfo, isPropagating, stage, selectedOption])

  useDeepCompareEffect(() => {
    refetchSettingsConnectors()
  }, [stage, applicationSettings, selectedOption])

  useDeepCompareEffect(() => {
    refetchStringsConnectors()
  }, [stage, connectionStrings, selectedOption])

  const getConnectorList = (option: ModalViewOption): Array<{ scope: Scope; identifier: string }> => {
    const applicationConnectorRef = applicationSettings?.spec?.connectorRef
    const connectionStringsConnectorRef = connectionStrings?.spec?.connectorRef
    switch (option) {
      case ModalViewOption.APPLICATIONSETTING:
        return !isEmpty(applicationSettings)
          ? [
              {
                scope: getScopeFromValue(applicationConnectorRef),
                identifier: getIdentifierFromValue(applicationConnectorRef)
              }
            ]
          : []
      case ModalViewOption.CONNECTIONSTRING:
        return !isEmpty(connectionStrings)
          ? [
              {
                scope: getScopeFromValue(connectionStringsConnectorRef),
                identifier: getIdentifierFromValue(connectionStringsConnectorRef)
              }
            ]
          : []
      default:
        return []
    }
  }

  const refetchStringsConnectors = async (): Promise<void> => {
    const list = await refetchConnectorList(ModalViewOption.CONNECTIONSTRING)
    setStringsConnectorResponse(list)
  }

  const refetchSettingsConnectors = async (): Promise<void> => {
    const list = await refetchConnectorList(ModalViewOption.APPLICATIONSETTING)
    setSettingsConnectorResponse(list)
  }

  const refetchConnectorList = async (option: ModalViewOption): Promise<PageConnectorResponse | undefined> => {
    try {
      const connectorList = getConnectorList(option)
      const connectorIdentifiers = connectorList.map((item: { scope: string; identifier: string }) => item.identifier)
      const response = await fetchConnectors({ filterType: 'Connector', connectorIdentifiers })
      /* istanbul ignore else */
      if (get(response, 'data', null)) {
        const { data: connectorResponse } = response
        return connectorResponse
      }
    } catch (e) {
      /* istanbul ignore else */
      if (shouldShowError(e)) {
        showError(getRBACErrorMessage(e))
      }
    }
  }

  const AzureWebAppCommonProps = {
    isPropagating,
    stage,
    updateStage,
    stringsConnectors: stringsConnectorsResponse,
    settingsConnectors: settingsConnectorsResponse,
    refetchStringsConnectors: refetchStringsConnectors,
    refetchSettingsConnectors: refetchSettingsConnectors,
    isReadonly: readonly,
    deploymentType,
    allowableTypes,
    selectedOption,
    setSelectedOption,
    applicationSettings,
    connectionStrings
  }
  return (
    <Layout.Vertical>
      <AzureWebAppListView {...AzureWebAppCommonProps} pipeline={pipeline} />
    </Layout.Vertical>
  )
}
