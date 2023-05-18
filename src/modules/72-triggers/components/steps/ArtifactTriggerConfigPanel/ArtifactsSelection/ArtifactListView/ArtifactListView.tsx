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

const ArtifactTable = ({
  artifactSpecSources,
  artifactType,
  editArtifact,
  deleteArtifact
}: ArtifactListViewProps): React.ReactElement => {
  const { getString } = useStrings()

  return (
    <>
      <div className={cx(css.artifactList, css.listHeader)}>
        <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
          {getString('pipeline.artifactsSelection.artifactType')}
        </Text>
        <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('artifactRepository')}</Text>
        <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('location')}</Text>
      </div>
      {artifactSpecSources.map((artifactSpecSource, index) => (
        <PrimaryArtifactView
          key={index}
          artifact={artifactSpecSource.spec}
          artifactType={artifactType}
          deleteArtifact={() => {
            deleteArtifact(index)
          }}
          editArtifact={() => {
            editArtifact(index)
          }}
        />
      ))}
    </>
  )
}

function ArtifactListView(props: ArtifactListViewProps): React.ReactElement {
  const { artifactSpecSources, artifactType, addNewArtifact } = props
  const { getString } = useStrings()
  const isArtifactSelected = artifactSpecSources.length !== 0
  const isMultiRegionArtifact =
    useFeatureFlag(FeatureFlag.CDS_NG_TRIGGER_MULTI_ARTIFACTS) && artifactType !== 'CustomArtifact'
  const artifactLabel =
    artifactSpecSources.length > 1
      ? getString('pipeline.artifactTriggerConfigPanel.artifacts')
      : getString('pipeline.artifactTriggerConfigPanel.artifact')
  const buttonText =
    isArtifactSelected && isMultiRegionArtifact
      ? getString('pipeline.artifactTriggerConfigPanel.defineMultiRegionArtifactSource')
      : getString('pipeline.artifactTriggerConfigPanel.defineArtifactSource')

  return (
    <Layout.Vertical
      style={{ flexShrink: 'initial', width: '100%' }}
      flex={{ alignItems: 'flex-start' }}
      spacing="medium"
    >
      <div>
        {isMultiRegionArtifact ? (
          <>
            <div
              style={
                isArtifactSelected ? { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' } : {}
              }
            >
              <Label
                style={{
                  fontSize: 13,
                  color: 'var(--form-label)',
                  fontWeight: 'normal',
                  marginBottom: 'var(--spacing-small)'
                }}
                data-tooltip-id={'selectArtifactManifestLabel'}
              >
                {artifactLabel}
                <HarnessDocTooltip tooltipId="selectArtifactManifestLabel" useStandAlone={true} />
              </Label>
              <Button
                className={css.addArtifact}
                id="add-artifact"
                size={ButtonSize.SMALL}
                variation={ButtonVariation.LINK}
                onClick={() => addNewArtifact()}
                text={buttonText}
                margin={isArtifactSelected ? { bottom: 'large' } : {}}
              />
            </div>
            {isArtifactSelected && <ArtifactTable {...props} />}
          </>
        ) : (
          <>
            {!isArtifactSelected ? (
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
                  {artifactLabel}
                  <HarnessDocTooltip tooltipId="selectArtifactManifestLabel" useStandAlone={true} />
                </Label>
                <Button
                  className={css.addArtifact}
                  id="add-artifact"
                  size={ButtonSize.SMALL}
                  variation={ButtonVariation.LINK}
                  onClick={() => addNewArtifact()}
                  text={buttonText}
                />
              </>
            ) : (
              <ArtifactTable {...props} />
            )}
          </>
        )}
      </div>
    </Layout.Vertical>
  )
}

export default ArtifactListView
