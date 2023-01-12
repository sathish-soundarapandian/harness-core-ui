/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { getMultiTypeFromValue, Label, MultiTypeInputType } from '@harness/uicore'
import { defaultTo, get, isEmpty } from 'lodash-es'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { getShellOptions } from '@common/utils/ContainerRunStepUtils'
import MultiTypeListInputSet from '@common/components/MultiTypeListInputSet/MultiTypeListInputSet'
import { getHasValuesAsRuntimeInputFromTemplate } from '@pipeline/utils/CIUtils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import MultiTypeMapInputSet from '@common/components/MultiTypeMapInputSet/MultiTypeMapInputSet'
import { Connectors } from '@connectors/constants'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import type { ContainerStepProps } from './types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './ContainerStep.module.scss'

export default function ContainerStepInputSet(props: ContainerStepProps): React.ReactElement {
  const { template, path, readonly, stepViewType, allowableTypes } = props
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const prefix = isEmpty(path) ? '' : `${path}.`

  const { expressions } = useVariablesExpression()
  const isRuntime = (value: any): boolean => getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME
  const isInfrastructureRuntime =
    isRuntime(template?.spec?.infrastructure?.spec?.connectorRef) ||
    isRuntime(template?.spec?.infrastructure?.spec?.namespace) ||
    isRuntime(template?.spec?.infrastructure?.spec?.resources?.limits?.cpu) ||
    isRuntime(template?.spec?.infrastructure?.spec?.resources?.limits?.memory)

  return (
    <>
      {isRuntime(template?.timeout) && (
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
      {isRuntime(get(template, 'spec.connectorRef', '')) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeConnectorField
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            name={`${path}.connectorRef`}
            label={getString('connector')}
            enableConfigureOptions={false}
            placeholder={getString('select')}
            disabled={readonly}
            multiTypeProps={{ allowableTypes, expressions }}
            type={[Connectors.GCP, Connectors.AWS, Connectors.DOCKER, Connectors.AZURE]}
            setRefValue
            gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
            width={388}
          />
        </div>
      )}

      {isRuntime(template?.spec?.image) && (
        <TextFieldInputSetView
          name={`${path}spec.image`}
          placeholder={getString('imagePlaceholder')}
          label={getString('imageLabel')}
          disabled={readonly}
          fieldPath={'spec.image'}
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

      {isRuntime(template?.spec?.shell) && (
        <SelectInputSetView
          className={cx(stepCss.formGroup, stepCss.md)}
          label={getString('common.shell')}
          name={`${path}.spec.shell`}
          disabled={readonly}
          useValue
          template={template}
          fieldPath={'spec.shell'}
          multiTypeInputProps={{
            selectProps: {
              items: getShellOptions(getString)
            },
            expressions,
            allowableTypes
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          selectItems={getShellOptions(getString)}
        />
      )}

      {isRuntime(template?.spec?.command) && (
        <div className={cx(stepCss.formGroup, stepCss.alignStart, stepCss.md)}>
          <MultiTypeFieldSelector
            name={`${prefix}spec.command`}
            label={getString('commandLabel')}
            defaultValueToReset=""
            disabled={readonly}
            allowedTypes={allowableTypes}
            enableConfigureOptions={true}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
            disableTypeSelection={readonly}
            skipRenderValueInExpressionLabel
            expressionRender={
              /* istanbul ignore next */ () => {
                return (
                  <ShellScriptMonacoField
                    name={`${prefix}spec.command`}
                    scriptType="Bash"
                    disabled={readonly}
                    expressions={expressions}
                  />
                )
              }
            }
          >
            <ShellScriptMonacoField
              name={`${prefix}spec.command`}
              scriptType="Bash"
              disabled={readonly}
              expressions={expressions}
            />
          </MultiTypeFieldSelector>
        </div>
      )}

      {isInfrastructureRuntime ? <Label className={css.infralabel}>{getString('infrastructureText')}</Label> : null}

      {isRuntime(template?.spec?.infrastructure?.spec?.connectorRef) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeConnectorField
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            name={`${path}.spec.infrastructure.spec.connectorRef`}
            label={getString('connector')}
            placeholder={getString('connectors.selectConnector')}
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

      {isRuntime(template?.spec?.infrastructure?.spec?.namespace) && (
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

      {isRuntime(template?.spec?.infrastructure?.spec?.resources?.limits?.cpu) && (
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

      {isRuntime(template?.spec?.infrastructure?.spec?.resources?.limits?.memory) && (
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

      {isRuntime(template?.spec?.outputVariables) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <MultiTypeListInputSet
            name={`${isEmpty(path) ? '' : `${path}.`}spec.outputVariables`}
            multiTypeFieldSelectorProps={{
              label: getString('pipelineSteps.outputVariablesLabel'),
              allowedTypes: [MultiTypeInputType.FIXED]
            }}
            multiTextInputProps={{
              expressions,
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
            }}
            disabled={readonly}
            style={{ marginBottom: 'var(--spacing-small)' }}
            keyName="name"
            withObjectStructure
          />
        </div>
      )}
      {(isRuntime(template?.spec?.envVariables) ||
        (template?.spec?.envVariables && Object.entries(template?.spec?.envVariables).length > 0)) && (
        <MultiTypeMapInputSet
          name={`${isEmpty(path) ? '' : `${path}.`}spec.envVariables`}
          valueMultiTextInputProps={{
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
            expressions
          }}
          multiTypeFieldSelectorProps={{
            label: getString('environmentVariables'),

            allowedTypes: [MultiTypeInputType.FIXED]
          }}
          disabled={readonly}
          hasValuesAsRuntimeInput={getHasValuesAsRuntimeInputFromTemplate({
            template,
            templateFieldName: 'spec.envVariables'
          })}
        />
      )}
    </>
  )
}
