/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import {
  ButtonSize,
  ButtonVariation,
  Container,
  Dialog,
  Layout,
  Text,
  useConfirmationDialog,
  useToaster,
  Button
} from '@harness/uicore'
import { Color, FontVariation, Intent } from '@harness/design-system'
import { useModalHook } from '@harness/use-modal'
import { useHistory, useParams } from 'react-router-dom'
import { defaultTo, get, isNil, pick } from 'lodash-es'
import type { InputSetDTO } from '@pipeline/utils/types'
import { ReconcileDialog } from '@pipeline/components/InputSetErrorHandling/ReconcileDialog/ReconcileDialog'
import {
  EntityGitDetails,
  InputSetResponse,
  useDeleteInputSetForPipeline,
  useUpdateInputSetForPipeline,
  useUpdateOverlayInputSetForPipeline,
  useYamlDiffForInputSet
} from 'services/pipeline-ng'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import type { InputSetGitQueryParams, InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import RbacButton from '@rbac/components/Button/Button'
import { useStrings } from 'framework/strings'
import { yamlParse, yamlStringify } from '@common/utils/YamlHelperMethods'
import routes from '@common/RouteDefinitions'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { OverlayInputSetDTO } from '@pipeline/components/OverlayInputSetForm/OverlayInputSetForm'
import { useSaveInputSetOrOverlayInpSet } from '../utils'
import css from './OutOfSyncErrorStrip.module.scss'

interface OutOfSyncErrorStripProps {
  inputSet: InputSetDTO | OverlayInputSetDTO
  pipelineGitDetails?: EntityGitDetails
  overlayInputSetRepoIdentifier?: string
  overlayInputSetBranch?: string
  overlayInputSetIdentifier?: string
  onlyReconcileButton?: boolean
  refetch?: () => Promise<void>
  inputSetUpdateResponseHandler?: (responseData: InputSetResponse) => void
  hideInputSetButton?: boolean
  hideForm?: () => void
  isOverlayInputSet?: boolean
  fromInputSetForm?: boolean
  onReconcile?: (identifier: string) => void
  fromInputSetListView?: boolean
  refetchInputSets?: () => void
}

export function OutOfSyncErrorStrip(props: OutOfSyncErrorStripProps): React.ReactElement {
  const {
    inputSet,
    pipelineGitDetails,
    overlayInputSetRepoIdentifier,
    overlayInputSetBranch,
    overlayInputSetIdentifier,
    onlyReconcileButton,
    refetch,
    hideInputSetButton,
    hideForm,
    isOverlayInputSet,
    fromInputSetForm,
    onReconcile,
    fromInputSetListView,
    refetchInputSets
  } = props
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const history = useHistory()

  const { isGitSyncEnabled } = useAppStore()
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier, module } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { repoIdentifier, branch, inputSetRepoIdentifier, inputSetBranch, connectorRef, repoName, storeType } =
    useQueryParams<InputSetGitQueryParams>()

  const goToInputSetList = (): void => {
    const route = routes.toInputSetList({
      orgIdentifier,
      projectIdentifier,
      accountId,
      pipelineIdentifier,
      module,
      connectorRef,
      repoIdentifier: isGitSyncEnabled ? get(pipelineGitDetails, 'repoIdentifier', '') : repoIdentifier,
      repoName,
      branch: isGitSyncEnabled ? get(pipelineGitDetails, 'branch', '') : branch,
      storeType
    })
    history.push(route)
  }

  const gitParams = get(inputSet, 'gitDetails.objectId')
    ? {
        ...pick(get(inputSet, 'gitDetails'), ['filePath', 'rootFolder']),
        lastObjectId: get(inputSet, 'gitDetails.objectId')
      }
    : {}

  const { mutate: updateInputSet, loading: updateInputSetLoading } = useUpdateInputSetForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      pipelineRepoID: repoIdentifier,
      pipelineBranch: branch
    },
    inputSetIdentifier: '',
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

  const { mutate: updateOverlayInputSet, loading: updateOverlayInputSetLoading } = useUpdateOverlayInputSetForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    },
    inputSetIdentifier: '',
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

  const {
    data: yamlDiffResponse,
    refetch: refetchYamlDiff,
    loading,
    error
  } = useYamlDiffForInputSet({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      pipelineIdentifier: pipelineIdentifier ?? get(inputSet, 'pipelineIdentifier'),
      ...(isGitSyncEnabled
        ? {
            pipelineRepoID: repoIdentifier,
            pipelineBranch: branch
          }
        : {}),
      repoIdentifier: isGitSyncEnabled
        ? overlayInputSetRepoIdentifier ?? inputSetRepoIdentifier
        : repoName ?? get(inputSet, 'gitDetails.repoName'),
      branch: isGitSyncEnabled ? overlayInputSetBranch ?? inputSetBranch : branch ?? get(inputSet, 'gitDetails.branch'),
      connectorRef: connectorRef ?? get(inputSet, 'connectorRef'),
      storeType: storeType ?? get(inputSet, 'storeType'),
      ...gitParams
    },
    inputSetIdentifier: overlayInputSetIdentifier ?? get(inputSet, 'identifier', ''),
    lazy: true
  })

  const { mutate: deleteInputSet } = useDeleteInputSetForPipeline({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier, pipelineIdentifier }
  })

  const { handleSubmit } = useSaveInputSetOrOverlayInpSet({
    updateInputSet,
    updateOverlayInputSet,
    inputSet,
    _isOverlayInputSet: !!isOverlayInputSet,
    refetch,
    fromInputSetForm,
    hideForm,
    inpSetGitDetails: get(yamlDiffResponse, 'data.gitDetails', ''),
    onReconcile,
    refetchInputSets
  })

  const { openDialog: openDeleteInputSetModal, closeDialog: closeDeleteInputSetModal } = useConfirmationDialog({
    contentText: getString(
      isOverlayInputSet
        ? isNil(overlayInputSetIdentifier)
          ? 'pipeline.inputSets.invalidOverlayISDesc2'
          : 'pipeline.inputSets.invalidOverlayISDesc1'
        : fromInputSetForm
        ? 'pipeline.inputSets.invalidInputSetDesc1'
        : fromInputSetListView
        ? 'pipeline.inputSets.invalidInputSetDesc3'
        : 'pipeline.inputSets.invalidInputSetDesc2'
    ),
    titleText: getString(
      isOverlayInputSet ? 'pipeline.inputSets.invalidOverlayIS' : 'pipeline.inputSets.invalidInputSet'
    ),
    customButtons: (
      <Container style={{ display: 'flex', justifyContent: 'flexStart' }}>
        <RbacButton
          text={getString(
            isOverlayInputSet ? 'pipeline.inputSets.deleteOverlayIS' : 'pipeline.inputSets.deleteInputSet'
          )}
          intent="danger"
          permission={{
            resourceScope: {
              accountIdentifier: accountId,
              orgIdentifier,
              projectIdentifier
            },
            resource: {
              resourceType: ResourceType.PIPELINE,
              resourceIdentifier: pipelineIdentifier
            },
            permission: PermissionIdentifier.EDIT_PIPELINE
          }}
          onClick={async () => {
            try {
              const response = await deleteInputSet(
                defaultTo(overlayInputSetIdentifier ?? get(inputSet, 'identifier'), ''),
                {
                  queryParams: {
                    accountIdentifier: accountId,
                    orgIdentifier,
                    projectIdentifier,
                    pipelineIdentifier: pipelineIdentifier ?? get(inputSet, 'pipelineIdentifier'),
                    commitMsg: get(inputSet, 'gitDetails.objectId')
                      ? `${getString('delete')} ${get(inputSet, 'name', '')}`
                      : '',
                    repoIdentifier: get(inputSet, 'gitDetails.repoIdentifier', ''),
                    branch: get(inputSet, 'gitDetails.branch', ''),
                    ...gitParams
                  },
                  headers: { 'content-type': 'application/json' }
                }
              )

              closeDeleteInputSetModal()
              !onlyReconcileButton && (!isOverlayInputSet ? goToInputSetList() : hideForm?.())

              if (get(response, 'status') === 'SUCCESS') {
                showSuccess(getString('inputSets.inputSetDeleted', { name: get(inputSet, 'name', '') }))
                refetch?.()
                refetchInputSets?.()
              } else {
                throw getString('somethingWentWrong')
              }
            } catch (err) {
              showError(getRBACErrorMessage(err), undefined, 'pipeline.delete.inputset.error')
            }
          }}
        />
        {/* Will be added as a Future Enhancement */}
        {/* {!yamlDiffResponse?.data?.noUpdatePossible && !onlyReconcileButton && !isOverlayInputSet && (
          <Button
            variation={ButtonVariation.TERTIARY}
            style={{ marginLeft: 'var(--spacing-8)' }}
            text={getString('pipeline.inputSetErrorStrip.updateRuntimeFields')}
            onClick={() => {
              const omittedInputSet = omit(
                inputSet,
                'pipeline',
                'gitDetails',
                'entityValidityDetails',
                'outdated',
                'inputSetErrorWrapper'
              )
              inputSetUpdateResponseHandler?.(omittedInputSet)
              closeDeleteInputSetModal()
            }}
          />
        )} */}
        {!hideInputSetButton && (
          <Button
            variation={ButtonVariation.TERTIARY}
            style={{ marginLeft: 'var(--spacing-8)' }}
            text={getString(
              fromInputSetForm ? 'pipeline.inputSets.goBackToInputSetList' : 'pipeline.inputSetErrorStrip.goToInpSetBtn'
            )}
            onClick={goToInputSetList}
          />
        )}
      </Container>
    ),
    intent: Intent.DANGER,
    showCloseButton: true,
    canEscapeKeyClose: false,
    canOutsideClickClose: false
  })

  const [showReconcileDialog, hideReconcileDialog] = useModalHook(() => {
    const onClose = (): void => {
      hideReconcileDialog()
    }

    return (
      <Dialog isOpen={true} onClose={onClose} enforceFocus={false} className={css.reconcileDialog}>
        <ReconcileDialog
          inputSet={inputSet}
          overlayInputSetIdentifier={overlayInputSetIdentifier}
          oldYaml={yamlStringify(yamlParse(defaultTo(yamlDiffResponse?.data?.oldYAML, '')))}
          newYaml={yamlStringify(yamlParse(defaultTo(yamlDiffResponse?.data?.newYAML, '')))}
          error={error}
          refetchYamlDiff={refetchYamlDiff}
          updateLoading={updateInputSetLoading || updateOverlayInputSetLoading}
          onClose={onClose}
          isOverlayInputSet={isOverlayInputSet}
          handleSubmit={handleSubmit}
          yamlDiffGitDetails={get(yamlDiffResponse, 'data.gitDetails', '')}
        />
      </Dialog>
    )
  }, [yamlDiffResponse, updateInputSetLoading, updateOverlayInputSetLoading, handleSubmit])

  useEffect(() => {
    if (
      (!get(yamlDiffResponse, 'data.inputSetEmpty') &&
        get(yamlDiffResponse, 'data.oldYAML') &&
        get(yamlDiffResponse, 'data.newYAML')) ||
      error
    ) {
      showReconcileDialog()
    } else if (get(yamlDiffResponse, 'data.inputSetEmpty')) {
      hideReconcileDialog() // If the error object becomes empty after clicking the retry button, the reconcile dialogue should be closed
      openDeleteInputSetModal()
    }
  }, [yamlDiffResponse])

  return (
    <>
      {onlyReconcileButton ? (
        <Button
          text={getString('pipeline.outOfSyncErrorStrip.reconcile')}
          variation={ButtonVariation.SECONDARY}
          size={ButtonSize.SMALL}
          onClick={e => {
            if (fromInputSetListView) e.stopPropagation()
            return refetchYamlDiff()
          }}
          loading={loading}
          className={fromInputSetListView ? css.reconcileButtonListView : css.reconcileButton}
        />
      ) : (
        <Container className={css.mainContainer}>
          <Layout.Horizontal spacing={'medium'} flex={{ justifyContent: 'flex-start', alignItems: 'center' }}>
            <Text
              font={{ variation: FontVariation.SMALL_BOLD }}
              color={Color.RED_600}
              margin={{ right: 'medium' }}
              icon="warning-sign"
              intent={Intent.DANGER}
            >
              {getString('pipeline.inputSetErrorStrip.errorInfo', {
                type: isOverlayInputSet ? 'Overlay Input Set' : 'Input Set'
              })}
            </Text>
            <Button
              text={getString('pipeline.outOfSyncErrorStrip.reconcile')}
              variation={ButtonVariation.SECONDARY}
              size={ButtonSize.SMALL}
              onClick={() => refetchYamlDiff()}
              loading={loading}
            />
          </Layout.Horizontal>
        </Container>
      )}
    </>
  )
}
