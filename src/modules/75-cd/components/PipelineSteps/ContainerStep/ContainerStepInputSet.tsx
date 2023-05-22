/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Label, MultiTypeInputType, Text } from '@harness/uicore'
import { defaultTo, isEmpty } from 'lodash-es'
import { FontVariation } from '@harness/design-system'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { connect } from 'formik'
import { useStrings } from 'framework/strings'
import { getShellOptions, tolerationsCustomMap } from '@common/utils/ContainerRunStepUtils'
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
import type { StringsMap } from 'stringTypes'
import { FormMultiTypeCheckboxField } from '@common/components'
import { isValueRuntimeInput } from '@common/utils/utils'
import MultiTypeCustomMap from '@common/components/MultiTypeCustomMap/MultiTypeCustomMap'
import type { ContainerStepProps } from './types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './ContainerStep.module.scss'

function ContainerStepInputSetBasic(props: ContainerStepProps): React.ReactElement {
  const { template, path, readonly, stepViewType, allowableTypes, formik } = props

  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const prefix = isEmpty(path) ? '' : `${path}.`
  const { expressions } = useVariablesExpression()
  const infrastructureSpec = template?.spec?.infrastructure?.spec

  const infrastructureFields = ['infrastructure']
  const hasInfrastructureFields = infrastructureFields.some(field => Object.keys(template?.spec || {}).includes(field))

  const containerSecurityContextFields = ['containerSecurityContext']
  const hasContainerSecurityContextFields = containerSecurityContextFields.some(field =>
    Object.keys(infrastructureSpec || {}).includes(field)
  )

  const renderMultiTextInputSet = React.useCallback(
    ({
      name,
      labelKey,
      fieldPath
    }: {
      name: string
      labelKey: keyof StringsMap
      fieldPath: string
    }): React.ReactElement => (
      <TextFieldInputSetView
        name={name}
        label={getString(labelKey)}
        disabled={readonly}
        fieldPath={fieldPath}
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
    ),
    [expressions, getString]
  )

  const renderMultiTypeMapInputSet = React.useCallback(
    ({
      fieldName,
      stringKey,
      hasValuesAsRuntimeInput
    }: {
      fieldName: string
      stringKey: keyof StringsMap
      hasValuesAsRuntimeInput: boolean
    }): React.ReactElement => (
      <MultiTypeMapInputSet
        appearance={'minimal'}
        cardStyle={{ width: '50%' }}
        name={fieldName}
        valueMultiTextInputProps={{ expressions, allowableTypes }}
        multiTypeFieldSelectorProps={{
          label: (
            <Text font={{ variation: FontVariation.FORM_LABEL }} margin={{ bottom: 'xsmall' }}>
              {getString(stringKey)}
            </Text>
          ),
          disableTypeSelection: true,
          allowedTypes: [MultiTypeInputType.FIXED]
        }}
        disabled={readonly}
        formik={formik}
        hasValuesAsRuntimeInput={hasValuesAsRuntimeInput}
      />
    ),
    [expressions, getString]
  )

  const renderMultiTypeCheckboxInputSet = React.useCallback(
    ({
      name,
      labelKey,
      tooltipId,
      defaultTrue
    }: {
      name: string
      labelKey: keyof StringsMap
      tooltipId: string
      defaultTrue?: boolean
    }): React.ReactElement => (
      <div className={cx(stepCss.formGroup, stepCss.md)}>
        <FormMultiTypeCheckboxField
          name={name}
          label={getString(labelKey)}
          defaultTrue={defaultTrue}
          multiTypeTextbox={{
            expressions,
            allowableTypes,
            disabled: readonly
          }}
          tooltipProps={{ dataTooltipId: tooltipId }}
          setToFalseWhenEmpty={true}
          disabled={readonly}
        />
      </div>
    ),
    [expressions, getString]
  )

  const renderMultiTypeListInputSet = React.useCallback(
    ({
      name,
      labelKey,
      tooltipId
    }: {
      name: string
      labelKey: keyof StringsMap
      tooltipId: string
    }): React.ReactElement => (
      <div className={cx(stepCss.formGroup, stepCss.md)}>
        <MultiTypeListInputSet
          name={name}
          multiTextInputProps={{
            expressions,
            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
          }}
          formik={formik}
          multiTypeFieldSelectorProps={{
            label: (
              <Text font={{ variation: FontVariation.FORM_LABEL }} tooltipProps={{ dataTooltipId: tooltipId }}>
                {getString(labelKey)}
              </Text>
            ),
            allowedTypes: [MultiTypeInputType.FIXED]
          }}
          disabled={readonly}
        />
      </div>
    ),
    [expressions, getString]
  )

  return (
    <>
      {isValueRuntimeInput(template?.timeout) && (
        <TimeoutFieldInputSetView
          label={getString('pipelineSteps.timeoutLabel')}
          name={`${prefix}timeout`}
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

      {isValueRuntimeInput(template?.spec?.connectorRef) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeConnectorField
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            name={`${prefix}spec.connectorRef`}
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

      {isValueRuntimeInput(template?.spec?.image) &&
        renderMultiTextInputSet({
          name: `${prefix}spec.image`,
          labelKey: 'imageLabel',
          fieldPath: 'spec.image'
        })}

      {isValueRuntimeInput(template?.spec?.shell) && (
        <SelectInputSetView
          className={cx(stepCss.formGroup, stepCss.md)}
          label={getString('common.shell')}
          name={`${prefix}spec.shell`}
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

      {isValueRuntimeInput(template?.spec?.command) && (
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

      {hasInfrastructureFields && <Label className={css.infralabel}>{getString('infrastructureText')}</Label>}

      {isValueRuntimeInput(infrastructureSpec?.connectorRef) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeConnectorField
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            name={`${prefix}spec.infrastructure.spec.connectorRef`}
            label={getString('connector')}
            placeholder={getString('common.entityPlaceholderText')}
            disabled={readonly}
            multiTypeProps={{ allowableTypes, expressions }}
            type={Connectors.K8sCluster}
            setRefValue
            gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
            templateProps={{
              isTemplatizedView: true,
              templateValue: infrastructureSpec?.connectorRef
            }}
            width={388}
          />
        </div>
      )}

      {isValueRuntimeInput(infrastructureSpec?.namespace) &&
        renderMultiTextInputSet({
          name: `${prefix}spec.infrastructure.spec.namespace`,
          labelKey: 'common.namespace',
          fieldPath: 'spec.infrastructure.spec.namespace'
        })}

      {isValueRuntimeInput(infrastructureSpec?.resources?.limits?.cpu) &&
        renderMultiTextInputSet({
          name: `${prefix}spec.infrastructure.spec.resources.limits.cpu`,
          labelKey: 'pipelineSteps.limitCPULabel',
          fieldPath: 'pipelineSteps.limitCPULabel'
        })}

      {isValueRuntimeInput(infrastructureSpec?.resources?.limits?.memory) &&
        renderMultiTextInputSet({
          name: `${prefix}spec.infrastructure.spec.resources.limits.memory`,
          labelKey: 'pipelineSteps.limitMemoryLabel',
          fieldPath: 'spec.infrastructure.spec.resources.limits.memory'
        })}

      {isValueRuntimeInput(template?.spec?.outputVariables as string) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <MultiTypeListInputSet
            name={`${prefix}spec.outputVariables`}
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

      {(isValueRuntimeInput(template?.spec?.envVariables) ||
        (template?.spec?.envVariables && Object.entries(template?.spec?.envVariables).length > 0)) &&
        renderMultiTypeMapInputSet({
          fieldName: `${prefix}spec.envVariables`,
          stringKey: 'environmentVariables',
          hasValuesAsRuntimeInput: getHasValuesAsRuntimeInputFromTemplate({
            template,
            templateFieldName: 'spec.envVariables'
          })
        })}

      {isValueRuntimeInput(infrastructureSpec?.serviceAccountName) &&
        renderMultiTextInputSet({
          name: `${prefix}spec.infrastructure.spec.serviceAccountName`,
          labelKey: 'pipeline.infraSpecifications.serviceAccountName',
          fieldPath: 'spec.infrastructure.spec.serviceAccountName'
        })}

      {isValueRuntimeInput(infrastructureSpec?.automountServiceAccountToken) &&
        renderMultiTypeCheckboxInputSet({
          name: `${prefix}spec.infrastructure.spec.automountServiceAccountToken`,
          labelKey: 'pipeline.buildInfra.automountServiceAccountToken',
          tooltipId: 'automountServiceAccountToken'
        })}

      {(isValueRuntimeInput(infrastructureSpec?.labels) ||
        (infrastructureSpec?.labels && Object.entries(infrastructureSpec?.labels).length > 0)) &&
        renderMultiTypeMapInputSet({
          fieldName: `${prefix}spec.infrastructure.spec.labels`,
          stringKey: 'ci.labels',
          hasValuesAsRuntimeInput: true
        })}

      {(isValueRuntimeInput(infrastructureSpec?.annotations) ||
        (infrastructureSpec?.annotations && Object.entries(infrastructureSpec?.annotations).length > 0)) &&
        renderMultiTypeMapInputSet({
          fieldName: `${prefix}spec.infrastructure.spec.annotations`,
          stringKey: 'ci.annotations',
          hasValuesAsRuntimeInput: true
        })}

      {hasContainerSecurityContextFields && (
        <Label className={css.infralabel}>{getString('pipeline.buildInfra.containerSecurityContext')}</Label>
      )}

      {isValueRuntimeInput(infrastructureSpec?.containerSecurityContext?.privilege) &&
        renderMultiTypeCheckboxInputSet({
          name: `${prefix}spec.infrastructure.spec.containerSecurityContext.priviliged`,
          labelKey: 'pipeline.buildInfra.privileged',
          tooltipId: 'privileged'
        })}

      {isValueRuntimeInput(infrastructureSpec?.containerSecurityContext?.allowPrivilegeEscalation) &&
        renderMultiTypeCheckboxInputSet({
          name: `${prefix}spec.infrastructure.spec.containerSecurityContext.allowPrivilegeEscalation`,
          labelKey: 'pipeline.buildInfra.allowPrivilegeEscalation',
          tooltipId: 'allowPrivilegeEscalation'
        })}

      {isValueRuntimeInput(infrastructureSpec?.containerSecurityContext?.capabilities?.add) &&
        renderMultiTypeListInputSet({
          name: `${prefix}spec.infrastructure.spec.containerSecurityContext.capabilities.add`,
          labelKey: 'pipeline.buildInfra.addCapabilities',
          tooltipId: 'addCapabilities'
        })}

      {isValueRuntimeInput(infrastructureSpec?.containerSecurityContext?.capabilities?.drop) &&
        renderMultiTypeListInputSet({
          name: `${prefix}spec.infrastructure.spec.containerSecurityContext.capabilities.drop`,
          labelKey: 'pipeline.buildInfra.dropCapabilities',
          tooltipId: 'dropCapabilities'
        })}

      {isValueRuntimeInput(infrastructureSpec?.containerSecurityContext?.runAsNonRoot) &&
        renderMultiTypeCheckboxInputSet({
          name: `${prefix}spec.infrastructure.spec.containerSecurityContext.runAsNonRoot`,
          labelKey: 'pipeline.buildInfra.runAsNonRoot',
          tooltipId: 'runAsNonRoot'
        })}

      {isValueRuntimeInput(infrastructureSpec?.containerSecurityContext?.readOnlyRootFilesystem) &&
        renderMultiTypeCheckboxInputSet({
          name: `${prefix}spec.infrastructure.spec.containerSecurityContext.readOnlyRootFilesystem`,
          labelKey: 'pipeline.buildInfra.readOnlyRootFilesystem',
          tooltipId: 'readOnlyRootFilesystem'
        })}

      {isValueRuntimeInput(infrastructureSpec?.containerSecurityContext?.runAsUser) &&
        renderMultiTextInputSet({
          name: `${prefix}spec.infrastructure.spec.containerSecurityContext.runAsUser`,
          labelKey: 'pipeline.stepCommonFields.runAsUser',
          fieldPath: 'spec.containerSecurityContext.runAsUser'
        })}

      {isValueRuntimeInput(infrastructureSpec?.priorityClassName) &&
        renderMultiTextInputSet({
          name: `${prefix}spec.infrastructure.spec.priorityClassName`,
          labelKey: 'pipeline.buildInfra.priorityClassName',
          fieldPath: 'spec.infrastructure.spec.priorityClassName'
        })}

      {(isValueRuntimeInput(infrastructureSpec?.nodeSelector) ||
        (infrastructureSpec?.nodeSelector && Object.entries(infrastructureSpec?.nodeSelector).length > 0)) &&
        renderMultiTypeMapInputSet({
          fieldName: `${prefix}spec.infrastructure.spec.nodeSelector`,
          stringKey: 'pipeline.buildInfra.nodeSelector',
          hasValuesAsRuntimeInput: true
        })}

      {isValueRuntimeInput(infrastructureSpec?.tolerations) && (
        <Container data-name="100width" className={cx(stepCss.formGroup, stepCss.bottomMargin3)}>
          <MultiTypeCustomMap
            name={`${prefix}spec.infrastructure.spec.tolerations`}
            appearance={'minimal'}
            cardStyle={{ width: '50%' }}
            valueMultiTextInputProps={{
              expressions,
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
            }}
            formik={formik}
            multiTypeFieldSelectorProps={{
              label: (
                <Text
                  font={{ variation: FontVariation.FORM_LABEL }}
                  margin={{ bottom: 'xsmall' }}
                  tooltipProps={{ dataTooltipId: 'tolerations' }}
                >
                  {getString('pipeline.buildInfra.tolerations')}
                </Text>
              ),
              allowedTypes: [MultiTypeInputType.FIXED]
            }}
            disabled={readonly}
            multiTypeMapKeys={tolerationsCustomMap}
            excludeId={true}
          />
        </Container>
      )}

      {isValueRuntimeInput(infrastructureSpec?.initTimeout) && (
        <TimeoutFieldInputSetView
          label={getString('pipeline.infraSpecifications.initTimeout')}
          name={`${prefix}spec.infrastructure.spec.initTimeout`}
          disabled={readonly}
          multiTypeDurationProps={{
            configureOptionsProps: {
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            },
            allowableTypes,
            expressions,
            disabled: readonly
          }}
          fieldPath={'spec.infrastructure.spec.initTimeout'}
          template={template}
          className={cx(stepCss.formGroup, stepCss.sm)}
        />
      )}
    </>
  )
}

const ContainerStepInputSet = connect(ContainerStepInputSetBasic)
export { ContainerStepInputSet }
