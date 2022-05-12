/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Layout, Text } from '@wings-software/uicore'

import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'
import { useGetConnectorListV2, PageConnectorResponse } from 'services/cd-ng'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'

import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { isServerlessDeploymentType } from '@pipeline/utils/stageHelpers'

import { useStrings } from 'framework/strings'
import type { Scope } from '@common/interfaces/SecretsInterface'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { useDeepCompareEffect } from '@common/hooks'
import type { ManifestSelectionProps } from './ManifestInterface'
import ManifestListView from './ManifestListView'
import { getFlattenedStages, getStageIndexFromPipeline } from '../PipelineStudio/StageBuilder/StageBuilderUtil'

export default function ManifestSelection({
  isForOverrideSets = false,
  identifierName,
  isForPredefinedSets = false,
  isPropagating,
  overrideSetIdentifier,
  deploymentType
}: ManifestSelectionProps): JSX.Element {
  const {
    state: {
      pipeline,
      selectionState: { selectedStageId }
    },
    getStageFromPipeline,
    updateStage,
    isReadonly,
    allowableTypes
  } = usePipelineContext()

  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')
  const [fetchedConnectorResponse, setFetchedConnectorResponse] = React.useState<PageConnectorResponse | undefined>()
  const { getString } = useStrings()

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

  const listOfManifests = useMemo(() => {
    if (overrideSetIdentifier?.length) {
      const parentStageName = stage?.stage?.spec?.serviceConfig?.useFromStage?.stage
      const { index } = getStageIndexFromPipeline(pipeline, parentStageName)
      const { stages } = getFlattenedStages(pipeline)
      const overrideSets = get(
        stages[index],
        'stage.spec.serviceConfig.serviceDefinition.spec.manifestOverrideSets',
        []
      )
      const selectedOverrideSet = overrideSets.find(
        ({ overrideSet }: { overrideSet: { identifier: string } }) => overrideSet.identifier === overrideSetIdentifier
      )
      return get(selectedOverrideSet, 'overrideSet.manifests', [])
    }

    if (isPropagating) {
      return get(stage, 'stage.spec.serviceConfig.stageOverrides.manifests', [])
    }

    if (isForOverrideSets) {
      const listValue = get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.manifestOverrideSets', [])
      return listValue
        .map((overrideSets: { overrideSet: { identifier: string; manifests: [any] } }) => {
          if (overrideSets?.overrideSet?.identifier === identifierName) {
            return overrideSets.overrideSet?.manifests
          }
        })
        .filter((x: { overrideSet: { identifier: string; manifests: [any] } }) => x !== undefined)[0]
    } else {
      if (isForPredefinedSets) {
        return get(stage, 'stage.spec.serviceConfig.stageOverrides.manifests', [])
      } else {
        return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.manifests', [])
      }
    }
  }, [overrideSetIdentifier, isPropagating, stage, isForOverrideSets, isForPredefinedSets, pipeline])

  useDeepCompareEffect(() => {
    refetchConnectorList()
  }, [stage, listOfManifests])

  const getConnectorList = (): Array<{ scope: Scope; identifier: string }> => {
    return listOfManifests?.length
      ? listOfManifests.map((data: any) => ({
          scope: getScopeFromValue(data?.manifest?.spec?.store?.spec?.connectorRef),
          identifier: getIdentifierFromValue(data?.manifest?.spec?.store?.spec?.connectorRef)
        }))
      : []
  }

  const refetchConnectorList = async (): Promise<void> => {
    const connectorList = getConnectorList()
    const connectorIdentifiers = connectorList.map((item: { scope: string; identifier: string }) => item.identifier)
    const response = await fetchConnectors({ filterType: 'Connector', connectorIdentifiers })
    if (response?.data) {
      const { data: connectorResponse } = response
      setFetchedConnectorResponse(connectorResponse)
    }
  }

  return (
    <Layout.Vertical>
      {/* {isForPredefinedSets && <PredefinedOverrideSets context="MANIFEST" currentStage={stage} />} //disabled for now */}
      {overrideSetIdentifier?.length === 0 && !isForOverrideSets && (
        <Text style={{ color: 'var(--grey-500)', lineHeight: '24px' }}>{getString('manifestSelectionInfo')}</Text>
      )}

      <ManifestListView
        isPropagating={isPropagating}
        pipeline={pipeline}
        updateStage={updateStage}
        stage={stage}
        isForOverrideSets={isForOverrideSets}
        identifierName={identifierName}
        isForPredefinedSets={isForPredefinedSets}
        overrideSetIdentifier={overrideSetIdentifier}
        connectors={fetchedConnectorResponse}
        refetchConnectors={refetchConnectorList}
        listOfManifests={listOfManifests}
        isReadonly={isReadonly}
        deploymentType={deploymentType}
        allowableTypes={allowableTypes}
        allowOnlyOne={isServerlessDeploymentType(deploymentType)}
      />
    </Layout.Vertical>
  )
}
