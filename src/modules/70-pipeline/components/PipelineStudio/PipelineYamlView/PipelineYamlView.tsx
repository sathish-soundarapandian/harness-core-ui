/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, isEqual, omit } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { ButtonVariation, Checkbox, Tag, Text, useConfirmationDialog } from '@wings-software/uicore'
import { Intent } from '@blueprintjs/core'
import { parse } from '@common/utils/YamlHelperMethods'
import { YamlBuilderMemo } from '@common/components/YAMLBuilder/YamlBuilder'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import RbacButton from '@rbac/components/Button/Button'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { StoreType } from '@common/constants/GitSyncTypes'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { EntityValidityDetails } from 'services/pipeline-ng'
import { getYamlFileName } from '@pipeline/utils/yamlUtils'
import type { Pipeline } from '@pipeline/utils/types'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { usePipelineContext } from '../PipelineContext/PipelineContext'
import { useVariablesExpression } from '../PiplineHooks/useVariablesExpression'
import { usePipelineSchema } from '../PipelineSchema/PipelineSchemaContext'

import css from './PipelineYamlView.module.scss'

export const POLL_INTERVAL = 1 /* sec */ * 1000 /* ms */

let Interval: number | undefined
const defaultFileName = 'Pipeline.yaml'
function PipelineYamlView(): React.ReactElement {
  const {
    state: {
      pipeline,
      pipelineView: { isDrawerOpened, isYamlEditable },
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
  } = usePipelineContext()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      accountId: string
    }>
  >()
  const { preference, setPreference: setYamlAlwaysEditMode } = usePreferenceStore<string | undefined>(
    PreferenceScope.USER,
    'YamlAlwaysEditMode'
  )
  const userPreferenceEditMode = React.useMemo(() => defaultTo(Boolean(preference === 'true'), false), [preference])
  const { pipelineSchema } = usePipelineSchema()
  const { isGitSyncEnabled, isGitSimplificationEnabled } = useAppStore()
  const isPipelineRemote = isGitSimplificationEnabled && storeMetadata?.storeType === StoreType.REMOTE
  const [yamlHandler, setYamlHandler] = React.useState<YamlBuilderHandlerBinding | undefined>()
  const [yamlFileName, setYamlFileName] = React.useState<string>(defaultFileName)
  const [isAlwaysEditMode, setIsAlwaysEditMode] = React.useState<boolean>(userPreferenceEditMode)
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const expressionRef = React.useRef<string[]>([])
  expressionRef.current = expressions
  const updateEntityValidityDetailsRef = React.useRef<(entityValidityDetails: EntityValidityDetails) => Promise<void>>()
  updateEntityValidityDetailsRef.current = updateEntityValidityDetails

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
            const pipelineFromYaml = parse<Pipeline>(yamlHandler.getLatestYaml())?.pipeline
            if (
              (!isEqual(omit(pipeline, 'repo', 'branch'), pipelineFromYaml) ||
                entityValidityDetails?.valid === false) &&
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

  const onEnableEditMode = (didConfirm?: boolean): void => {
    updatePipelineView({ ...pipelineView, isYamlEditable: Boolean(didConfirm) })
    setYamlAlwaysEditMode(String(isAlwaysEditMode))
  }

  const yamlOrJsonProp =
    entityValidityDetails?.valid === false && entityValidityDetails?.invalidYaml
      ? { existingYaml: entityValidityDetails?.invalidYaml }
      : { existingJSON: { pipeline: omit(pipeline, 'repo', 'branch') } }

  React.useEffect(() => {
    !isYamlEditable && updatePipelineView({ ...pipelineView, isYamlEditable: userPreferenceEditMode })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preference])

  function EditModePreferenceComp(): JSX.Element {
    return (
      <div className={css.editModeCheckbox}>
        <Checkbox
          onChange={() => {
            setIsAlwaysEditMode(!isAlwaysEditMode)
            isYamlEditable && setYamlAlwaysEditMode(String(!isAlwaysEditMode))
          }}
          checked={isAlwaysEditMode}
          large
          label={getString('pipeline.alwaysEditModeYAML')}
        />
        {isAlwaysEditMode && !isYamlEditable && (
          <Text font={{ size: 'small' }} margin="small" intent="warning">
            {getString('pipeline.warningForInvalidYAMLDiscard')}
          </Text>
        )}
      </div>
    )
  }
  const { openDialog } = useConfirmationDialog({
    contentText: getString('yamlBuilder.enableEditContext'),
    titleText: getString('confirm'),
    confirmButtonText: getString('enable'),
    cancelButtonText: getString('cancel'),
    intent: Intent.WARNING,
    children: <EditModePreferenceComp />,
    onCloseDialog: (didConfirm): void => {
      if (didConfirm) {
        onEnableEditMode?.(didConfirm)
      }
    }
  })

  return (
    <div className={css.yamlBuilder}>
      <>
        {!isDrawerOpened && (
          <YamlBuilderMemo
            key={isYamlEditable.toString()}
            fileName={isPipelineRemote ? remoteFileName : defaultTo(yamlFileName, defaultFileName)}
            entityType="Pipelines"
            isReadOnlyMode={isReadonly || !isYamlEditable}
            bind={setYamlHandler}
            showSnippetSection={false}
            onExpressionTrigger={() => {
              return Promise.resolve(
                expressionRef.current.map(item => ({ label: item, insertText: `${item}>`, kind: 1 }))
              )
            }}
            yamlSanityConfig={{ removeEmptyString: false, removeEmptyObject: false, removeEmptyArray: false }}
            height={'calc(100vh - 200px)'}
            width="calc(100vw - 400px)"
            invocationMap={stepsFactory.getInvocationMap()}
            schema={pipelineSchema?.data}
            onEnableEditMode={onEnableEditMode}
            isEditModeSupported={!isReadonly}
            openDialogProp={openDialog}
            {...yamlOrJsonProp}
          />
        )}
      </>
      {isReadonly || !isYamlEditable ? (
        <div className={css.buttonsWrapper}>
          <Tag>{getString('common.readOnly')}</Tag>
          <RbacButton
            permission={{
              resourceScope: {
                accountIdentifier: accountId,
                orgIdentifier,
                projectIdentifier
              },
              resource: {
                resourceType: ResourceType.PIPELINE,
                resourceIdentifier: pipeline?.identifier as string
              },
              permission: PermissionIdentifier.EDIT_PIPELINE
            }}
            variation={ButtonVariation.SECONDARY}
            text={getString('common.editYaml')}
            onClick={() => {
              openDialog()
            }}
          />
        </div>
      ) : (
        <div className={css.buttonsWrapper}>
          <EditModePreferenceComp />
        </div>
      )}
    </div>
  )
}

export default PipelineYamlView
