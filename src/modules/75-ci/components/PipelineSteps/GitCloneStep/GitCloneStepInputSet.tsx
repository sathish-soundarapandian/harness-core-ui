/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { connect } from 'formik'
import { getMultiTypeFromValue, MultiTypeInputType, FormikForm } from '@wings-software/uicore'
import StepCommonFieldsInputSet from '@ci/components/PipelineSteps/StepCommonFields/StepCommonFieldsInputSet'
import { getConnectorRefWidth, isRuntimeInput, shouldRenderRunTimeInputView } from '@pipeline/utils/CIUtils'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import {
  CodebaseRuntimeInputsInterface,
  runtimeInputGearWidth
} from '@pipeline/components/PipelineStudio/RightBar/RightBarUtils'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import { CIStep } from '../CIStep/CIStep'
import type { GitCloneStepProps } from './GitCloneStep'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

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
  const connectorRefValue = formik.values.spec?.connectorRef
  const isConnectorRuntimeInput = isRuntimeInput(connectorRefValue)
  const codebaseConnector = formik.values?.spec?.connectorRef

  const [codebaseRuntimeInputs, setCodebaseRuntimeInputs] = React.useState<CodebaseRuntimeInputsInterface>({
    ...(isRuntimeInput(codebaseConnector) && { connectorRef: true, repoName: true })
  })
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
                connectorWidth: isConnectorRuntimeInput ? connectorWidth - runtimeInputGearWidth : connectorWidth,
                setConnectionType,
                setConnectorUrl,
                repoIdentifier,
                branch,
                isReadonly: readonly,
                setCodebaseRuntimeInputs,
                codebaseRuntimeInputs
              }
            }),
          ...(getMultiTypeFromValue(template?.spec?.connectorRef) !== MultiTypeInputType.RUNTIME &&
            getMultiTypeFromValue(template?.spec?.repoName) === MultiTypeInputType.RUNTIME && {
              'spec.repoName': { tooltipId: 'repoName' }
            }),
          ...(getMultiTypeFromValue(template?.spec?.build as string) === MultiTypeInputType.RUNTIME && {
            'spec.build': {}
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
