/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text, Button, ButtonSize, ButtonVariation, Label, HarnessDocTooltip } from '@harness/uicore'
import cx from 'classnames'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import type { ArtifactListViewProps } from '../ArtifactInterface'
import PrimaryArtifactView from './PrimaryArtifact/PrimaryArtifactView'
import css from '../ArtifactsSelection.module.scss'

function ArtifactListView({
  artifacts,
  artifactType,
  editArtifact,
  deleteArtifact,
  addNewArtifact
}: ArtifactListViewProps): React.ReactElement {
  const { getString } = useStrings()
  const isArtifactsAdded = artifacts?.length !== 0

  const CDS_NG_TRIGGER_MULTI_ARTIFACTS = useFeatureFlag(FeatureFlag.CDS_NG_TRIGGER_MULTI_ARTIFACTS)

  return (
    <Layout.Vertical
      style={{ flexShrink: 'initial', width: '100%' }}
      flex={{ alignItems: 'flex-start' }}
      spacing="medium"
    >
      <div>
        {CDS_NG_TRIGGER_MULTI_ARTIFACTS ? (
          <>
            <Label
              style={{
                fontSize: 13,
                color: 'var(--form-label)',
                fontWeight: 'normal',
                marginBottom: 'var(--spacing-small)'
              }}
              data-tooltip-id={'selectArtifactManifestLabel'}
            >
              {getString('pipeline.artifactTriggerConfigPanel.artifact')}
              <HarnessDocTooltip tooltipId="selectArtifactManifestLabel" useStandAlone={true} />
            </Label>
            <Button
              className={css.addArtifact}
              id="add-artifact"
              size={ButtonSize.SMALL}
              variation={ButtonVariation.LINK}
              onClick={() => addNewArtifact()}
              text={getString('pipeline.artifactTriggerConfigPanel.defineArtifactSource')}
              margin={isArtifactsAdded ? { bottom: 'large' } : {}}
            />
            {isArtifactsAdded && (
              <>
                <div className={cx(css.artifactList, css.listHeader)}>
                  <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
                    {getString('pipeline.artifactsSelection.artifactType')}
                  </Text>
                  <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('artifactRepository')}</Text>
                  <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('location')}</Text>
                </div>
                {artifacts?.map((artifact, index) => (
                  <PrimaryArtifactView
                    key={index}
                    artifact={artifact}
                    artifactType={artifactType}
                    deleteArtifact={deleteArtifact}
                    editArtifact={editArtifact}
                  />
                ))}
              </>
            )}
          </>
        ) : (
          <>
            {!isArtifactsAdded ? (
              <>
                <Label
                  style={{
                    fontSize: 13,
                    color: 'var(--form-label)',
                    fontWeight: 'normal',
                    marginBottom: 'var(--spacing-small)'
                  }}
                  data-tooltip-id={'selectArtifactManifestLabel'}
                >
                  {getString('pipeline.artifactTriggerConfigPanel.artifact')}
                  <HarnessDocTooltip tooltipId="selectArtifactManifestLabel" useStandAlone={true} />
                </Label>
                <Button
                  className={css.addArtifact}
                  id="add-artifact"
                  size={ButtonSize.SMALL}
                  variation={ButtonVariation.LINK}
                  onClick={() => addNewArtifact()}
                  text={getString('pipeline.artifactTriggerConfigPanel.defineArtifactSource')}
                />
              </>
            ) : (
              <>
                <div className={cx(css.artifactList, css.listHeader)}>
                  <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
                    {getString('pipeline.artifactsSelection.artifactType')}
                  </Text>
                  <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('artifactRepository')}</Text>
                  <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('location')}</Text>
                </div>
                {artifacts?.map((artifact, index) => (
                  <PrimaryArtifactView
                    key={index}
                    artifact={artifact}
                    artifactType={artifactType}
                    deleteArtifact={deleteArtifact}
                    editArtifact={editArtifact}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </Layout.Vertical>
  )
}

export default ArtifactListView
