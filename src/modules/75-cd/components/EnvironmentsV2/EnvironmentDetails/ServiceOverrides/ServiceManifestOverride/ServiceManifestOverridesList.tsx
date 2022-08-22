/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Button, Color, FontVariation, Icon, Layout, Text } from '@harness/uicore'
import { get, isEmpty } from 'lodash-es'
import type { ManifestConfigWrapper } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { getManifestLocation } from '@pipeline/components/ManifestSelection/Manifesthelper'
import {
  ManifestIcons,
  ManifestLabels,
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
  return (
    <Layout.Vertical>
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
                    {manifest?.spec?.store.type}
                  </Text>

                  {!isEmpty(manifestLocation) && (
                    <span>
                      <Text lineClamp={1} width={200}>
                        {typeof manifestLocation === 'string' ? manifestLocation : manifestLocation.join(', ')}
                      </Text>
                    </span>
                  )}
                  {!isReadonly && (
                    <span>
                      <Layout.Horizontal>
                        <Button
                          icon="Edit"
                          iconProps={{ size: 18 }}
                          onClick={() =>
                            editManifestOverride(
                              manifest?.type as OverrideManifestTypes,
                              manifest?.spec?.store?.type as OverrideManifestStoresTypes,
                              index
                            )
                          }
                          minimal
                        />
                        <Button
                          iconProps={{ size: 18 }}
                          icon="main-trash"
                          onClick={() => removeManifestConfig(index)}
                          minimal
                        />
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
