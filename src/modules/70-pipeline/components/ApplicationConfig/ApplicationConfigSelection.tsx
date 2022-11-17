/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'

import { Layout, RUNTIME_INPUT_VALUE, shouldShowError, useToaster } from '@harness/uicore'

import { useParams } from 'react-router-dom'
import { isEmpty, get } from 'lodash-es'
import { useDeepCompareEffect } from '@common/hooks'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'

import { PageConnectorResponse, useGetConnectorListV2 } from 'services/cd-ng'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import type { Scope } from '@common/interfaces/SecretsInterface'
import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import ApplicationConfigListView from './ApplicationConfigListView/ApplicationConfigListView'
import {
  ApplicationConfigSelectionProps,
  ApplicationConfigSelectionTypes,
  ModalViewOption
} from './ApplicationConfig.types'

export default function ApplicationConfigSelection({
  isPropagating,
  deploymentType,
  readonly,
  updateStage,
  showApplicationSettings,
  showConnectionStrings,
  selectionType,
  data,
  handleSubmitConfig,
  handleDeleteConfig,
  editServiceOverride,
  allowableTypes
}: ApplicationConfigSelectionProps): JSX.Element | null {
  const {
    state: {
      pipeline,
      selectionState: { selectedStageId }
    },
    getStageFromPipeline
  } = usePipelineContext()

  //for selecting which modal to open
  const [selectedOption, setSelectedOption] = React.useState<ModalViewOption | undefined>(undefined)
  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')
  const [stringsConnectorsResponse, setStringsConnectorResponse] = React.useState<PageConnectorResponse | undefined>()
  const [settingsConnectorsResponse, setSettingsConnectorResponse] = React.useState<PageConnectorResponse | undefined>()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()

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

  const pipelineView = selectionType === ApplicationConfigSelectionTypes.PIPELINE

  const applicationSettings = useMemo(() => {
    switch (selectionType) {
      case ApplicationConfigSelectionTypes.PIPELINE:
        if (isPropagating) {
          return get(stage, 'stage.spec.serviceConfig.stageOverrides.applicationSettings', {})
        }

        return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.applicationSettings', {})
      default:
        return showApplicationSettings ? data : null
    }
  }, [isPropagating, stage, selectedOption, data, selectionType])

  const connectionStrings = useMemo(() => {
    switch (selectionType) {
      case ApplicationConfigSelectionTypes.PIPELINE:
        /* istanbul ignore else */
        /* istanbul ignore next */

        if (isPropagating) {
          return get(stage, 'stage.spec.serviceConfig.stageOverrides.connectionStrings', {})
        }

        return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.connectionStrings', {})
      default:
        return showConnectionStrings ? data : null
    }
  }, [isPropagating, stage, selectedOption, data, selectionType])

  useDeepCompareEffect(() => {
    if (pipelineView) {
      refetchSettingsConnectors()
    }
  }, [stage, applicationSettings, selectedOption])

  useDeepCompareEffect(() => {
    if (pipelineView) {
      refetchStringsConnectors()
    }
  }, [stage, connectionStrings, selectedOption])

  const getConnectorList = (option: ModalViewOption): Array<{ scope: Scope; identifier: string }> => {
    const applicationConnectorRef = applicationSettings?.store?.spec?.connectorRef
    const connectionStringsConnectorRef = connectionStrings?.store?.spec?.connectorRef
    switch (option) {
      case ModalViewOption.APPLICATIONSETTING:
        return !isEmpty(applicationSettings) &&
          applicationConnectorRef &&
          applicationConnectorRef !== RUNTIME_INPUT_VALUE
          ? [
              {
                scope: getScopeFromValue(applicationConnectorRef),
                identifier: getIdentifierFromValue(applicationConnectorRef)
              }
            ]
          : []
      case ModalViewOption.CONNECTIONSTRING:
        return !isEmpty(connectionStrings) &&
          connectionStringsConnectorRef &&
          connectionStringsConnectorRef !== RUNTIME_INPUT_VALUE
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
    refetchStringsConnectors: pipelineView ? refetchStringsConnectors : undefined,
    refetchSettingsConnectors: pipelineView ? refetchSettingsConnectors : undefined,
    isReadonly: readonly,
    deploymentType,
    allowableTypes,
    selectedOption,
    setSelectedOption,
    applicationSettings,
    connectionStrings,
    showApplicationSettings,
    showConnectionStrings,
    selectionType,
    handleSubmitConfig,
    handleDeleteConfig,
    editServiceOverride
  }
  return (
    <Layout.Vertical>
      <ApplicationConfigListView {...AzureWebAppCommonProps} pipeline={pipeline} />
    </Layout.Vertical>
  )
}
