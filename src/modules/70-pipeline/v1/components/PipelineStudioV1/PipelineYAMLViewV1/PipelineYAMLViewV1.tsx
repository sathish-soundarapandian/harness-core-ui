/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { defaultTo, isEqual, omit } from 'lodash-es'
import { parse } from '@common/utils/YamlHelperMethods'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { StoreType } from '@common/constants/GitSyncTypes'
import type { EntityValidityDetails, PipelineInfoConfig } from 'services/pipeline-ng'
import { getYamlFileName } from '@pipeline/utils/yamlUtils'
import { useEnableEditModes } from '@pipeline/components/PipelineStudio/hooks/useEnableEditModes'
import { usePipelineSchemaV1 } from '../PipelineSchemaContextV1/PipelineSchemaContextV1'
import { usePipelineContextV1 } from '../PipelineContextV1/PipelineContextV1'

import css from './PipelineYAMLViewV1.module.scss'

export const POLL_INTERVAL = 1 /* sec */ * 1000 /* ms */

let Interval: number | undefined
const defaultFileName = 'Pipeline.yaml'
function PipelineYAMLViewV1(): React.ReactElement {
  const {
    state: {
      pipeline,
      pipelineView: { isDrawerOpened },
      pipelineView,
      gitDetails,
      entityValidityDetails,
      storeMetadata
    },
    updatePipelineView,
    stepsFactory,
    isReadonly,
    updatePipeline,
    updateEntityValidityDetails,
    setYamlHandler: setYamlHandlerContext
  } = usePipelineContextV1()
  const { enableEditMode } = useEnableEditModes()
  const { pipelineSchema } = usePipelineSchemaV1()
  const {
    isGitSyncEnabled: isGitSyncEnabledForProject,
    gitSyncEnabledOnlyForFF,
    supportingGitSimplification
  } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const isPipelineRemote = supportingGitSimplification && storeMetadata?.storeType === StoreType.REMOTE
  const [yamlHandler, setYamlHandler] = React.useState<YamlBuilderHandlerBinding | undefined>()
  const [yamlFileName, setYamlFileName] = React.useState<string>(defaultFileName)
  const updateEntityValidityDetailsRef = React.useRef<(entityValidityDetails: EntityValidityDetails) => Promise<void>>()
  updateEntityValidityDetailsRef.current = updateEntityValidityDetails
  const [shouldShowPluginsPanel, setShouldShowPluginsPanel] = useState<boolean>(!isReadonly)

  const remoteFileName = React.useMemo(
    () =>
      getYamlFileName({
        isPipelineRemote,
        filePath: gitDetails?.filePath,
        defaultName: defaultFileName
      }),
    [gitDetails?.filePath, isPipelineRemote]
  )

  // setup polling
  React.useEffect(() => {
    try {
      if (yamlHandler && !isDrawerOpened) {
        Interval = window.setInterval(() => {
          try {
            const pipelineFromYaml = parse<PipelineInfoConfig>(yamlHandler.getLatestYaml())
            // Do not call updatePipeline with undefined, pipelineFromYaml check in below if condition prevents that.
            // This can happen when somebody adds wrong yaml (e.g. connector's yaml) into pipeline yaml that is stored in Git
            // and opens pipeline in harness. At this time above line will evaluate to undefined
            if (
              pipelineFromYaml &&
              !isEqual(omit(pipeline, 'repo', 'branch'), pipelineFromYaml) &&
              yamlHandler.getYAMLValidationErrorMap()?.size === 0 // Don't update for Invalid Yaml
            ) {
              updatePipeline(pipelineFromYaml).then(() => {
                if (entityValidityDetails?.valid === false) {
                  updateEntityValidityDetailsRef.current?.({ ...entityValidityDetails, valid: true, invalidYaml: '' })
                }
              })
            }
          } catch (e) {
            // Ignore Error
          }
        }, POLL_INTERVAL)
        return () => {
          window.clearInterval(Interval)
        }
      }
    } catch (e) {
      // Ignore Error
    }
  }, [yamlHandler, pipeline, isDrawerOpened])

  React.useEffect(() => {
    if (yamlHandler) {
      setYamlHandlerContext(yamlHandler)
    }
  }, [yamlHandler, setYamlHandlerContext])

  React.useEffect(() => {
    if (isGitSyncEnabled && !isPipelineRemote) {
      if (gitDetails?.objectId) {
        const filePathArr = gitDetails.filePath?.split('/')
        const fileName = filePathArr?.length ? filePathArr[filePathArr?.length - 1] : 'Pipeline.yaml'
        setYamlFileName(fileName)
      }
      setYamlFileName(pipeline?.identifier + '.yaml')
    }
  }, [gitDetails, isGitSyncEnabled, isPipelineRemote, pipeline?.identifier])

  const yamlOrJsonProp =
    entityValidityDetails?.valid === false && entityValidityDetails?.invalidYaml
      ? { existingYaml: entityValidityDetails?.invalidYaml }
      : { existingJSON: pipeline }

  React.useEffect(() => {
    updatePipelineView({ ...pipelineView, isYamlEditable: true })
  }, [])

  return (
    <div className={css.yamlBuilder}>
      <>
        {!isDrawerOpened && (
          <YAMLBuilder
            fileName={isPipelineRemote ? remoteFileName : defaultTo(yamlFileName, defaultFileName)}
            entityType="Pipelines"
            isReadOnlyMode={isReadonly}
            bind={setYamlHandler}
            yamlSanityConfig={{ removeEmptyString: false, removeEmptyObject: false, removeEmptyArray: false }}
            height={shouldShowPluginsPanel ? 'calc(100vh - 150px)' : 'calc(100vh - 210px)'}
            width={shouldShowPluginsPanel ? '50vw' : 'calc(100vw - 400px)'}
            onEnableEditMode={enableEditMode}
            shouldShowPluginsPanel={shouldShowPluginsPanel}
            toggleResizeButton={() => setShouldShowPluginsPanel((shouldRender: boolean) => !shouldRender)}
            invocationMap={stepsFactory.getInvocationMap()}
            schema={pipelineSchema?.data}
            isEditModeSupported={!isReadonly}
            {...yamlOrJsonProp}
            customCss={shouldShowPluginsPanel ? undefined : css.editorLayout}
          />
        )}
      </>
    </div>
  )
}

export default PipelineYAMLViewV1
