/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { isEmpty, isEqual, omit } from 'lodash-es'
import { Icon, Layout, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { parse, yamlStringify } from '@common/utils/YamlHelperMethods'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import { Status } from '@common/utils/Constants'
import { useStrings } from 'framework/strings'
import type { EntityValidityDetails } from 'services/pipeline-ng'
import type { Pipeline as PipelineV1 } from 'services/pipeline-ng/index.v1'
import { useEnableEditModes } from '@pipeline/components/PipelineStudio/hooks/useEnableEditModes'
import { usePipelineSchemaV1 } from '../PipelineSchemaContextV1/PipelineSchemaContextV1'
import { usePipelineContextV1 } from '../PipelineContextV1/PipelineContextV1'
import { PluginsPanel } from '../../PluginsPanel/PluginsPanel'

import css from './PipelineYAMLViewV1.module.scss'

export const POLL_INTERVAL = 1 /* sec */ * 1000 /* ms */

let Interval: number | undefined
function PipelineYAMLViewV1(): React.ReactElement {
  const {
    state: { pipeline, pipelineView, entityValidityDetails },
    updatePipelineView,
    stepsFactory,
    isReadonly,
    updatePipeline,
    updateEntityValidityDetails,
    setYamlHandler: setYamlHandlerContext
  } = usePipelineContextV1()
  const { enableEditMode } = useEnableEditModes()
  const { pipelineSchema } = usePipelineSchemaV1()
  const [yamlHandler, setYamlHandler] = React.useState<YamlBuilderHandlerBinding | undefined>()
  const updateEntityValidityDetailsRef = React.useRef<(entityValidityDetails: EntityValidityDetails) => Promise<void>>()
  updateEntityValidityDetailsRef.current = updateEntityValidityDetails
  const [isEditorExpanded, setIsEditorExpanded] = useState<boolean>(true)
  const { getString } = useStrings()
  const [selectedEntity, setSelectedEntity] = useState<Record<string, any>>()
  const [entityAddUpdateOpnStatus, setEntityAddUpdateOpnStatus] = useState<Status>()

  // setup polling
  React.useEffect(() => {
    try {
      if (yamlHandler) {
        const { getLatestYaml, getYAMLValidationErrorMap } = yamlHandler
        Interval = window.setInterval(() => {
          try {
            // Do not call updatePipeline with undefined, pipelineFromYaml check in below if condition prevents that.
            // This can happen when somebody adds wrong yaml (e.g. connector's yaml) into pipeline yaml that is stored in Git
            // and opens pipeline in harness. At this time above line will evaluate to undefined
            const sanitizedPipelineYAMLAsJSON = parse<PipelineV1>(getLatestYaml())
            if (
              sanitizedPipelineYAMLAsJSON &&
              !isEqual(omit(pipeline, 'repo', 'branch'), sanitizedPipelineYAMLAsJSON) &&
              isEmpty(getYAMLValidationErrorMap()) // Don't update for Invalid Yaml
            ) {
              // eslint-disable-next-line
              // @ts-ignore
              updatePipeline(sanitizedPipelineYAMLAsJSON).then(() => {
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
  }, [yamlHandler, pipeline])

  React.useEffect(() => {
    if (yamlHandler) {
      setYamlHandlerContext(yamlHandler)
    }
  }, [yamlHandler, setYamlHandlerContext])

  React.useEffect(() => {
    updatePipelineView({ ...pipelineView, isYamlEditable: true })
  }, [])

  const yamlEditorCustomHeaderProp = useMemo(
    () =>
      isReadonly && {
        renderCustomHeader: () => {
          return isReadonly ? (
            <Layout.Horizontal spacing="xsmall" className={css.readOnlyCallout} flex>
              <Text font={{ variation: FontVariation.SMALL }}>{getString('common.readonlyPermissionsForFile')}</Text>
              <Icon name="info" size={15} />
            </Layout.Horizontal>
          ) : (
            <></>
          )
        }
      },
    [isReadonly]
  )

  return (
    <Layout.Horizontal>
      <YAMLBuilder
        entityType="Pipelines"
        fileName=""
        bind={setYamlHandler}
        yamlSanityConfig={{ removeEmptyString: false, removeEmptyObject: false, removeEmptyArray: false }}
        height={'calc(100vh - 150px)'}
        width={isEditorExpanded ? '50vw' : 'calc(100vw - 275px)'}
        onEnableEditMode={enableEditMode}
        shouldShowPluginsPanel={true}
        onEditorResize={(isExpanded: boolean) => setIsEditorExpanded(isExpanded)}
        invocationMap={stepsFactory.getInvocationMap()}
        schema={pipelineSchema?.data}
        setPlugin={setSelectedEntity}
        setPluginOpnStatus={setEntityAddUpdateOpnStatus}
        existingYaml={yamlStringify(pipeline)}
        {...yamlEditorCustomHeaderProp}
      />
      {yamlHandler && isEditorExpanded ? (
        <PluginsPanel
          height={'calc(100vh - 150px)'}
          onPluginAddUpdate={yamlHandler.addUpdatePluginIntoExistingYAML}
          onPluginDiscard={() => {
            setSelectedEntity(undefined)
            setEntityAddUpdateOpnStatus(Status.TO_DO)
          }}
          selectedPluginFromYAMLView={selectedEntity}
          pluginAddUpdateOpnStatus={entityAddUpdateOpnStatus}
        />
      ) : null}
    </Layout.Horizontal>
  )
}

export default PipelineYAMLViewV1
