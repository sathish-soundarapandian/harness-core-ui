/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { connect } from 'formik'
import { getMultiTypeFromValue, MultiTypeInputType, FormikForm } from '@wings-software/uicore'
import { useParams, useLocation } from 'react-router-dom'
import { get, isEmpty } from 'lodash-es'
import StepCommonFieldsInputSet from '@ci/components/PipelineSteps/StepCommonFields/StepCommonFieldsInputSet'
import { getConnectorRefWidth, isRuntimeInput, shouldRenderRunTimeInputView } from '@pipeline/utils/CIUtils'
import { useQueryParams } from '@common/hooks'
import type { Build } from 'services/pipeline-ng'
import { useGetConnector } from 'services/cd-ng'
import { getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import { Connectors } from '@connectors/constants'
import type { GitQueryParams, PipelineType } from '@common/interfaces/RouteInterfaces'
import type { CodebaseRuntimeInputsInterface } from '@pipeline/components/PipelineStudio/RightBar/RightBarUtils'
import { ConnectionType } from '@pipeline/components/PipelineInputSetForm/CICodebaseInputSetForm'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import { CIStep } from '../CIStep/CIStep'
import type { GitCloneStepProps } from './GitCloneStep'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

const TEMPLATES = 'templates'

export const GitCloneStepInputSetBasic: React.FC<GitCloneStepProps> = ({
  template,
  path,
  readonly,
  stepViewType,
  formik
}) => {
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [connectionType, setConnectionType] = React.useState('')
  const [connectorUrl, setConnectorUrl] = React.useState('')
  const connectorWidth = getConnectorRefWidth('DefaultView')
  const codebaseConnector = get(formik.values, `${path}.spec.connectorRef`)
  const initialScope = getScopeFromValue(codebaseConnector || '')

  const [codebaseRuntimeInputs, setCodebaseRuntimeInputs] = React.useState<CodebaseRuntimeInputsInterface>({
    ...(isRuntimeInput(codebaseConnector) && { connectorRef: true, repoName: true })
  })
  const { accountId, projectIdentifier, orgIdentifier } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      pipelineIdentifier: string
      accountId: string
    }>
  >()
  const location = useLocation()
  const pathArray = location?.pathname?.split('/')
  const isTemplatePreview = pathArray?.[pathArray.length - 1] === TEMPLATES
  const {
    data: connector,
    loading,
    refetch
  } = useGetConnector({
    identifier: codebaseConnector,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
      projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined,
      ...(repoIdentifier && branch ? { repoIdentifier, branch, getDefaultFromOtherRepo: true } : {})
    },
    lazy: true,
    debounce: 300
  })

  React.useEffect(() => {
    if (!isEmpty(codebaseConnector) && !isRuntimeInput(codebaseConnector)) {
      refetch()
    }
  }, [codebaseConnector])

  React.useEffect(() => {
    if (connector?.data?.connector) {
      setConnectionType(
        connector.data.connector.type === Connectors.GIT
          ? connector.data.connector.spec.connectionType
          : connector.data.connector.spec.type
      )
      setConnectorUrl(connector.data.connector.spec.url)
      if (connector.data.connector.spec?.type === ConnectionType.Repo) {
        // clear dependent repoName
        formik.setFieldValue(`${path || ''}.spec.repoName`, undefined)
      }
    }
  }, [
    connector?.data?.connector,
    connector?.data?.connector?.spec.type,
    connector?.data?.connector?.spec.url,
    setConnectionType,
    setConnectorUrl
  ])
  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin}>
      <CIStep
        readonly={readonly}
        stepViewType={stepViewType}
        formik={formik}
        enableFields={{
          ...(getMultiTypeFromValue(template?.description) === MultiTypeInputType.RUNTIME && {
            description: {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME &&
            getMultiTypeFromValue(template?.spec?.repoName) === MultiTypeInputType.RUNTIME && {
              'spec.connectorAndRepo': {
                connectorUrl,
                connectionType,
                connectorWidth,
                setConnectionType,
                setConnectorUrl,
                loading,
                repoIdentifier,
                branch,
                isReadonly: readonly,
                setCodebaseRuntimeInputs,
                codebaseRuntimeInputs,
                connector: connector?.data?.connector
              }
            }),
          ...(getMultiTypeFromValue(template?.spec?.connectorRef) !== MultiTypeInputType.RUNTIME &&
            getMultiTypeFromValue(template?.spec?.repoName) === MultiTypeInputType.RUNTIME && {
              'spec.repoName': { tooltipId: 'repoName' }
            }),
          ...(getMultiTypeFromValue(template?.spec?.build as string) === MultiTypeInputType.RUNTIME && {
            'spec.build': { isTemplatePreview }
          }),
          ...(getMultiTypeFromValue((template?.spec?.build as Build)?.spec?.branch as string) ===
            MultiTypeInputType.RUNTIME && {
            'spec.build.spec.branch': {}
          }),
          ...(getMultiTypeFromValue((template?.spec?.build as Build)?.spec?.tag as string) ===
            MultiTypeInputType.RUNTIME && {
            'spec.build.spec.tag': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.cloneDirectory) === MultiTypeInputType.RUNTIME && {
            'spec.cloneDirectory': { tooltipId: 'cloneDirectory' }
          })
        }}
        path={path || ''}
        isInputSetView={true}
        template={template}
      />
      <CIStepOptionalConfig
        readonly={readonly}
        enableFields={{
          ...(getMultiTypeFromValue(template?.spec?.depth) === MultiTypeInputType.RUNTIME && {
            'spec.depth': {}
          }),
          ...(shouldRenderRunTimeInputView(template?.spec?.sslVerify) && {
            'spec.sslVerify': {}
          })
        }}
        stepViewType={stepViewType}
        path={path || ''}
        formik={formik}
        isInputSetView={true}
        template={template}
      />
      <StepCommonFieldsInputSet path={path} readonly={readonly} template={template} stepViewType={stepViewType} />
    </FormikForm>
  )
}

const GitCloneStepInputSet = connect(GitCloneStepInputSetBasic)
export { GitCloneStepInputSet }
