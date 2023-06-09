/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import cx from 'classnames'
import { defaultTo, get, isEmpty } from 'lodash-es'
import React from 'react'
import { useParams } from 'react-router-dom'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import { useStrings } from 'framework/strings'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { isValueRuntimeInput } from '@common/utils/utils'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { Connectors } from '@connectors/constants'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks/useQueryParams'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import type { SscaOrchestrationStepProps } from './SscaOrchestrationStep'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function SscaOrchestrationStepInputSet(props: SscaOrchestrationStepProps): React.ReactElement {
  const { template, path, readonly, stepViewType, allowableTypes, stepType } = props
  const { getString } = useStrings()
  const prefix = isEmpty(path) ? '' : `${path}.`
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  return (
    <>
      {isValueRuntimeInput(template?.timeout) && (
        <TimeoutFieldInputSetView
          label={getString('pipelineSteps.timeoutLabel')}
          name={`${isEmpty(path) ? '' : `${path}.`}timeout`}
          disabled={readonly}
          multiTypeDurationProps={{
            configureOptionsProps: {
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            },
            allowableTypes,
            expressions,
            disabled: readonly
          }}
          fieldPath={'timeout'}
          template={template}
          className={cx(stepCss.formGroup, stepCss.sm)}
        />
      )}

      {isValueRuntimeInput(get(template, 'spec.attestation.privateKey', '')) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <MultiTypeSecretInput
            type="SecretFile"
            expressions={expressions}
            name={`${prefix}spec.attestation.privateKey`}
            label={getString('connectors.serviceNow.privateKey')}
            disabled={readonly}
          />
        </div>
      )}
      {stepType === StepType.CdSscaOrchestration ? (
        <>
          {isValueRuntimeInput(template?.spec?.infrastructure?.spec?.connectorRef) && (
            <div className={cx(stepCss.formGroup, stepCss.md)}>
              <FormMultiTypeConnectorField
                accountIdentifier={accountId}
                projectIdentifier={projectIdentifier}
                orgIdentifier={orgIdentifier}
                name={`${path}.spec.infrastructure.spec.connectorRef`}
                label={getString('connector')}
                placeholder={getString('common.entityPlaceholderText')}
                disabled={readonly}
                multiTypeProps={{ allowableTypes, expressions }}
                type={Connectors.K8sCluster}
                setRefValue
                gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
                templateProps={{
                  isTemplatizedView: true,
                  templateValue: template?.spec?.infrastructure?.spec?.connectorRef
                }}
                width={388}
              />
            </div>
          )}

          {isValueRuntimeInput(template?.spec?.infrastructure?.spec?.namespace) && (
            <TextFieldInputSetView
              name={`${path}.spec.infrastructure.spec.namespace`}
              label={getString('common.namespace')}
              disabled={readonly}
              multiTextInputProps={{
                allowableTypes,
                expressions
              }}
              configureOptionsProps={{
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              }}
              placeholder={getString('pipeline.infraSpecifications.namespacePlaceholder')}
              fieldPath="spec.infrastructure.spec.namespace"
              template={template}
              className={cx(stepCss.formGroup, stepCss.md)}
            />
          )}

          {isValueRuntimeInput(template?.spec?.infrastructure?.spec?.resources?.limits?.cpu) && (
            <TextFieldInputSetView
              name={`${path}spec.infrastructure.spec.resources.limits.cpu`}
              placeholder={getString('imagePlaceholder')}
              label={getString('pipelineSteps.limitCPULabel')}
              disabled={readonly}
              fieldPath={'spec.infrastructure.spec.resources.limits.cpu'}
              template={template}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              configureOptionsProps={{
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              }}
              className={cx(stepCss.formGroup, stepCss.md)}
            />
          )}

          {isValueRuntimeInput(template?.spec?.infrastructure?.spec?.resources?.limits?.memory) && (
            <TextFieldInputSetView
              name={`${path}spec.infrastructure.spec.resources.limits.memory`}
              placeholder={getString('imagePlaceholder')}
              label={getString('pipelineSteps.limitMemoryLabel')}
              disabled={readonly}
              fieldPath={'spec.infrastructure.spec.resources.limits.memory'}
              template={template}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              configureOptionsProps={{
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              }}
              className={cx(stepCss.formGroup, stepCss.md)}
            />
          )}
        </>
      ) : null}
    </>
  )
}
