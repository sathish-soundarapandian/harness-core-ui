/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { Button, Icon, Layout, Text, shouldShowError, useToaster } from '@harness/uicore'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import { defaultTo } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { PageConnectorResponse, useGetConnectorListV2 } from 'services/cd-ng'
import { getConnectorNameFromValue, getStatus } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import {
  ArtifactIconByType,
  ArtifactTitleIdByType,
  ENABLED_ARTIFACT_TYPES
} from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { showConnectorStep } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { getIdentifierFromValue } from '@common/components/EntityReference/EntityReference'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import ArtifactRepositoryTooltip from '../ArtifactRepositoryTooltip'
import type { ArtifactTriggerSpec, ArtifactType } from '../../ArtifactInterface'
import { getArtifactLocation } from '../../ArtifactUtils'
import css from '../../ArtifactsSelection.module.scss'

interface PrimaryArtifactViewProps {
  artifact: ArtifactTriggerSpec
  artifactType: ArtifactType
  editArtifact: () => void
  deleteArtifact: () => void
}

function PrimaryArtifactView({
  artifact,
  artifactType,
  editArtifact,
  deleteArtifact
}: PrimaryArtifactViewProps): React.ReactElement {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<PipelineType<ProjectPathProps>>()
  const [fetchedConnectorResponse, setFetchedConnectorResponse] = useState<PageConnectorResponse | undefined>()
  const { color: primaryConnectorColor } = getStatus(artifact?.connectorRef, fetchedConnectorResponse, accountId)
  const primaryConnectorName = getConnectorNameFromValue(artifact?.connectorRef, fetchedConnectorResponse)

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

  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()

  const refetchConnectorList = async (): Promise<void> => {
    try {
      const response = await fetchConnectors({
        filterType: 'Connector',
        connectorIdentifiers: [getIdentifierFromValue(artifact.connectorRef as string)]
      })
      /* istanbul ignore else */
      if (response.data) {
        const { data: connectorResponse } = response
        setFetchedConnectorResponse(connectorResponse)
      }
    } catch (e) {
      /* istanbul ignore else */
      if (shouldShowError(e)) {
        showError(getRBACErrorMessage(e as RBACError))
      }
    }
  }

  useEffect(() => {
    if (artifact?.connectorRef) {
      refetchConnectorList()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artifact?.connectorRef])

  const getPrimaryArtifactRepository = useCallback(
    (_artifactType: ArtifactType): string => {
      if (_artifactType === ENABLED_ARTIFACT_TYPES.CustomArtifact) {
        return getString('common.repo_provider.customLabel')
      }
      return defaultTo(primaryConnectorName, artifact?.connectorRef)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [artifact?.connectorRef, primaryConnectorName]
  )

  return (
    <section className={cx(css.artifactList, css.rowItem)}>
      <div>{getString(ArtifactTitleIdByType[artifactType])}</div>
      <div className={css.connectorNameField}>
        <Icon padding={{ right: 'small' }} name={ArtifactIconByType[artifactType]} size={18} />
        <Text
          tooltip={
            <ArtifactRepositoryTooltip
              artifactConnectorName={primaryConnectorName}
              artifactConnectorRef={artifact?.connectorRef}
              artifactType={artifactType}
            />
          }
          tooltipProps={{ isDark: true }}
          alwaysShowTooltip={showConnectorStep(artifactType)}
          className={css.connectorName}
          lineClamp={1}
        >
          {getPrimaryArtifactRepository(artifactType)}
        </Text>

        <Icon name="full-circle" size={8} color={primaryConnectorColor} />
      </div>
      <div>
        <Text width={200} lineClamp={1} color={Color.GREY_500}>
          <span className={css.noWrap}>{getArtifactLocation(artifact, artifactType)}</span>
        </Text>
      </div>

      <Layout.Horizontal>
        <Button icon="Edit" minimal iconProps={{ size: 18 }} onClick={editArtifact} />
        <Button icon="main-trash" minimal iconProps={{ size: 18 }} onClick={deleteArtifact} />
      </Layout.Horizontal>
    </section>
  )
}

export default PrimaryArtifactView
