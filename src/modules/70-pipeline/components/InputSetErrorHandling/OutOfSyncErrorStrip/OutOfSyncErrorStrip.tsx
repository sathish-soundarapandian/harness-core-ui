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
  Icon,
  Layout,
  Text,
  useConfirmationDialog,
  useToaster
} from '@wings-software/uicore'
import { Intent } from '@blueprintjs/core'
import { Color, FontVariation } from '@wings-software/design-system'
import { Button } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { useHistory, useParams } from 'react-router-dom'
import { defaultTo, isNil, omit, pick } from 'lodash-es'
import type { InputSetDTO } from '@pipeline/utils/types'
import { ReconcileDialog } from '@pipeline/components/InputSetErrorHandling/ReconcileDialog/ReconcileDialog'
import {
  InputSetResponse,
  ResponsePMSPipelineResponseDTO,
  useDeleteInputSetForPipeline,
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
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import css from './OutOfSyncErrorStrip.module.scss'

interface OutOfSyncErrorStripProps {
  inputSet: InputSetDTO
  inputSetUpdateHandler?: (updatedInputSet: InputSetDTO) => void
  pipeline?: ResponsePMSPipelineResponseDTO | null
  updateLoading: boolean
  overlayInputSetRepoIdentifier?: string
  overlayInputSetBranch?: string
  overlayInputSetIdentifier?: string
  onlyReconcileButton?: boolean
  refetch?: () => Promise<void>
  inputSetUpdateResponseHandler?: (responseData: InputSetResponse) => void
  hideInpSetBtn?: boolean
  hideForm?: () => void
  isOverlayInputSet?: boolean
}

export function OutOfSyncErrorStrip(props: OutOfSyncErrorStripProps): React.ReactElement {
  const {
    inputSet,
    inputSetUpdateHandler,
    pipeline,
    updateLoading,
    overlayInputSetRepoIdentifier,
    overlayInputSetBranch,
    overlayInputSetIdentifier,
    onlyReconcileButton,
    refetch,
    inputSetUpdateResponseHandler,
    hideInpSetBtn,
    hideForm,
    isOverlayInputSet
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

  const [canUpdateInputSet] = usePermission(
    {
      resourceScope: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      resource: {
        resourceType: ResourceType.PIPELINE,
        resourceIdentifier: pipelineIdentifier
      },
      permissions: [PermissionIdentifier.EDIT_PIPELINE]
    },
    [accountId, orgIdentifier, projectIdentifier, pipelineIdentifier]
  )

  const goToInputSetList = (): void => {
    const route = routes.toInputSetList({
      orgIdentifier,
      projectIdentifier,
      accountId,
      pipelineIdentifier,
      module,
      connectorRef,
      repoIdentifier: isGitSyncEnabled ? pipeline?.data?.gitDetails?.repoIdentifier : repoIdentifier,
      repoName,
      branch: isGitSyncEnabled ? pipeline?.data?.gitDetails?.branch : branch,
      storeType
    })
    history.push(route)
  }

  const gitParams = inputSet?.gitDetails?.objectId
    ? {
        ...pick(inputSet?.gitDetails, ['branch', 'repoIdentifier', 'filePath', 'rootFolder']),
        lastObjectId: inputSet?.gitDetails?.objectId
      }
    : {}

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
      pipelineIdentifier,
      ...(isGitSyncEnabled
        ? {
            pipelineRepoID: repoIdentifier,
            pipelineBranch: branch
          }
        : {}),
      repoIdentifier: isGitSyncEnabled ? overlayInputSetRepoIdentifier ?? inputSetRepoIdentifier : repoName,
      branch: isGitSyncEnabled ? overlayInputSetBranch ?? inputSetBranch : branch,
      connectorRef: connectorRef,
      storeType: storeType,
      ...gitParams
    },
    inputSetIdentifier: overlayInputSetIdentifier ?? defaultTo(inputSet?.identifier, ''),
    lazy: true
  })

  const { mutate: deleteInputSet } = useDeleteInputSetForPipeline({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier, pipelineIdentifier }
  })

  const { openDialog: openDeleteInputSetModal, closeDialog: closeDeleteInputSetModal } = useConfirmationDialog({
    contentText: overlayInputSetIdentifier
      ? 'Your overlay input set is not valid anymore because you do not have any pipeline runtime inputs'
      : getString('pipeline.inputSets.invalidInputSet2'),
    titleText: overlayInputSetIdentifier
      ? 'Invalid Overlay Input Set'
      : getString('pipeline.inputSets.invalidInputSet'),
    customButtons: (
      <Container style={{ display: 'flex', justifyContent: 'flexStart' }}>
        <RbacButton
          text={overlayInputSetIdentifier ? 'Delete Overlay Input Set' : getString('pipeline.inputSets.deleteInputSet')}
          intent="danger"
          disabled={!canUpdateInputSet}
          onClick={async () => {
            try {
              const deleted = await deleteInputSet(defaultTo(overlayInputSetIdentifier ?? inputSet?.identifier, ''), {
                queryParams: {
                  accountIdentifier: accountId,
                  orgIdentifier,
                  projectIdentifier,
                  pipelineIdentifier,
                  ...gitParams
                },
                headers: { 'content-type': 'application/json' }
              })

              closeDeleteInputSetModal()
              !onlyReconcileButton && (isNil(overlayInputSetIdentifier) ? goToInputSetList() : hideForm?.())

              if (deleted?.status === 'SUCCESS') {
                showSuccess(getString('inputSets.inputSetDeleted', { name: inputSet?.name }))
                refetch?.()
              } else {
                throw getString('somethingWentWrong')
              }
            } catch (err) {
              showError(getRBACErrorMessage(err), undefined, 'pipeline.delete.inputset.error')
            }
          }}
        />
        {/* Update */}
        {!yamlDiffResponse?.data?.noUpdatePossible && !onlyReconcileButton && isNil(overlayInputSetIdentifier) && (
          <Button
            variation={ButtonVariation.TERTIARY}
            style={{ marginLeft: 'var(--spacing-8)' }}
            text={'Update Runtime Fields'} // Update
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
        )}
        {!hideInpSetBtn && (
          <Button
            variation={ButtonVariation.TERTIARY}
            style={{ marginLeft: 'var(--spacing-8)' }}
            text={'Go to Input Set list'} // Update
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
          inputSetUpdateHandler={inputSetUpdateHandler}
          overlayInputSetIdentifier={overlayInputSetIdentifier}
          canUpdateInputSet={canUpdateInputSet}
          oldYaml={yamlStringify(yamlParse(defaultTo(yamlDiffResponse?.data?.oldYAML, '')))}
          newYaml={yamlStringify(yamlParse(defaultTo(yamlDiffResponse?.data?.newYAML, '')))}
          error={error}
          refetchYamlDiff={refetchYamlDiff}
          updateLoading={updateLoading}
          onClose={onClose}
          isOverlayInputSet={isOverlayInputSet}
        />
      </Dialog>
    )
  }, [yamlDiffResponse, updateLoading])

  useEffect(() => {
    if (!yamlDiffResponse?.data?.inputSetEmpty && yamlDiffResponse?.data?.oldYAML && yamlDiffResponse?.data?.newYAML) {
      showReconcileDialog()
    } else if (yamlDiffResponse?.data?.inputSetEmpty) {
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
          onClick={() => refetchYamlDiff()}
          loading={loading}
          className={css.reconcileButton}
        />
      ) : (
        <Container className={css.mainContainer}>
          <Layout.Horizontal spacing={'medium'} flex={{ justifyContent: 'flex-start', alignItems: 'center' }}>
            <Icon name="warning-sign" intent={Intent.DANGER} />
            <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.RED_600}>
              Your Input Set form contains invalid fields!
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
