/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import { Button, Color, Icon, Layout, Text } from '@harness/uicore'
import cx from 'classnames'
import { defaultTo } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { PageConnectorResponse, PrimaryArtifact } from 'services/cd-ng'
import { getConnectorNameFromValue, getStatus } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { ArtifactIconByType, ArtifactTitleIdByType, ENABLED_ARTIFACT_TYPES } from '../../ArtifactHelper'
import ArtifactRepositoryTooltip from '../ArtifactRepositoryTooltip'
import type { ArtifactType } from '../../ArtifactInterface'
import { getArtifactLocation, showConnectorStep } from '../../ArtifactUtils'
import css from '../../ArtifactsSelection.module.scss'

interface PrimaryArtifactViewProps {
  primaryArtifact: PrimaryArtifact
  accountId: string
  fetchedConnectorResponse: PageConnectorResponse | undefined
  editArtifact: () => void
  deleteArtifact: () => void
}

function PrimaryArtifactView({
  primaryArtifact,
  accountId,
  fetchedConnectorResponse,
  editArtifact,
  deleteArtifact
}: PrimaryArtifactViewProps): React.ReactElement {
  const { getString } = useStrings()
  const primaryArtifactType = primaryArtifact?.type as ArtifactType

  const { color: primaryConnectorColor } = getStatus(
    primaryArtifact?.spec?.connectorRef,
    fetchedConnectorResponse,
    accountId
  )
  const primaryConnectorName = getConnectorNameFromValue(primaryArtifact?.spec?.connectorRef, fetchedConnectorResponse)

  const getPrimaryArtifactRepository = useCallback(
    (artifactType: ArtifactType): string => {
      if (artifactType === ENABLED_ARTIFACT_TYPES.CustomArtifact) {
        return getString('common.repo_provider.customLabel')
      }
      return defaultTo(primaryConnectorName, primaryArtifact?.spec?.connectorRef)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [primaryArtifact?.spec?.connectorRef, primaryConnectorName]
  )

  return (
    <section className={cx(css.artifactList, css.rowItem)}>
      <div>{getString(ArtifactTitleIdByType[primaryArtifactType])}</div>
      <div className={css.connectorNameField}>
        <Icon padding={{ right: 'small' }} name={ArtifactIconByType[primaryArtifactType]} size={18} />
        <Text
          tooltip={
            <ArtifactRepositoryTooltip
              artifactConnectorName={primaryConnectorName}
              artifactConnectorRef={primaryArtifact.spec?.connectorRef}
              artifactType={primaryArtifactType}
            />
          }
          tooltipProps={{ isDark: true }}
          alwaysShowTooltip={showConnectorStep(primaryArtifactType)}
          className={css.connectorName}
          lineClamp={1}
        >
          {getPrimaryArtifactRepository(primaryArtifactType)}
        </Text>

        <Icon name="full-circle" size={8} color={primaryConnectorColor} />
      </div>
      <div>
        <Text width={200} lineClamp={1} color={Color.GREY_500}>
          <span className={css.noWrap}>{getArtifactLocation(primaryArtifact)}</span>
        </Text>
      </div>

      <Layout.Horizontal>
        <Button icon="Edit" minimal iconProps={{ size: 18 }} onClick={() => editArtifact()} />
        <Button iconProps={{ size: 18 }} minimal icon="main-trash" onClick={deleteArtifact} />
      </Layout.Horizontal>
    </section>
  )
}

export default PrimaryArtifactView
