/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon } from '@harness/icons'
import { Button, Color, FontVariation, getMultiTypeFromValue, Layout, MultiTypeInputType, Text } from '@harness/uicore'
import cx from 'classnames'
import { getConnectorNameFromValue, getStatus } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { useStrings } from 'framework/strings'
import type { PageConnectorResponse, SidecarArtifact, SidecarArtifactWrapper } from 'services/cd-ng'
import { ArtifactIconByType, ArtifactTitleIdByType, ENABLED_ARTIFACT_TYPES, ModalViewFor } from '../../ArtifactHelper'
import type { ArtifactType } from '../../ArtifactInterface'
import { getArtifactLocation, showConnectorStep } from '../../ArtifactUtils'
import ArtifactRepositoryTooltip from '../ArtifactRepositoryTooltip'
import css from '../../ArtifactsSelection.module.scss'

interface SidecarArtifactsProps {
  accountId: string
  isReadonly: boolean
  fetchedConnectorResponse: PageConnectorResponse | undefined
  removeSidecar: (index: number) => void
  editArtifact: (view: ModalViewFor, type: ArtifactType, index: number) => void
  sideCarArtifact?: SidecarArtifactWrapper[]
  isMultiArtifactSource?: boolean
}

function SidecarArtifacts({
  sideCarArtifact,
  accountId,
  isReadonly,
  fetchedConnectorResponse,
  editArtifact,
  removeSidecar,
  isMultiArtifactSource
}: SidecarArtifactsProps): React.ReactElement | null {
  const { getString } = useStrings()

  if (!sideCarArtifact?.length) {
    return null
  }
  return (
    <section className={css.sidecarList}>
      {isMultiArtifactSource && (
        <div>
          <Text margin={{ bottom: 'xlarge' }} color={Color.GREY_800} font={{ weight: 'semi-bold', size: 'normal' }}>
            {getString('sidecarsText')}
          </Text>
          <div className={cx(css.artifactList, css.listHeader)}>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('common.ID')}</Text>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
              {getString('pipeline.artifactsSelection.artifactType')}
            </Text>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('artifactRepository')}</Text>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('location')}</Text>
            <span></span>
          </div>
        </div>
      )}
      {sideCarArtifact?.map(({ sidecar }: SidecarArtifactWrapper, index: number) => {
        const { color: sideCarConnectionColor } = getStatus(
          sidecar?.spec?.connectorRef,
          fetchedConnectorResponse,
          accountId
        )
        const sidecarConnectorName = getConnectorNameFromValue(sidecar?.spec?.connectorRef, fetchedConnectorResponse)

        const getSidecarArtifactRepository = (artifactType: ArtifactType): string => {
          if (artifactType === ENABLED_ARTIFACT_TYPES.CustomArtifact) {
            return getString('common.repo_provider.customLabel')
          }
          return sidecarConnectorName ?? sidecar?.spec?.connectorRef
        }

        return (
          <section className={cx(css.artifactList, css.rowItem)} key={`${sidecar?.identifier}-${index}`}>
            <div>
              <Text width={200} className={css.type} color={Color.BLACK} lineClamp={1}>
                {getString('sidecar')}
                <Text lineClamp={1} className={css.artifactId}>
                  ({getString('common.ID')}: {sidecar?.identifier})
                </Text>
              </Text>
            </div>
            <div>{getString(ArtifactTitleIdByType[sidecar?.type as ArtifactType])}</div>
            <div className={css.connectorNameField}>
              <Icon padding={{ right: 'small' }} name={ArtifactIconByType[sidecar?.type as ArtifactType]} size={18} />
              <Text
                className={css.connectorName}
                lineClamp={1}
                tooltip={
                  <ArtifactRepositoryTooltip
                    artifactConnectorName={sidecarConnectorName}
                    artifactConnectorRef={sidecar?.spec?.connectorRef}
                    artifactType={sidecar?.type as ArtifactType}
                  />
                }
                tooltipProps={{ isDark: true }}
                alwaysShowTooltip={showConnectorStep(sidecar?.type as ArtifactType)}
              >
                {getSidecarArtifactRepository(sidecar?.type as ArtifactType)}
              </Text>
              {getMultiTypeFromValue(sidecar?.spec?.connectorRef) === MultiTypeInputType.FIXED && (
                <Icon name="full-circle" size={8} color={sideCarConnectionColor} />
              )}
            </div>
            <div>
              <Text lineClamp={1} style={{ color: Color.GREY_500 }}>
                {getArtifactLocation(sidecar as SidecarArtifact)}
              </Text>
            </div>
            {!isReadonly && (
              <span>
                <Layout.Horizontal>
                  <Button
                    icon="Edit"
                    minimal
                    iconProps={{ size: 18 }}
                    onClick={() => {
                      editArtifact(ModalViewFor.SIDECAR, sidecar?.type as ArtifactType, index)
                    }}
                  />
                  <Button iconProps={{ size: 18 }} icon="main-trash" minimal onClick={() => removeSidecar(index)} />
                </Layout.Horizontal>
              </span>
            )}
          </section>
        )
      })}
    </section>
  )
}
export default SidecarArtifacts
