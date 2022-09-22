/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import type { FormikContextType } from 'formik'
import { defaultTo, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import { Container, FormInput, Layout, SelectOption } from '@harness/uicore'
import { useStrings, UseStringsReturn } from 'framework/strings'
import {
  ConnectorReferenceField,
  ConnectorSelectedValue
} from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Scope } from '@common/interfaces/SecretsInterface'
import { useQueryParams } from '@common/hooks'
import RepositorySelect from '@common/components/RepositorySelect/RepositorySelect'
import { StoreMetadata, StoreType } from '@common/constants/GitSyncTypes'
import RepoBranchSelectV2 from '@common/components/RepoBranchSelectV2/RepoBranchSelectV2'
import { ErrorHandler, ResponseMessage } from '@common/components/ErrorHandler/ErrorHandler'
import { Connectors } from '@connectors/constants'
import { yamlPathRegex } from '@common/utils/StringUtils'
import css from './GitSyncForm.module.scss'

export interface GitSyncFormFields {
  identifier?: string
  connectorRef?: ConnectorSelectedValue | string
  repo?: string
  branch?: string
  filePath?: string
  versionLabel?: string
}
interface GitSyncFormProps<T> {
  formikProps: FormikContextType<T>
  isEdit: boolean
  disableFields?: {
    connectorRef?: boolean
    repoName?: boolean
    branch?: boolean
    filePath?: boolean
  }
  initialValues?: StoreMetadata
  errorData?: ResponseMessage[]
  entityScope?: Scope
}

export const gitSyncFormSchema = (
  getString: UseStringsReturn['getString']
): {
  repo: Yup.MixedSchema
  branch: Yup.MixedSchema
  connectorRef: Yup.MixedSchema
  filePath: Yup.MixedSchema
} => ({
  repo: Yup.mixed().when('storeType', {
    is: StoreType.REMOTE,
    then: Yup.string().trim().required(getString('common.git.validation.repoRequired'))
  }),
  branch: Yup.mixed().when('storeType', {
    is: StoreType.REMOTE,
    then: Yup.string().trim().required(getString('common.git.validation.branchRequired'))
  }),
  connectorRef: Yup.mixed().when('storeType', {
    is: StoreType.REMOTE,
    then: Yup.string().trim().required(getString('validation.sshConnectorRequired'))
  }),
  filePath: Yup.mixed().when('storeType', {
    is: StoreType.REMOTE,
    then: Yup.string()
      .trim()
      .required(getString('gitsync.gitSyncForm.yamlPathRequired'))
      .matches(yamlPathRegex, getString('gitsync.gitSyncForm.yamlPathInvalid'))
  })
})

const getConnectorIdentifierWithScope = (scope: Scope, identifier: string): string => {
  return scope === Scope.ORG || scope === Scope.ACCOUNT ? `${scope}.${identifier}` : identifier
}

const getSupportedProviders = () => {
  const supportedRepoProviders = [Connectors.GITHUB, Connectors.BITBUCKET, Connectors.AZURE_REPO]
  return supportedRepoProviders
}

export function GitSyncForm<T extends GitSyncFormFields = GitSyncFormFields>(
  props: GitSyncFormProps<T>
): React.ReactElement {
  const { formikProps, isEdit, disableFields = {}, initialValues, errorData, entityScope = Scope.PROJECT } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { branch, connectorRef, repoName } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()
  const [errorResponse, setErrorResponse] = useState<ResponseMessage[]>(errorData ?? [])
  const [filePathTouched, setFilePathTouched] = useState<boolean>()

  useEffect(() => {
    setErrorResponse(errorData as ResponseMessage[])
  }, [errorData])

  useEffect(() => {
    if (!isEdit && formikProps?.values?.identifier && isEmpty(initialValues?.filePath) && !filePathTouched) {
      let versionLabel = ''
      if (formikProps.values.versionLabel?.trim()) {
        versionLabel = '_' + formikProps.values.versionLabel.trim().split(' ').join('_')
      }
      formikProps.setFieldValue('filePath', `.harness/${formikProps.values.identifier}${versionLabel}.yaml`)
    }
  }, [formikProps?.values?.identifier, formikProps?.values?.versionLabel, isEdit, filePathTouched])

  useEffect(() => {
    if (!filePathTouched && formikProps.touched.filePath) {
      setFilePathTouched(true)
    }
  }, [filePathTouched, formikProps.touched.filePath])

  useEffect(() => {
    setErrorResponse([])
  }, [formikProps.values.connectorRef])

  const formikConnectorRef =
    typeof formikProps.values.connectorRef === 'string'
      ? formikProps.values.connectorRef
      : formikProps.values.connectorRef?.value

  return (
    <Container padding={{ top: 'large' }} className={css.gitSyncForm}>
      <Layout.Horizontal>
        <Layout.Vertical>
          <ConnectorReferenceField
            name="connectorRef"
            width={350}
            type={getSupportedProviders()}
            selected={defaultTo(formikProps.values.connectorRef, connectorRef)}
            error={formikProps.submitCount > 0 ? (formikProps?.errors?.connectorRef as string) : undefined}
            label={getString('connectors.title.gitConnector')}
            placeholder={`- ${getString('select')} -`}
            accountIdentifier={accountId}
            {...(entityScope === Scope.ACCOUNT ? {} : { orgIdentifier })}
            {...(entityScope === Scope.PROJECT ? { projectIdentifier } : {})}
            onChange={(value, scope) => {
              const connectorRefWithScope = getConnectorIdentifierWithScope(scope, value?.identifier)

              formikProps.setFieldValue('connectorRef', {
                label: defaultTo(value.name, ''),
                value: connectorRefWithScope,
                scope: scope,
                live: value?.status?.status === 'SUCCESS',
                connector: value
              })
              formikProps.setFieldValue?.('repo', '')
              formikProps.setFieldValue?.('branch', '')
            }}
            disabled={isEdit || disableFields.connectorRef}
          />

          <RepositorySelect
            formikProps={formikProps}
            connectorRef={formikConnectorRef || connectorRef}
            onChange={() => {
              if (errorResponse?.length === 0) {
                formikProps.setFieldValue?.('branch', '')
              }
            }}
            selectedValue={defaultTo(formikProps?.values?.repo, repoName)}
            disabled={isEdit || disableFields.repoName}
            setErrorResponse={setErrorResponse}
          />
          <RepoBranchSelectV2
            connectorIdentifierRef={formikConnectorRef || connectorRef}
            repoName={formikProps?.values?.repo}
            onChange={(selected: SelectOption) => {
              // This is to handle auto fill after default selection, without it form validation will fail
              if (formikProps.values.branch !== selected.value) {
                formikProps.setFieldValue?.('branch', selected.value)
              }
            }}
            selectedValue={defaultTo(formikProps.values.branch, branch)}
            disabled={isEdit || disableFields.branch}
            setErrorResponse={setErrorResponse}
          />
          <FormInput.Text
            name="filePath"
            label={getString('gitsync.gitSyncForm.yamlPathLabel')}
            placeholder={getString('gitsync.gitSyncForm.enterYamlPath')}
            disabled={isEdit || disableFields.filePath}
          />
        </Layout.Vertical>
        {errorResponse?.length > 0 && (
          <Layout.Vertical style={{ flexShrink: 1 }} padding={{ left: 'xlarge' }}>
            <ErrorHandler responseMessages={errorResponse} />
          </Layout.Vertical>
        )}
      </Layout.Horizontal>
    </Container>
  )
}
