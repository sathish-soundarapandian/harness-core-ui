/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import type { FormikContextType } from 'formik'
import { defaultTo } from 'lodash-es'
import { useParams } from 'react-router-dom'

import { Container, FormInput, SelectOption } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import {
  ConnectorReferenceField,
  ConnectorSelectedValue
} from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Scope } from '@common/interfaces/SecretsInterface'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import RepositorySelect from '@common/components/RepositorySelect/RepositorySelect'
import RepoBranchSelectV2 from '@common/components/RepoBranchSelectV2/RepoBranchSelectV2'
import css from './GitSyncForm.module.scss'

interface GitSyncFormProps<T> {
  identifier?: string
  formikProps: FormikContextType<T>
  isEdit: boolean
  defaultValue?: any
  modalErrorHandler?: any
  handleSubmit: () => void
  closeModal?: () => void
  showRemoteTypeSelection?: boolean
  disableFields?: {
    [key: string]: boolean
  }
}

interface GitSyncFormFields {
  identifier?: string
  remoteType?: string
  connectorRef?: ConnectorSelectedValue
  repoName?: string
  branch?: string
  filePath?: string
}

const getConnectorIdentifierWithScope = (scope: Scope, identifier: string): string => {
  return scope === Scope.ORG || scope === Scope.ACCOUNT ? `${scope}.${identifier}` : identifier
}

export function GitSyncForm(props: GitSyncFormProps<GitSyncFormFields>): React.ReactElement {
  const { formikProps, modalErrorHandler, isEdit, showRemoteTypeSelection = true, disableFields = {} } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { branch, connectorRef, repoName } = useQueryParams<GitQueryParams>()
  const { updateQueryParams } = useUpdateQueryParams()
  const { getString } = useStrings()

  useEffect(() => {
    formikProps.setFieldValue('remoteType', 'create')
    if (formikProps.values?.identifier && !isEdit) {
      formikProps.setFieldValue('filePath', `.harness/${formikProps.values.identifier}.yaml`)
    }
  }, [formikProps.values.identifier])

  return (
    <Container className={css.gitSyncForm}>
      {showRemoteTypeSelection && (
        <FormInput.RadioGroup
          name="remoteType"
          radioGroup={{ inline: true }}
          items={[
            { label: 'Use Existing Yaml', value: 'import', disabled: true },
            { label: 'Create New Yaml', value: 'create' }
          ]}
          onChange={elm => {
            formikProps.setFieldValue(
              'filePath',
              (elm.target as HTMLInputElement).value === 'import'
                ? ''
                : `.harness/${formikProps?.values?.identifier}.yaml`
            )
          }}
        />
      )}
      <ConnectorReferenceField
        name="connectorRef"
        width={350}
        type={['Github', 'Bitbucket']}
        selected={formikProps.values.connectorRef || connectorRef}
        label={'Select Git Connector'}
        placeholder={`- ${getString('select')} -`}
        accountIdentifier={accountId}
        projectIdentifier={projectIdentifier}
        orgIdentifier={orgIdentifier}
        onChange={(value, scope) => {
          // modalErrorHandler?.hide()
          formikProps.setFieldValue('connectorRef', {
            label: defaultTo(value.name, ''),
            value: getConnectorIdentifierWithScope(scope, value?.identifier),
            scope: scope,
            live: value?.status?.status === 'SUCCESS',
            connector: value
          })
          formikProps.setFieldValue?.('repoName', '')
          formikProps.setFieldValue?.('branch', '')
          updateQueryParams({ connectorRef: value?.identifier, repoName: [] as any, branch: [] as any })
        }}
        disabled={isEdit || disableFields.connectorRef}
      />

      <RepositorySelect
        formikProps={formikProps}
        connectorRef={formikProps.values.connectorRef?.value}
        //modalErrorHandler={modalErrorHandler}
        onChange={(selected: SelectOption, options?: SelectOption[]) => {
          if (!options?.find(repo => repo.value === selected.value)) {
            formikProps.setFieldValue?.('repository', '')
          }
          formikProps.setFieldValue?.('branch', '')
          updateQueryParams({ repoName: selected.value as string, branch: [] as any })
        }}
        selectedValue={formikProps.values.repoName || repoName}
        disabled={isEdit || disableFields.repoName}
      />
      <RepoBranchSelectV2
        connectorIdentifierRef={formikProps.values.connectorRef?.value}
        repoName={formikProps.values.repoName}
        modalErrorHandler={modalErrorHandler}
        onChange={(selected: SelectOption, options?: SelectOption[]) => {
          if (!options?.find(currBranch => currBranch.value === selected.value)) {
            formikProps.setFieldValue?.('branch', '')
          }
          updateQueryParams({ branch: selected.value as string })
        }}
        selectedValue={formikProps.values.branch || branch}
        disabled={isEdit || disableFields.branch}
      />
      <FormInput.Text
        name="filePath"
        label={'Yaml Path'}
        placeholder={'Enter Yaml path'}
        disabled={isEdit || disableFields.filePath}
      />
    </Container>
  )
}
