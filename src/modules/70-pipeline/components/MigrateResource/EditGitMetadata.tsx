/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty } from 'lodash-es'
import { Container, Formik, FormikForm, Button, ButtonVariation, useToaster, PageSpinner } from '@harness/uicore'
import type { HideModal } from '@harness/use-modal'
import { useStrings } from 'framework/strings'
import {
  Error,
  ResponseMoveConfigResponse,
  ResponseInputSetMoveConfigResponseDTO,
  updatePipelineGitDetailsPromise,
  updateInputSetGitDetailsPromise,
  UpdatePipelineGitDetailsQueryParams
} from 'services/pipeline-ng'
import { GitSyncForm, GitSyncFormFields } from '@gitsync/components/GitSyncForm/GitSyncForm'
import type { ResponseMessage } from '@common/components/ErrorHandler/ErrorHandler'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { ResourceType } from '@common/interfaces/GitSyncInterface'
import { getConnectorValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import type { ExtraQueryParams } from './MigrateUtils'
import css from './MigrateResource.module.scss'

export interface EditGitMetadataProps {
  resourceType: ResourceType
  identifier: string
  initialValues?: GitSyncFormFields
  extraQueryParams?: ExtraQueryParams
  onCancelClick?: HideModal
  onSuccess?: () => void
  onFailure?: () => void
}

export default function EditGitMetadata({
  initialValues = {
    repo: '',
    branch: '',
    connectorRef: ''
  },
  resourceType,
  identifier,
  extraQueryParams,
  onCancelClick,
  onSuccess,
  onFailure
}: EditGitMetadataProps): JSX.Element {
  const [errorResponse, setErrorResponse] = useState<ResponseMessage[]>()
  const [isLoading, setIsLoading] = useState<boolean>()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<PipelinePathProps>()
  const { showError, clear, showSuccess } = useToaster()
  const { getString } = useStrings()

  const getCommonQueryParams = (formValues: GitSyncFormFields): UpdatePipelineGitDetailsQueryParams => {
    const { connectorRef, repo, filePath } = formValues
    return {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      ...(connectorRef ? { connectorRef: getConnectorValue(connectorRef) } : {}),
      ...(repo ? { repoName: repo } : {}),
      ...(filePath ? { filePath } : {})
    }
  }

  const editPipelineGitMetadata = (formValues: GitSyncFormFields): void => {
    setIsLoading(true)
    updatePipelineGitDetailsPromise({
      pipelineIdentifier: identifier,
      queryParams: getCommonQueryParams(formValues),
      requestOptions: {
        headers: {
          'content-type': 'application/json'
        }
      },
      body: undefined
    })
      .then(handleResponse)
      .catch(handleError)
  }

  const editInputSetGitMetadata = (formValues: GitSyncFormFields): void => {
    setIsLoading(true)
    updateInputSetGitDetailsPromise({
      inputSetIdentifier: identifier,
      queryParams: {
        pipelineIdentifier: extraQueryParams?.pipelineIdentifier || '',
        ...getCommonQueryParams(formValues)
      },
      requestOptions: {
        headers: {
          'content-type': 'application/json'
        }
      },
      body: undefined
    })
      .then(handleResponse)
      .catch(handleError)
  }

  const editGitMetadata = (formValues: GitSyncFormFields): void => {
    switch (resourceType) {
      case ResourceType.PIPELINES:
        editPipelineGitMetadata(formValues)
        break
      case ResourceType.INPUT_SETS:
        editInputSetGitMetadata(formValues)
        break
    }
  }

  const handleResponse = (response: ResponseMoveConfigResponse | ResponseInputSetMoveConfigResponseDTO): void => {
    if (response.status === 'SUCCESS') {
      setIsLoading(false)
      showSuccess(getString('pipeline.editGitDetailsSuccess'))
      onSuccess?.()
    } else {
      handleError(response)
    }
  }

  const handleError = (err: Error): void => {
    setIsLoading(false)
    if (!isEmpty(err.responseMessages)) {
      setErrorResponse(err.responseMessages)
      onFailure?.()
    } else {
      clear()
      showError(err.message ?? getString('somethingWentWrong'))
      onFailure?.()
    }
  }

  return (
    <Container className={css.migrateResourceForm}>
      <Formik<GitSyncFormFields> initialValues={initialValues} formName="editGitMetadata" onSubmit={editGitMetadata}>
        {formikProps => (
          <FormikForm>
            {isLoading ? (
              <PageSpinner message={getString('loading')} />
            ) : (
              <>
                <GitSyncForm
                  formikProps={formikProps as any}
                  initialValues={{
                    filePath: formikProps.submitCount > 0 ? formikProps.values?.filePath : ''
                  }}
                  isEdit={false}
                  errorData={errorResponse}
                  skipBranch={true}
                  className={css.gitSyncForm}
                />

                <Container padding={{ top: 'xlarge' }}>
                  <Button variation={ButtonVariation.PRIMARY} type="submit" text={getString('save')} />
                  &nbsp; &nbsp;
                  <Button
                    variation={ButtonVariation.TERTIARY}
                    text={getString('cancel')}
                    onClick={() => {
                      onCancelClick?.()
                    }}
                  />
                </Container>
              </>
            )}
          </FormikForm>
        )}
      </Formik>
    </Container>
  )
}
