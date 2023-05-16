/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import type { ModalErrorHandlerBinding} from '@harness/uicore';
import { Container, shouldShowError } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { noop } from 'lodash-es'
import { TestConnectionWidget, TestStatus } from '@common/components/TestConnectionWidget/TestConnectionWidget'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { ResponseConnectorValidationResult} from 'services/cd-ng';
import { useGetTestGitRepoConnectionResult } from 'services/cd-ng'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import css from './GitSyncRepoForm.module.scss'

export interface RepoTestConnectionProps {
  gitConnector?: ConnectorSelectedValue
  repoURL?: string
  onTestStatusChange?: (testStatus: TestStatus) => void // Can be used in parent
  modalErrorHandler?: ModalErrorHandlerBinding
}

const RepoTestConnection: React.FC<RepoTestConnectionProps> = props => {
  const { gitConnector, repoURL = '', onTestStatusChange = noop, modalErrorHandler } = props
  const { identifier = '', orgIdentifier, projectIdentifier } = gitConnector?.connector || {}
  const { getRBACErrorMessage } = useRBACError()

  const { accountId } = useParams<ProjectPathProps>()
  const [testStatus, setTestStatus] = useState<TestStatus>(TestStatus.NOT_INITIATED)

  const { mutate: testRepo } = useGetTestGitRepoConnectionResult({
    identifier,
    pathParams: {
      identifier
    },
    queryParams: {
      repoURL
    }
  })

  useEffect(() => {
    onTestStatusChange(testStatus)
  }, [onTestStatusChange, testStatus])

  const testConnection = async (): Promise<void> => {
    modalErrorHandler?.hide()
    if (identifier && repoURL) {
      setTestStatus(TestStatus.IN_PROGRESS)
      testRepo(undefined, {
        pathParams: {
          identifier
        },
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          repoURL
        }
      })
        .then((response: ResponseConnectorValidationResult) => {
          if (response?.data?.status !== 'SUCCESS') {
            setTestStatus(TestStatus.FAILED)
          } else {
            setTestStatus(TestStatus.SUCCESS)
          }
        })
        .catch(e => {
          setTestStatus(TestStatus.FAILED)
          if (shouldShowError(e)) {
            modalErrorHandler?.showDanger(getRBACErrorMessage(e))
          }
        })
    }
  }

  return identifier ? (
    <Container flex className={css.testConnection}>
      <TestConnectionWidget testStatus={testStatus} onTest={testConnection} />
    </Container>
  ) : null
}

export default RepoTestConnection
