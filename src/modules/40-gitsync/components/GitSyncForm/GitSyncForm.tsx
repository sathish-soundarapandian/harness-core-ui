/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useRef, useState } from 'react'
import type { FormikContextType } from 'formik'
import { defaultTo, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import cx from 'classnames'
import { Container, FormInput, Layout, SelectOption, useToaster } from '@harness/uicore'
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
import { getConnectorIdentifierWithScope } from '@connectors/utils/utils'
import { yamlPathRegex } from '@common/utils/StringUtils'
import { ConnectorInfoDTO, GetConnectorQueryParams, useGetConnector, useGetSettingValue } from 'services/cd-ng'
import { SettingType } from '@common/constants/Utils'
import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
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
  className?: string
  filePathPrefix?: string
  skipDefaultConnectorSetting?: boolean
  skipBranch?: boolean
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

const getSupportedProviders = (): Array<ConnectorInfoDTO['type']> => {
  const supportedRepoProviders = [Connectors.GITHUB, Connectors.BITBUCKET, Connectors.AZURE_REPO, Connectors.GITLAB]
  return supportedRepoProviders
}

export function GitSyncForm<T extends GitSyncFormFields = GitSyncFormFields>(
  props: GitSyncFormProps<T>
): React.ReactElement {
  const {
    formikProps,
    isEdit,
    disableFields = {},
    initialValues,
    errorData,
    entityScope = Scope.PROJECT,
    className = '',
    filePathPrefix,
    skipDefaultConnectorSetting = false,
    skipBranch = false
  } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { branch, connectorRef, repoName } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()
  const { showError } = useToaster()
  const [errorResponse, setErrorResponse] = useState<ResponseMessage[]>(errorData ?? [])
  const [filePathTouched, setFilePathTouched] = useState<boolean>()
  const formikConnectorRef =
    typeof formikProps.values.connectorRef === 'string'
      ? formikProps.values.connectorRef
      : formikProps.values.connectorRef?.value

  const defaultSettingConnector = useRef<string>('')
  const getConnectorScope = (): Scope => getScopeFromValue(defaultSettingConnector.current || '')
  const getConnectorId = (): string => getIdentifierFromValue(defaultSettingConnector.current || '')
  const getConnectorQueryParams = (): GetConnectorQueryParams => {
    return {
      accountIdentifier: accountId,
      orgIdentifier:
        getConnectorScope() === Scope.ORG || getConnectorScope() === Scope.PROJECT ? orgIdentifier : undefined,
      projectIdentifier: getConnectorScope() === Scope.PROJECT ? projectIdentifier : undefined
    }
  }

  const {
    data: defaultConnectorSetting,
    error: defaultConnectorSettingError,
    loading: loadingSetting
  } = useGetSettingValue({
    identifier: SettingType.DEFAULT_CONNECTOR_FOR_GIT_EXPERIENCE,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: !!(formikProps.values.connectorRef || connectorRef) || skipDefaultConnectorSetting
  })

  const {
    data: connectorData,
    loading: loadingDefaultConnector,
    error: connectorFetchError,
    refetch
  } = useGetConnector({
    identifier: '',
    queryParams: getConnectorQueryParams(),
    lazy: true
  })

  useEffect(() => {
    if (!loadingSetting) {
      if (defaultConnectorSettingError) {
        showError(defaultConnectorSettingError.message)
      } else if (
        defaultConnectorSetting?.data?.value &&
        defaultConnectorSetting?.data?.value !== 'false' &&
        !(formikConnectorRef || connectorRef)
      ) {
        defaultSettingConnector.current = defaultConnectorSetting?.data?.value
        refetch({
          pathParams: { identifier: getConnectorId() },
          queryParams: getConnectorQueryParams()
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultConnectorSettingError, loadingSetting])

  const preSelectedConnector = connectorRef || defaultConnectorSetting?.data?.value

  useEffect(() => {
    if (!loadingDefaultConnector) {
      if (defaultConnectorSettingError) {
        showError(connectorFetchError?.message)
      } else if (connectorData?.data?.connector) {
        const value = connectorData?.data?.connector
        formikProps.setFieldValue('connectorRef', {
          label: defaultTo(value?.name, ''),
          value: defaultSettingConnector.current,
          scope: getConnectorScope(),
          live: connectorData?.data?.status?.status === 'SUCCESS',
          connector: value
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectorFetchError, loadingDefaultConnector])

  useEffect(() => {
    setErrorResponse(errorData as ResponseMessage[])
  }, [errorData])

  useEffect(() => {
    if (!isEdit && formikProps?.values?.identifier && isEmpty(initialValues?.filePath) && !filePathTouched) {
      let versionLabel = ''
      if (formikProps.values.versionLabel?.trim()) {
        versionLabel = '_' + formikProps.values.versionLabel.trim().split(' ').join('_')
      }
      const pathPrefix = filePathPrefix || '.harness'
      formikProps.setFieldValue('filePath', `${pathPrefix}/${formikProps.values.identifier}${versionLabel}.yaml`)
    }
  }, [formikProps?.values?.identifier, formikProps?.values?.versionLabel, isEdit, filePathTouched, filePathPrefix])

  useEffect(() => {
    if (!filePathTouched && formikProps.touched.filePath) {
      setFilePathTouched(true)
    }
  }, [filePathTouched, formikProps.touched.filePath])

  useEffect(() => {
    setErrorResponse([])
  }, [formikProps.values.connectorRef])

  return (
    <Container padding={{ top: 'large' }} className={cx(css.gitSyncForm, className)}>
      <Layout.Horizontal>
        <Layout.Vertical>
          <ConnectorReferenceField
            name="connectorRef"
            width={350}
            type={getSupportedProviders()}
            selected={defaultTo(formikProps.values.connectorRef, connectorRef)}
            error={formikProps.submitCount > 0 ? (formikProps?.errors?.connectorRef as string) : undefined}
            label={getString('connectors.title.gitConnector')}
            placeholder={
              loadingSetting ? getString('defaultSettings.fetchingDefaultConnector') : `- ${getString('select')} -`
            }
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
            disabled={isEdit || disableFields.connectorRef || loadingSetting}
          />

          <RepositorySelect
            formikProps={formikProps}
            connectorRef={formikConnectorRef || preSelectedConnector}
            onChange={() => {
              if (errorResponse?.length === 0) {
                formikProps.setFieldValue?.('branch', '')
              }
            }}
            selectedValue={defaultTo(formikProps?.values?.repo, repoName)}
            disabled={isEdit || disableFields.repoName}
            setErrorResponse={setErrorResponse}
          />
          {skipBranch ? null : (
            <RepoBranchSelectV2
              key={formikProps?.values?.repo}
              connectorIdentifierRef={formikConnectorRef || preSelectedConnector}
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
          )}
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
