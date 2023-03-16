/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Button, Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { get, isEmpty, isArray } from 'lodash-es'
import type { ManifestConfigWrapper } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import useFileStoreModal from '@filestore/components/FileStoreComponent/FileStoreComponent'
import { getManifestLocation, ManifestStoreMap } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { LocationValue } from '@pipeline/components/ConfigFilesSelection/ConfigFilesListView/LocationValue'

import {
  ManifestIcons,
  ManifestLabels,
  OverrideManifests,
  OverrideManifestStoresTypes,
  OverrideManifestTypes
} from './ServiceManifestOverrideUtils'

import css from './ServiceManifestOverride.module.scss'

interface ServiceManifestOverridesListProps {
  manifestOverridesList: ManifestConfigWrapper[]
  isReadonly: boolean
  editManifestOverride: (manifestType: OverrideManifestTypes, store: OverrideManifestStoresTypes, index: number) => void
  removeManifestConfig: (index: number) => void
}

function ServiceManifestOverridesList({
  manifestOverridesList,
  isReadonly,
  editManifestOverride,
  removeManifestConfig
}: ServiceManifestOverridesListProps): React.ReactElement {
  const { getString } = useStrings()

  const { openFileStoreModal } = useFileStoreModal({ isReadonly: true })

  return (
    <Layout.Vertical width={'100%'}>
      {!!manifestOverridesList?.length && (
        <>
          <div className={cx(css.manifestList, css.listHeader)}>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('common.ID')}</Text>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
              {getString('pipelineSteps.serviceTab.manifestList.manifestType')}
            </Text>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
              {getString('pipelineSteps.serviceTab.manifestList.manifestStore')}
            </Text>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('location')}</Text>
            <span></span>
          </div>
          {manifestOverridesList?.map(({ manifest }: ManifestConfigWrapper, index: number) => {
            const manifestLocation = get(
              manifest?.spec,
              getManifestLocation(manifest?.type as OverrideManifestTypes, manifest?.spec?.store?.type)
            )

            const isHarnessStore = manifest?.spec?.store?.type === ManifestStoreMap.Harness

            return (
              <div className={css.rowItem} key={`${manifest?.identifier}-${index}`}>
                <section className={css.manifestList}>
                  <div className={css.columnId}>
                    <Icon inline name={ManifestIcons[manifest?.type as OverrideManifestTypes]} size={20} />
                    <Text inline width={150} className={css.type} color={Color.BLACK} lineClamp={1}>
                      {manifest?.identifier}
                    </Text>
                  </div>
                  <div>{getString(ManifestLabels[manifest?.type as OverrideManifestTypes])}</div>
                  <Text inline width={150} className={css.type} color={Color.BLACK} lineClamp={1}>
                    {manifest?.type !== OverrideManifests.HelmRepoOverride
                      ? manifest?.spec?.store.type
                      : manifest?.spec?.type}
                  </Text>

                  {manifest?.type === OverrideManifests.HelmRepoOverride && (
                    <span>
                      <Text width={200} lineClamp={1}>
                        {getString('pipeline.manifestType.helmRepoOverride.locationText')}
                      </Text>
                    </span>
                  )}
                  {!isEmpty(manifestLocation) && (
                    <span>
                      <Text
                        lineClamp={1}
                        width={200}
                        tooltip={
                          isArray(manifestLocation) ? (
                            <LocationValue
                              isTooltip
                              isHarnessStore={isHarnessStore}
                              locations={manifestLocation}
                              onClick={openFileStoreModal}
                            />
                          ) : (
                            manifestLocation
                          )
                        }
                      >
                        {typeof manifestLocation === 'string'
                          ? manifestLocation
                          : isArray(manifestLocation) && (
                              <LocationValue
                                locations={manifestLocation}
                                isHarnessStore={isHarnessStore}
                                onClick={openFileStoreModal}
                              />
                            )}
                      </Text>
                    </span>
                  )}
                  {!isReadonly && (
                    <span>
                      <Layout.Horizontal>
                        <Button
                          icon="Edit"
                          onClick={() =>
                            editManifestOverride(
                              manifest?.type as OverrideManifestTypes,
                              manifest?.spec?.store?.type as OverrideManifestStoresTypes,
                              index
                            )
                          }
                          minimal
                        />
                        <Button icon="main-trash" onClick={() => removeManifestConfig(index)} minimal />
                      </Layout.Horizontal>
                    </span>
                  )}
                </section>
              </div>
            )
          })}
        </>
      )}
    </Layout.Vertical>
  )
}

export default ServiceManifestOverridesList
