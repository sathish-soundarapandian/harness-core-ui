/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { defaultTo, get, isEmpty } from 'lodash-es'
import { connect, FormikProps } from 'formik'
import { getMultiTypeFromValue, MultiTypeInputType, AllowedTypes } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import type { StringsMap } from 'framework/strings/StringsContext'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { MultiTypeListInputSet } from '@common/components/MultiTypeListInputSet/MultiTypeListInputSet'
import { MultiTypeCustomMap } from '@common/components/MultiTypeCustomMap/MultiTypeCustomMap'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { FormMultiTypeCheckboxField } from '@common/components'
import { MultiTypeMapInputSet } from '@common/components/MultiTypeMapInputSet/MultiTypeMapInputSet'
import { Connectors } from '@connectors/constants'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import type { InputSetDTO } from '@pipeline/utils/types'
import Volumes from '@pipeline/components/Volumes/Volumes'
import type { K8sDirectInfraStepGroupElementConfig } from './StepGroupUtil'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface StepGroupStepInputSetProps {
  allowableTypes: AllowedTypes
  inputSetData: {
    template?: K8sDirectInfraStepGroupElementConfig
    path?: string
    readonly?: boolean
    allValues?: K8sDirectInfraStepGroupElementConfig
  }
  formik?: FormikProps<InputSetDTO>
}

function StepGroupStepInputSet(props: StepGroupStepInputSetProps): React.ReactElement {
  const { inputSetData, allowableTypes, formik } = props
  const { template, path, readonly } = inputSetData

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const prefix = isEmpty(path) ? '' : `${path}.`

  const renderMultiTypeMapInputSet = ({
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
        label: getString(stringKey),
        disableTypeSelection: true,
        allowedTypes: [MultiTypeInputType.FIXED]
      }}
      disabled={readonly}
      formik={formik}
      hasValuesAsRuntimeInput={hasValuesAsRuntimeInput}
    />
  )

  const renderMultiTypeListInputSet = ({
    name,
    labelKey
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
          label: getString(labelKey),
          allowedTypes: [MultiTypeInputType.FIXED]
        }}
        disabled={readonly}
      />
    </div>
  )

  return (
    <>
      {getMultiTypeFromValue(template?.stepGroupInfra?.spec.connectorRef) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeConnectorField
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            name={`${prefix}stepGroupInfra.spec.connectorRef`}
            label={getString('connectors.title.k8sCluster')}
            enableConfigureOptions={false}
            placeholder={getString('common.entityPlaceholderText')}
            disabled={readonly}
            multiTypeProps={{ allowableTypes, expressions }}
            setRefValue
            gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
            templateProps={{
              isTemplatizedView: true,
              templateValue: get(template, `stepGroupInfra.spec.connectorRef`)
            }}
            width={416}
          />
        </div>
      )}

      {getMultiTypeFromValue(template?.stepGroupInfra?.spec.namespace) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            name={`${prefix}stepGroupInfra.spec.namespace`}
            label={getString('common.namespace')}
            placeholder={getString('pipeline.infraSpecifications.namespacePlaceholder')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            fieldPath={`stepGroupInfra.spec.namespace`}
            template={template}
          />
        </div>
      )}

      {getMultiTypeFromValue(template?.sharedPaths) === MultiTypeInputType.RUNTIME &&
        renderMultiTypeListInputSet({
          name: `${prefix}sharedPaths`,
          labelKey: 'pipelineSteps.build.stageSpecifications.sharedPaths',
          tooltipId: 'sharedPaths'
        })}

      {getMultiTypeFromValue(template?.stepGroupInfra?.spec.volumes as string) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <Volumes
            name={`${prefix}stepGroupInfra.spec.volumes`}
            formik={formik as unknown as FormikProps<unknown>}
            expressions={expressions}
            disabled={readonly}
            allowableTypes={[MultiTypeInputType.FIXED]}
          />
        </div>
      )}

      {getMultiTypeFromValue(template?.stepGroupInfra?.spec.serviceAccountName) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            name={`${prefix}stepGroupInfra.spec.serviceAccountName`}
            label={getString('pipeline.infraSpecifications.serviceAccountName')}
            placeholder={getString('pipeline.infraSpecifications.serviceAccountNamePlaceholder')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            fieldPath={`stepGroupInfra.spec.serviceAccountName`}
            template={template}
          />
        </div>
      )}

      {getMultiTypeFromValue(template?.stepGroupInfra?.spec.automountServiceAccountToken) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeCheckboxField
            name={`${prefix}stepGroupInfra.spec.automountServiceAccountToken`}
            label={getString('pipeline.buildInfra.automountServiceAccountToken')}
            multiTypeTextbox={{
              expressions,
              allowableTypes,
              disabled: readonly
            }}
            setToFalseWhenEmpty={true}
            disabled={readonly}
          />
        </div>
      )}

      {template?.stepGroupInfra?.spec.labels && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          {renderMultiTypeMapInputSet({
            fieldName: `${prefix}stepGroupInfra.spec.labels`,
            stringKey: 'ci.labels',
            hasValuesAsRuntimeInput: true
          })}
        </div>
      )}

      {template?.stepGroupInfra?.spec.annotations && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          {renderMultiTypeMapInputSet({
            fieldName: `${prefix}stepGroupInfra.spec.annotations`,
            stringKey: 'common.annotations',
            hasValuesAsRuntimeInput: true
          })}
        </div>
      )}

      {getMultiTypeFromValue(template?.stepGroupInfra?.spec.containerSecurityContext?.privileged) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeCheckboxField
            name={`${prefix}stepGroupInfra.spec.containerSecurityContext.privileged`}
            label={getString('pipeline.buildInfra.privileged')}
            multiTypeTextbox={{
              expressions,
              allowableTypes,
              disabled: readonly
            }}
            setToFalseWhenEmpty={true}
            disabled={readonly}
            tooltipProps={{
              dataTooltipId: 'privileged'
            }}
          />
        </div>
      )}

      {getMultiTypeFromValue(template?.stepGroupInfra?.spec.containerSecurityContext?.allowPrivilegeEscalation) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeCheckboxField
            name={`${prefix}stepGroupInfra.spec.containerSecurityContext.allowPrivilegeEscalation`}
            label={getString('pipeline.buildInfra.allowPrivilegeEscalation')}
            multiTypeTextbox={{
              expressions,
              allowableTypes,
              disabled: readonly
            }}
            setToFalseWhenEmpty={true}
            disabled={readonly}
            tooltipProps={{
              dataTooltipId: 'allowPrivilegeEscalation'
            }}
          />
        </div>
      )}

      {template?.stepGroupInfra?.spec.containerSecurityContext?.capabilities?.add &&
        renderMultiTypeListInputSet({
          name: `${prefix}stepGroupInfra.spec.containerSecurityContext.capabilities.add`,
          labelKey: 'pipeline.buildInfra.addCapabilities',
          tooltipId: 'addCapabilities'
        })}

      {template?.stepGroupInfra?.spec.containerSecurityContext?.capabilities?.drop &&
        renderMultiTypeListInputSet({
          name: `${prefix}stepGroupInfra.spec.containerSecurityContext.capabilities.drop`,
          labelKey: 'pipeline.buildInfra.dropCapabilities',
          tooltipId: 'dropCapabilities'
        })}

      {getMultiTypeFromValue(template?.stepGroupInfra?.spec.containerSecurityContext?.runAsNonRoot) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeCheckboxField
            name={`${prefix}stepGroupInfra.spec.containerSecurityContext.runAsNonRoot`}
            label={getString('pipeline.buildInfra.runAsNonRoot')}
            multiTypeTextbox={{
              expressions,
              allowableTypes,
              disabled: readonly
            }}
            setToFalseWhenEmpty={true}
            disabled={readonly}
            tooltipProps={{
              dataTooltipId: 'runAsNonRoot'
            }}
          />
        </div>
      )}

      {getMultiTypeFromValue(template?.stepGroupInfra?.spec.containerSecurityContext?.readOnlyRootFilesystem) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeCheckboxField
            name={`${prefix}stepGroupInfra.spec.containerSecurityContext.readOnlyRootFilesystem`}
            label={getString('pipeline.buildInfra.readOnlyRootFilesystem')}
            multiTypeTextbox={{
              expressions,
              allowableTypes,
              disabled: readonly
            }}
            setToFalseWhenEmpty={true}
            disabled={readonly}
            tooltipProps={{
              dataTooltipId: 'readOnlyRootFilesystem'
            }}
          />
        </div>
      )}

      {getMultiTypeFromValue(template?.stepGroupInfra?.spec.containerSecurityContext?.runAsUser) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            name={`${prefix}stepGroupInfra.spec.containerSecurityContext.runAsUser`}
            label={getString('pipeline.stepCommonFields.runAsUser')}
            placeholder={'1000'}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes,
              placeholder: '1000'
            }}
            fieldPath={`stepGroupInfra.spec.containerSecurityContext.runAsUser`}
            template={template}
            tooltipProps={{
              dataTooltipId: 'runAsUser'
            }}
          />
        </div>
      )}

      {getMultiTypeFromValue(template?.stepGroupInfra?.spec?.priorityClassName) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            name={`${prefix}stepGroupInfra.spec.priorityClassName`}
            label={getString('pipeline.buildInfra.priorityClassName')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            fieldPath={`stepGroupInfra.spec.priorityClassName`}
            template={template}
            tooltipProps={{
              dataTooltipId: 'priorityClassName'
            }}
          />
        </div>
      )}

      {template?.stepGroupInfra?.spec.nodeSelector && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          {renderMultiTypeMapInputSet({
            fieldName: `${prefix}stepGroupInfra.spec.nodeSelector`,
            stringKey: 'pipeline.buildInfra.nodeSelector',
            hasValuesAsRuntimeInput: true
          })}
        </div>
      )}

      {template?.stepGroupInfra?.spec.tolerations && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <MultiTypeCustomMap
            name={`${prefix}stepGroupInfra.spec.tolerations`}
            appearance={'minimal'}
            cardStyle={{ width: '50%' }}
            valueMultiTextInputProps={{
              expressions,
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
            }}
            formik={formik}
            multiTypeFieldSelectorProps={{
              label: getString('pipeline.buildInfra.tolerations'),
              allowedTypes: allowableTypes
            }}
            disabled={readonly}
            multiTypeMapKeys={[
              { label: getString('pipeline.buildInfra.effect'), value: 'effect' },
              { label: getString('keyLabel'), value: 'key' },
              { label: getString('common.operator'), value: 'operator' },
              { label: getString('valueLabel'), value: 'value' }
            ]}
            excludeId={true}
          />
        </div>
      )}

      {template?.stepGroupInfra?.spec.hostNames &&
        renderMultiTypeListInputSet({
          name: `${prefix}stepGroupInfra.spec.hostNames`,
          labelKey: 'common.hostNames',
          tooltipId: 'hostNames'
        })}

      {getMultiTypeFromValue(template?.stepGroupInfra?.spec.initTimeout) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeDurationField
            name={`${prefix}stepGroupInfra.spec.initTimeout`}
            label={getString('pipelineSteps.timeoutLabel')}
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              allowableTypes,
              expressions,
              disabled: readonly
            }}
            disabled={readonly}
          />
        </div>
      )}

      {getMultiTypeFromValue(template?.stepGroupInfra?.spec.harnessImageConnectorRef) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeConnectorField
            name={`${prefix}stepGroupInfra.spec.harnessImageConnectorRef`}
            label={`${getString('connectors.title.harnessImageConnectorRef')} ${getString('common.optionalLabel')}`}
            placeholder={getString('connectors.placeholder.harnessImageConnectorRef')}
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            disabled={readonly}
            multiTypeProps={{ allowableTypes, expressions }}
            type={Connectors.DOCKER}
            setRefValue
            enableConfigureOptions={false}
            gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
            templateProps={{
              isTemplatizedView: true,
              templateValue: get(template, `stepGroupInfra.spec.harnessImageConnectorRef`)
            }}
            width={416}
          />
        </div>
      )}
    </>
  )
}

export const StepGroupStepInputSetMode = connect(StepGroupStepInputSet)
