import React, { useEffect } from 'react'
import type { FormikContextType } from 'formik'
import cx from 'classnames'
import { defaultTo } from 'lodash-es'
import { useParams } from 'react-router-dom'

import { Container, FormInput, SelectOption } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import {
  ConnectorReferenceField,
  ConnectorSelectedValue
} from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Scope } from '@common/interfaces/SecretsInterface'
import RepositorySelect from '../RepositorySelect/RepositorySelect'
import RepoBranchSelectV2 from '../RepoBranchSelectV2/RepoBranchSelectV2'

interface GitSyncFormProps<T> {
  identifier?: string
  formikProps: FormikContextType<T>
  defaultValue?: any
  modalErrorHandler?: any
  handleSubmit: () => void
  closeModal?: () => void
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
  const { formikProps, modalErrorHandler } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()

  useEffect(() => {
    formikProps.setFieldValue('remoteType', 'create')
  }, [])

  return (
    <Container padding={{ top: 'large' }} className={cx()}>
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
            (elm.target as HTMLInputElement).value === 'import' ? '' : `${formikProps?.values?.identifier}.yaml`
          )
        }}
      />
      <ConnectorReferenceField
        name="connectorRef"
        width={350}
        type={['Github', 'Bitbucket']}
        selected={formikProps.values.connectorRef}
        label={'Select Git Connector'}
        placeholder={getString('select')}
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
          formikProps.setFieldValue?.('repository', '')
        }}
      />

      <RepositorySelect
        key={formikProps.values.connectorRef?.value} // Branch select must be reset if repositoryURL changes
        formikProps={formikProps}
        connectorRef={formikProps.values.connectorRef?.value}
        //modalErrorHandler={modalErrorHandler}
        onChange={(selected: SelectOption, options?: SelectOption[]) => {
          if (!options?.find(repo => repo.value === selected.value)) {
            formikProps.setFieldValue?.('repository', '')
          }
        }}
        selectedValue={formikProps.values.repoName}
      />
      <RepoBranchSelectV2
        key={formikProps.values.repoName} // Branch select must be reset if repositoryURL changes
        connectorIdentifierRef={formikProps.values.connectorRef?.value}
        repoName={formikProps.values.repoName}
        modalErrorHandler={modalErrorHandler}
        onChange={(selected: SelectOption, options?: SelectOption[]) => {
          if (!options?.find(branch => branch.value === selected.value)) {
            formikProps.setFieldValue?.('branch', '')
          }
        }}
        selectedValue={formikProps.values.branch}
      />
      <FormInput.Text name="filePath" label={'Yaml Path'} placeholder={'Enter Yaml path'} />
    </Container>
  )
}
