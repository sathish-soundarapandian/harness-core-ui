/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'

import { getMultiTypeFromValue, MultiTypeInputType, FormInput, FormikForm, Text } from '@wings-software/uicore'

import { get, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'

import { useStrings } from 'framework/strings'
import { FormMultiTypeCheckboxField } from '@common/components'
import List from '@common/components/List/List'

import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'

import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import type { TerraformPlanProps } from '../Common/Terraform/TerraformInterfaces'
import ConfigInputs from './InputSteps/TfConfigSection'
import TfVarFiles from './InputSteps/TfPlanVarFiles'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function TfPlanInputStep(props: TerraformPlanProps): React.ReactElement {
  const { getString } = useStrings()
  const { inputSetData, readonly, initialValues, allowableTypes } = props
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  return (
    <FormikForm>
      {getMultiTypeFromValue(inputSetData?.template?.spec?.provisionerIdentifier) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.provisionerIdentifier`}
            placeholder={getString('pipeline.terraformStep.provisionerIdentifier')}
            label={getString('pipelineSteps.provisionerIdentifier')}
            disabled={readonly}
            fieldPath={'spec.provisionerIdentifier'}
            template={inputSetData?.template}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TimeoutFieldInputSetView
            label={getString('pipelineSteps.timeoutLabel')}
            name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}timeout`}
            disabled={readonly}
            fieldPath={'timeout'}
            template={inputSetData?.template}
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              allowableTypes,
              expressions,
              disabled: readonly
            }}
          />
        </div>
      )}

      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.secretManagerRef) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeConnectorField
            label={getString('connectors.title.secretManager')}
            accountIdentifier={accountId}
            selected={get(initialValues, 'spec.configuration.secretManagerRef', '')}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            width={400}
            multiTypeProps={{ allowableTypes, expressions }}
            category={'SECRET_MANAGER'}
            name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.configuration.secretManagerRef`}
            placeholder={getString('select')}
            disabled={readonly}
            setRefValue
            gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
          />
        </div>
      )}
      <ConfigInputs {...props} />
      {inputSetData?.template?.spec?.configuration?.varFiles &&
      inputSetData?.template?.spec?.configuration?.varFiles?.length > 0 ? (
        <TfVarFiles {...props} />
      ) : null}
      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.backendConfig?.spec?.content) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            name={`${
              isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`
            }spec.configuration.backendConfig.spec.content`}
            label={getString('cd.backEndConfig')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}
      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.targets as string) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <List
            name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.configuration.targets`}
            label={<Text style={{ display: 'flex', alignItems: 'center' }}>{getString('pipeline.targets.title')}</Text>}
            disabled={readonly}
            style={{ marginBottom: 'var(--spacing-small)' }}
            expressions={expressions}
            isNameOfArrayType
          />
        </div>
      )}

      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.exportTerraformPlanJson) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeCheckboxField
            name={`${
              isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`
            }spec.configuration.exportTerraformPlanJson`}
            label={getString('cd.exportTerraformPlanJson')}
            multiTypeTextbox={{ expressions, allowableTypes }}
          />
        </div>
      )}
    </FormikForm>
  )
}
