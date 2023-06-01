/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Color, Intent } from '@harness/design-system'
import {
  ButtonSize,
  ButtonVariation,
  Layout,
  Text,
  getErrorInfoFromErrorObject,
  useConfirmationDialog,
  useToaster
} from '@harness/uicore'
import { defaultTo, isNil } from 'lodash-es'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { useStrings } from 'framework/strings'
import type { ExecutionPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { windowLocationUrlPartBeforeHash } from 'framework/utils/WindowLocation'
import { checkIfInstanceCanBeRolledBackPromise, triggerRollbackPromise } from 'services/cd-ng'
import type { PipelineExecInfoProps } from '../ServiceDetailUtils'

export interface PostProdRollbackBtnProps extends Partial<PipelineExecInfoProps> {
  infraName: string
  artifactName: string
  closeDailog?: () => void
  setRollbacking?: React.Dispatch<React.SetStateAction<boolean>>
}

export default function PostProdRollbackBtn(props: PostProdRollbackBtnProps): JSX.Element {
  const { getString } = useStrings()
  const { showError, showSuccess, clear } = useToaster()
  const {
    orgIdentifier,
    projectIdentifier,
    accountId,
    module,
    pipelineIdentifier: pipId
  } = useParams<PipelineType<PipelinePathProps>>()
  const source: ExecutionPathProps['source'] = pipId ? 'executions' : 'deployments'
  const {
    pipelineId,
    artifactName,
    infraName,
    rollbackStatus,
    infrastructureMappingId,
    instanceKey,
    closeDailog,
    setRollbacking
  } = props

  const requestParamForRollback = {
    body: {
      infrastructureMappingId: defaultTo(infrastructureMappingId, ''),
      instanceKey: defaultTo(instanceKey, '')
    },
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  }

  //take user to pipeline execution if rollback is triggered successfully
  const redirectToRollbackExecution = (pipelineIdForRoute: string, planExecutionId: string): void => {
    // istanbul ignore else
    if (pipelineIdForRoute && planExecutionId) {
      const route = routes.toExecutionPipelineView({
        orgIdentifier,
        pipelineIdentifier: pipelineIdForRoute,
        executionIdentifier: planExecutionId,
        projectIdentifier,
        accountId,
        module,
        source
      })
      window.open(`${windowLocationUrlPartBeforeHash()}#${route}`)
    } else {
      showError(getString('cd.serviceDashboard.noLastDeployment'))
    }
  }

  // trigger the rollback if rollback is allowed
  const triggerRollbackAction = async (): Promise<void> => {
    clear()
    try {
      const response = await triggerRollbackPromise({ ...requestParamForRollback })
      // istanbul ignore else
      if (response.data?.rollbackTriggered) {
        showSuccess(getString('cd.serviceDashboard.postProdRollback.rollbackTriggedSuccessfully'))
        redirectToRollbackExecution(defaultTo(pipelineId, ''), defaultTo(response.data?.planExecutionId, ''))
        closeDailog?.()
      } else {
        throw response
      }
    } catch (e: any) {
      // istanbul ignore next
      showError(getErrorInfoFromErrorObject(e))
    } finally {
      setRollbacking?.(false)
    }
  }

  //check for valid rollback action
  const rollbackAction = async (): Promise<void> => {
    clear()
    try {
      const response = await checkIfInstanceCanBeRolledBackPromise({ ...requestParamForRollback })
      if (response.data?.rollbackAllowed) {
        await triggerRollbackAction()
      } else {
        throw response
      }
    } catch (e: any) {
      showError(getErrorInfoFromErrorObject(e))
    } finally {
      setRollbacking?.(false)
    }
  }

  const confirmationText = (
    <Layout.Vertical>
      <Text margin={{ bottom: 'small' }}>
        {getString('cd.serviceDashboard.postProdRollback.rollbackConfirmationText')}
      </Text>
      <li style={{ marginLeft: 12 }}>
        <strong>{infraName}</strong>
        {` (${artifactName})`}
      </li>
    </Layout.Vertical>
  )

  const { openDialog: openRollbackConfirmation } = useConfirmationDialog({
    contentText: confirmationText,
    titleText: getString('cd.serviceDashboard.postProdRollback.rollbackConfirmationTitle'),
    intent: Intent.WARNING,
    confirmButtonText: getString('confirm'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async isConfirmed => {
      if (isConfirmed) {
        setRollbacking?.(true)
        await rollbackAction()
      }
    }
  })

  const disableRollbackBtn = isNil(rollbackStatus) || ['FAILURE', 'STARTED', 'SUCCESS'].includes(rollbackStatus)

  return (
    <RbacButton
      variation={ButtonVariation.SECONDARY}
      size={ButtonSize.SMALL}
      icon="rollback-service"
      iconProps={{ size: 12, color: Color.PRIMARY_7 }}
      text={getString('rollbackLabel')}
      permission={{
        resourceScope: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier
        },
        resource: {
          resourceType: ResourceType.PIPELINE,
          resourceIdentifier: pipelineId
        },
        permission: PermissionIdentifier.EXECUTE_PIPELINE
      }}
      onClick={openRollbackConfirmation}
      disabled={disableRollbackBtn}
      id="rollbackBtn"
    />
  )
}
