/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Button, ButtonVariation, Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import type { ConfigFileWrapper } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import useFileStoreModal from '@filestore/components/FileStoreComponent/FileStoreComponent'
import {
  ConfigFileIconByType,
  ConfigFileTypeTitle,
  ConfigFilesMap
} from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import type { ConfigFileType } from '@pipeline/components/ConfigFilesSelection/ConfigFilesInterface'
import { LocationValue } from '@pipeline/components/ConfigFilesSelection/ConfigFilesListView/LocationValue'
import css from './ServiceConfigFileOverridesList.module.scss'

interface ServiceConfigFileOverridesListProps {
  configFileOverrideList: ConfigFileWrapper[]
  isReadonly: boolean
  editFileOverride: (index: number) => void
  handleServiceFileDelete?: (index: number) => void
  isServiceOverride?: boolean
}

function ServiceConfigFileOverridesList({
  configFileOverrideList,
  isReadonly,
  editFileOverride,
  handleServiceFileDelete,
  isServiceOverride
}: ServiceConfigFileOverridesListProps): React.ReactElement {
  const { getString } = useStrings()
  const { openFileStoreModal } = useFileStoreModal({ isReadonly: true })

  return (
    <Layout.Vertical width={'100%'}>
      {!!configFileOverrideList?.length && (
        <>
          <div className={cx(css.configFileList, css.listHeader)}>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('common.ID')}</Text>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('pipeline.configFiles.fileType')}</Text>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
              {getString('pipelineSteps.serviceTab.manifestList.manifestStore')}
            </Text>
            {!isServiceOverride && (
              <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('location')}</Text>
            )}
          </div>
          {configFileOverrideList?.length > 0 &&
            configFileOverrideList?.map(({ configFile }: ConfigFileWrapper, index: number) => {
              const isHarnessStore = configFile?.spec.store.type === ConfigFilesMap.Harness
              const isFileStore = !!configFile?.spec?.store?.spec?.files?.length
              const filesType = isHarnessStore
                ? configFile?.spec?.store?.spec?.files?.length
                  ? getString('pipeline.configFiles.plainText')
                  : getString('encrypted')
                : 'Git'

              const pathsLocation = configFile?.spec?.store?.spec?.paths

              const filesLocation = isHarnessStore
                ? configFile?.spec?.store?.spec?.files?.length
                  ? configFile?.spec?.store?.spec?.files
                  : configFile?.spec?.store?.spec?.secretFiles
                : pathsLocation

              return (
                <div className={css.rowItem} key={`${configFile?.identifier}-${index}`}>
                  <section className={css.configFileList}>
                    <div className={css.columnId}>
                      <Text color={Color.BLACK} lineClamp={1} width={150}>
                        {configFile?.identifier}
                      </Text>
                    </div>
                    <div>{filesType}</div>
                    <div className={css.columnId}>
                      <Icon
                        inline
                        name={ConfigFileIconByType[configFile?.spec?.store?.type as ConfigFileType]}
                        size={20}
                      />
                      <Text
                        margin={{ left: 'xsmall' }}
                        inline
                        width={150}
                        className={css.type}
                        color={Color.BLACK}
                        lineClamp={1}
                      >
                        {getString(ConfigFileTypeTitle[configFile?.spec?.store?.type as ConfigFileType])}
                      </Text>
                    </div>
                    {!isServiceOverride && (
                      <span>
                        <Text
                          lineClamp={1}
                          width={200}
                          tooltip={
                            Array.isArray(filesLocation) ? (
                              <LocationValue
                                isTooltip
                                isHarnessStore={isHarnessStore}
                                locations={isHarnessStore ? filesLocation : pathsLocation}
                                onClick={openFileStoreModal}
                                isFileStore={isFileStore}
                              />
                            ) : (
                              filesLocation
                            )
                          }
                        >
                          {typeof filesLocation === 'string' ? (
                            filesLocation
                          ) : (
                            <LocationValue
                              isFileStore={isFileStore}
                              isHarnessStore={isHarnessStore}
                              locations={isHarnessStore ? filesLocation : pathsLocation}
                              onClick={openFileStoreModal}
                            />
                          )}
                        </Text>
                      </span>
                    )}
                    {!isReadonly && (
                      <>
                        {isServiceOverride ? (
                          <span>
                            <Button
                              variation={ButtonVariation.PRIMARY}
                              rightIcon="chevron-right"
                              text={getString('common.override')}
                              onClick={() => editFileOverride(index)}
                            />
                          </span>
                        ) : (
                          <span>
                            <Layout.Horizontal>
                              <Button icon="Edit" onClick={() => editFileOverride(index)} minimal />
                              <Button icon="main-trash" onClick={() => handleServiceFileDelete?.(index)} minimal />
                            </Layout.Horizontal>
                          </span>
                        )}
                      </>
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

export default ServiceConfigFileOverridesList
