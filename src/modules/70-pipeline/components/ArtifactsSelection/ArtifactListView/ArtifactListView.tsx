/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text, Button, ButtonSize, ButtonVariation } from '@harness/uicore'
import cx from 'classnames'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import type { ArtifactSource, PrimaryArtifact } from 'services/cd-ng'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { isPrimaryAdditionAllowed, ModalViewFor } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import RbacButton from '@rbac/components/Button/Button'
import type { ArtifactListViewProps } from '../ArtifactInterface'
import PrimaryArtifactSources from './PrimaryArtifactSources/PrimaryArtifactSources'
import PrimaryArtifactView from './PrimaryArtifact/PrimaryArtifactView'
import SidecarArtifacts from './SidecarArtifacts/SidecarArtifacts'
import css from '../ArtifactsSelection.module.scss'

interface Params {
  handleClick: () => void
}

function AddArtifactSourceTemplateSection({ handleClick }: Params) {
  const { getString } = useStrings()

  return (
    <>
      <div className={css.btnDivider} />
      <RbacButton
        text={getString('common.useTemplate')}
        variation={ButtonVariation.LINK}
        size={ButtonSize.SMALL}
        className={css.addArtifactSourceTemplateBtn}
        margin={{ left: 'none' }}
        minimal={true}
        icon="template-library"
        iconProps={{ size: 12 }}
        onClick={handleClick}
        featuresProps={{
          featuresRequest: {
            featureNames: [FeatureIdentifier.TEMPLATE_SERVICE]
          }
        }}
      />
    </>
  )
}

function ArtifactListView({
  accountId,
  fetchedConnectorResponse,
  primaryArtifact,
  sideCarArtifact,
  isReadonly,
  editArtifact,
  removePrimary,
  removeArtifactSource,
  removeSidecar,
  addNewArtifact,
  isSidecarAllowed,
  isMultiArtifactSource,
  handleUseArtifactSourceTemplate
}: ArtifactListViewProps): React.ReactElement {
  const { getString } = useStrings()
  const commonArtifactProps = {
    isReadonly,
    accountId,
    fetchedConnectorResponse,
    editArtifact
  }
  const areArtifactSourceTemplatesEnabled = useFeatureFlag(FeatureFlag.ARTIFACT_SOURCE_TEMPLATE)

  return (
    <Layout.Vertical style={{ width: '100%' }}>
      <Layout.Vertical spacing="small" style={{ flexShrink: 'initial' }}>
        {!isMultiArtifactSource && (sideCarArtifact?.length || (primaryArtifact as PrimaryArtifact)?.type) && (
          <div className={cx(css.artifactList, css.listHeader)}>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('common.ID')}</Text>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
              {getString('pipeline.artifactsSelection.artifactType')}
            </Text>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('artifactRepository')}</Text>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('location')}</Text>
            <span></span>
          </div>
        )}

        <Layout.Vertical style={{ flexShrink: 'initial' }} flex={{ alignItems: 'flex-start' }} spacing="medium">
          <>
            {isMultiArtifactSource ? (
              <PrimaryArtifactSources
                artifactSources={primaryArtifact as ArtifactSource[]}
                removeArtifactSource={removeArtifactSource}
                {...commonArtifactProps}
              />
            ) : (
              <PrimaryArtifactView
                primaryArtifact={primaryArtifact as PrimaryArtifact}
                removePrimary={removePrimary}
                {...commonArtifactProps}
              />
            )}
            {!isReadonly && isPrimaryAdditionAllowed(primaryArtifact, isMultiArtifactSource) && (
              <Layout.Horizontal spacing="medium">
                <Button
                  className={css.addArtifact}
                  id="add-artifact"
                  size={ButtonSize.SMALL}
                  icon="plus"
                  variation={ButtonVariation.LINK}
                  margin={isMultiArtifactSource && sideCarArtifact?.length && { bottom: 'xxlarge' }}
                  onClick={() => addNewArtifact(ModalViewFor.PRIMARY)}
                  text={
                    isMultiArtifactSource
                      ? getString('pipeline.artifactsSelection.addArtifactSource')
                      : getString('pipeline.artifactsSelection.addPrimaryArtifact')
                  }
                />
                {areArtifactSourceTemplatesEnabled && handleUseArtifactSourceTemplate && (
                  <AddArtifactSourceTemplateSection
                    handleClick={() => {
                      handleUseArtifactSourceTemplate(ModalViewFor.PRIMARY)
                    }}
                  />
                )}
              </Layout.Horizontal>
            )}
          </>
          <>
            <SidecarArtifacts
              isMultiArtifactSource={isMultiArtifactSource}
              sideCarArtifact={sideCarArtifact}
              removeSidecar={removeSidecar}
              {...commonArtifactProps}
            />
            {!isReadonly && isSidecarAllowed && (
              <Layout.Horizontal spacing="medium">
                <Button
                  className={css.addArtifact}
                  id="add-artifact"
                  icon="plus"
                  size={ButtonSize.SMALL}
                  variation={ButtonVariation.LINK}
                  onClick={() => addNewArtifact(ModalViewFor.SIDECAR)}
                  text={getString('pipeline.artifactsSelection.addSidecar')}
                />
                {areArtifactSourceTemplatesEnabled && handleUseArtifactSourceTemplate && (
                  <AddArtifactSourceTemplateSection
                    handleClick={() => {
                      handleUseArtifactSourceTemplate(ModalViewFor.SIDECAR)
                    }}
                  />
                )}
              </Layout.Horizontal>
            )}
          </>
        </Layout.Vertical>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default ArtifactListView
