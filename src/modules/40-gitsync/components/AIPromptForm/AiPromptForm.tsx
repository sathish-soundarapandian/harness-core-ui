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
import cx from 'classnames'
import { Container, FormInput, Layout, SelectOption } from '@harness/uicore'
import { useStrings, UseStringsReturn } from 'framework/strings'
// import {
//   ConnectorReferenceField,
//   ConnectorSelectedValue
// } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'

import type { AIQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Scope } from '@common/interfaces/SecretsInterface'
import { useQueryParams } from '@common/hooks'
import RepositorySelect from '@common/components/RepositorySelect/RepositorySelect'
import { StoreMetadata, StoreType } from '@common/constants/GitSyncTypes'
import RepoBranchSelectV2 from '@common/components/RepoBranchSelectV2/RepoBranchSelectV2'
import { ErrorHandler, ResponseMessage } from '@common/components/ErrorHandler/ErrorHandler'
import { Connectors } from '@connectors/constants'
import { getConnectorIdentifierWithScope } from '@connectors/utils/utils'
import { yamlPathRegex } from '@common/utils/StringUtils'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import css from './AiPromptForm.module.scss'

export interface AIPromptFormFields {
  aiPrompt?: string
}
interface AIPromptFormProps<T> {
  formikProps: FormikContextType<T>
  isEdit: boolean
  disableFields?: {
    aiPrompt?: boolean
  }
  initialValues?: StoreMetadata
  errorData?: ResponseMessage[]
  entityScope?: Scope
  className?: string
  filePathPrefix?: string
}

export const aiPromptFormSchema = (
  getString: UseStringsReturn['getString']
): {
  aiPrompt: Yup.MixedSchema
} => ({
  repo: Yup.mixed().when('storeType', {
    is: StoreType.AI,
    then: Yup.string().trim().required(getString('common.git.validation.aiPromptRequired'))
  })
})

export function AIPromptForm<T extends AIPromptFormFields = AIPromptFormFields>(
  props: AIPromptFormProps<T>
): React.ReactElement {
  const {
    formikProps,
    isEdit,
    disableFields = {},
    errorData,
    entityScope = Scope.PROJECT,
    className = '',
  } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { aiPrompt } = useQueryParams<AIQueryParams>()
  const { getString } = useStrings()
  const [errorResponse, setErrorResponse] = useState<ResponseMessage[]>(errorData ?? [])

  useEffect(() => {
    setErrorResponse(errorData as ResponseMessage[])
  }, [errorData])

  // useEffect(() => {
  //   if (!isEdit && formikProps?.values?.identifier && isEmpty(initialValues?.filePath) && !filePathTouched) {
  //     let versionLabel = ''
  //     if (formikProps.values.versionLabel?.trim()) {
  //       versionLabel = '_' + formikProps.values.versionLabel.trim().split(' ').join('_')
  //     }
  //     const pathPrefix = filePathPrefix || '.harness'
  //     formikProps.setFieldValue('filePath', `${pathPrefix}/${formikProps.values.identifier}${versionLabel}.yaml`)
  //   }
  // }, [formikProps?.values?.identifier, formikProps?.values?.versionLabel, isEdit, filePathTouched, filePathPrefix])

  // useEffect(() => {
  //   if (!filePathTouched && formikProps.touched.filePath) {
  //     setFilePathTouched(true)
  //   }
  // }, [filePathTouched, formikProps.touched.filePath])

  // useEffect(() => {
  //   setErrorResponse([])
  // }, [formikProps.values.connectorRef])

  // const formikConnectorRef =
  //   typeof formikProps.values.connectorRef === 'string'
  //     ? formikProps.values.connectorRef
  //     : formikProps.values.connectorRef?.value

  return (
    <Container padding={{ top: 'large' }} className='aiPromptForm' >
      <Layout.Horizontal>
        <Layout.Vertical>
          <FormInput.TextArea
            name="aiPrompt"
            label={getString('pipeline.aiPromptForm.yamlAiPromptLabel')}
            placeholder={getString('pipeline.aiPromptForm.enterYamlAiPrompt')}
            disabled={isEdit || disableFields.aiPrompt}
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
