/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, get } from 'lodash-es'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import {
  Accordion,
  AllowedTypes,
  Container,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Text
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'

import { useStrings } from 'framework/strings'
import type { StringsMap } from 'framework/strings/StringsContext'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeCheckboxField, Separator } from '@common/components'
import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import { MultiTypeCustomMap } from '@common/components/MultiTypeCustomMap/MultiTypeCustomMap'
import { tolerationsCustomMap } from '@common/utils/ContainerRunStepUtils'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { Connectors } from '@connectors/constants'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import Volumes from '@pipeline/components/Volumes/Volumes'
import { OsTypes } from '@pipeline/utils/constants'
import type { StepGroupFormikValues } from './StepGroupUtil'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './StepGroupStep.module.scss'

interface KubernetesStepGroupInfraProps {
  readonly?: boolean
  allowableTypes?: AllowedTypes
  formikRef: FormikProps<StepGroupFormikValues>
}

export function KubernetesStepGroupInfra(props: KubernetesStepGroupInfraProps): React.ReactElement {
  const { readonly, allowableTypes, formikRef } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, repoName, branch } = useQueryParams<GitQueryParams>()

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const runAsUserStringKey = 'pipeline.stepCommonFields.runAsUser'
  const priorityClassNameStringKey = 'pipeline.buildInfra.priorityClassName'
  const harnessImageConnectorRefKey = 'connectors.title.harnessImageConnectorRef'

  const renderMultiTypeMap = ({
    fieldName,
    stringKey
  }: {
    fieldName: string
    stringKey: keyof StringsMap
  }): React.ReactElement => {
    return (
      <MultiTypeMap
        appearance={'minimal'}
        name={fieldName}
        valueMultiTextInputProps={{ expressions, allowableTypes }}
        multiTypeFieldSelectorProps={{
          label: (
            <Text font={{ variation: FontVariation.FORM_LABEL }} margin={{ bottom: 'xsmall' }}>
              {getString(stringKey)}
            </Text>
          ),
          disableTypeSelection: true
        }}
        configureOptionsProps={{
          hideExecutionTimeField: true
        }}
        disabled={readonly}
      />
    )
  }

  const renderCheckboxFields = ({
    name,
    stringKey,
    tooltipId
  }: {
    name: string
    stringKey: keyof StringsMap
    tooltipId: string
  }): React.ReactElement => {
    return (
      <Container className={cx(stepCss.formGroup, stepCss.md)}>
        <FormMultiTypeCheckboxField
          name={name}
          label={getString(stringKey)}
          multiTypeTextbox={{
            expressions,
            allowableTypes,
            disabled: readonly
          }}
          tooltipProps={{ dataTooltipId: tooltipId }}
          disabled={readonly}
        />
      </Container>
    )
  }

  const renderContainerSecurityContext = (): JSX.Element => {
    return (
      <>
        <Separator topSeparation={0} />
        <div className={css.tabSubHeading} id="containerSecurityContext">
          {getString('pipeline.buildInfra.containerSecurityContext')}
        </div>

        {renderCheckboxFields({
          name: 'privileged',
          stringKey: 'pipeline.buildInfra.privileged',
          tooltipId: 'privileged'
        })}

        {renderCheckboxFields({
          name: 'allowPrivilegeEscalation',
          stringKey: 'pipeline.buildInfra.allowPrivilegeEscalation',
          tooltipId: 'allowPrivilegeEscalation'
        })}

        <Container className={stepCss.formGroup}>
          <MultiTypeList
            name="addCapabilities"
            multiTextInputProps={{
              expressions,
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
            }}
            multiTypeFieldSelectorProps={{
              label: (
                <Text tooltipProps={{ dataTooltipId: 'addCapabilities' }}>
                  {getString('pipeline.buildInfra.addCapabilities')}
                </Text>
              ),
              allowedTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
            }}
            configureOptionsProps={{
              hideExecutionTimeField: true
            }}
            disabled={readonly}
          />
        </Container>

        <Container className={stepCss.formGroup}>
          <MultiTypeList
            name="dropCapabilities"
            multiTextInputProps={{
              expressions,
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
            }}
            multiTypeFieldSelectorProps={{
              label: (
                <Text tooltipProps={{ dataTooltipId: 'dropCapabilities' }}>
                  {getString('pipeline.buildInfra.dropCapabilities')}
                </Text>
              ),
              allowedTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]
            }}
            configureOptionsProps={{
              hideExecutionTimeField: true
            }}
            disabled={readonly}
          />
        </Container>

        {renderCheckboxFields({
          name: 'runAsNonRoot',
          stringKey: 'pipeline.buildInfra.runAsNonRoot',
          tooltipId: 'runAsNonRoot'
        })}

        {renderCheckboxFields({
          name: 'readOnlyRootFilesystem',
          stringKey: 'pipeline.buildInfra.readOnlyRootFilesystem',
          tooltipId: 'readOnlyRootFilesystem'
        })}

        <Container className={stepCss.formGroup}>
          <FormInput.MultiTextInput
            name="runAsUser"
            label={getString(runAsUserStringKey)}
            placeholder={'1000'}
            disabled={readonly}
            multiTextInputProps={{ expressions, textProps: { disabled: readonly }, allowableTypes }}
          />
          {getMultiTypeFromValue(formikRef.values.runAsUser) === MultiTypeInputType.RUNTIME && !readonly && (
            <ConfigureOptions
              style={{ marginBottom: 12 }}
              value={defaultTo(formikRef.values.runAsUser?.toString(), '')}
              type="Number"
              variableName="runAsUser"
              showRequiredField={false}
              showDefaultField={false}
              onChange={value => {
                formikRef.setFieldValue('runAsUser', value)
              }}
              isReadonly={readonly}
              allowedValuesType={ALLOWED_VALUES_TYPE.NUMBER}
            />
          )}
        </Container>
        <Separator topSeparation={0} />
      </>
    )
  }

  const renderAccordianDetailSection = (formik: FormikProps<StepGroupFormikValues>): React.ReactElement => {
    const tolerationsValue = get(formik?.values, 'tolerations')
    const showContainerSecurityContext = get(formikRef?.values, 'os') !== OsTypes.Windows
    return (
      <>
        <Container className={stepCss.formGroup}>
          <MultiTypeList
            name="sharedPaths"
            multiTextInputProps={{
              expressions,
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
            }}
            multiTypeFieldSelectorProps={{
              label: (
                <Text tooltipProps={{ dataTooltipId: 'sharedPaths' }}>
                  {getString('pipelineSteps.build.stageSpecifications.sharedPaths')}
                </Text>
              ),
              allowedTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
            }}
            disabled={readonly}
            configureOptionsProps={{ hideExecutionTimeField: true }}
          />
        </Container>
        <Container className={stepCss.formGroup}>
          <Volumes
            name="volumes"
            formik={formikRef as FormikProps<unknown>}
            expressions={expressions}
            disabled={readonly}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
          />
        </Container>

        <Container className={stepCss.formGroup}>
          <FormInput.MultiTextInput
            name="serviceAccountName"
            label={getString('pipeline.infraSpecifications.serviceAccountName')}
            placeholder={getString('pipeline.infraSpecifications.serviceAccountNamePlaceholder')}
            disabled={readonly}
            multiTextInputProps={{ expressions, textProps: { disabled: readonly }, allowableTypes }}
          />
          {getMultiTypeFromValue(formikRef.values.serviceAccountName) === MultiTypeInputType.RUNTIME && !readonly && (
            <ConfigureOptions
              style={{ marginBottom: 12 }}
              value={formikRef.values.serviceAccountName as string}
              type="String"
              variableName="serviceAccountName"
              showRequiredField={false}
              showDefaultField={false}
              onChange={value => {
                formikRef.setFieldValue('serviceAccountName', value)
              }}
              isReadonly={readonly}
              allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
            />
          )}
        </Container>

        <Container className={stepCss.formGroup}>
          <FormMultiTypeCheckboxField
            name="automountServiceAccountToken"
            label={getString('pipeline.buildInfra.automountServiceAccountToken')}
            multiTypeTextbox={{
              expressions,
              allowableTypes,
              disabled: readonly
            }}
            disabled={readonly}
          />
        </Container>

        <Container className={stepCss.formGroup}>
          {renderMultiTypeMap({ fieldName: 'labels', stringKey: 'pipelineSteps.labelsLabel' })}
        </Container>

        <Container className={stepCss.formGroup}>
          {renderMultiTypeMap({ fieldName: 'annotations', stringKey: 'common.annotations' })}
        </Container>

        {showContainerSecurityContext && renderContainerSecurityContext()}

        <Container className={stepCss.formGroup}>
          <FormInput.MultiTextInput
            name="priorityClassName"
            label={getString(priorityClassNameStringKey)}
            disabled={readonly}
            multiTextInputProps={{ expressions, textProps: { disabled: readonly }, allowableTypes }}
          />
          {getMultiTypeFromValue(formikRef.values.priorityClassName) === MultiTypeInputType.RUNTIME && !readonly && (
            <ConfigureOptions
              style={{ marginBottom: 12 }}
              value={formikRef.values.priorityClassName as string}
              type="String"
              variableName="priorityClassName"
              showRequiredField={false}
              showDefaultField={false}
              onChange={value => {
                formikRef.setFieldValue('priorityClassName', value)
              }}
              isReadonly={readonly}
              allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
            />
          )}
        </Container>

        <Container className={stepCss.formGroup}>
          {renderMultiTypeMap({
            fieldName: 'nodeSelector',
            stringKey: 'pipeline.buildInfra.nodeSelector'
          })}
        </Container>

        <Container
          className={stepCss.formGroup}
          {...(typeof tolerationsValue === 'string' &&
            getMultiTypeFromValue(tolerationsValue) === MultiTypeInputType.RUNTIME && { width: 300 })}
        >
          <MultiTypeCustomMap
            name="tolerations"
            appearance={'minimal'}
            cardStyle={{ width: '50%' }}
            valueMultiTextInputProps={{
              expressions,
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
            }}
            formik={formikRef}
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
              allowedTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]
            }}
            configureOptionsProps={{
              hideExecutionTimeField: true
            }}
            disabled={readonly}
            multiTypeMapKeys={tolerationsCustomMap}
            enableConfigureOptions={false}
          />
        </Container>

        <Container className={stepCss.formGroup}>
          <MultiTypeList
            name="hostNames"
            multiTextInputProps={{
              expressions,
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
            }}
            multiTypeFieldSelectorProps={{
              label: <Text tooltipProps={{ dataTooltipId: 'hostNames' }}>{getString('common.hostNames')}</Text>,
              allowedTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
            }}
            configureOptionsProps={{
              hideExecutionTimeField: true
            }}
            disabled={readonly}
          />
        </Container>

        <Container className={stepCss.formGroup}>
          <FormMultiTypeDurationField
            name="initTimeout"
            multiTypeDurationProps={{ expressions, allowableTypes }}
            label={getString('pipeline.infraSpecifications.initTimeout')}
            disabled={readonly}
          />
        </Container>

        <Container className={stepCss.formGroup}>
          <FormMultiTypeConnectorField
            name="harnessImageConnectorRef"
            label={`${getString(harnessImageConnectorRefKey)} ${getString('common.optionalLabel')}`}
            placeholder={getString('connectors.placeholder.harnessImageConnectorRef')}
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            gitScope={{ repo: defaultTo(repoIdentifier, repoName), branch, getDefaultFromOtherRepo: true }}
            multiTypeProps={{
              disabled: readonly,
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
            }}
            configureOptionsProps={{
              hideExecutionTimeField: true
            }}
            type={Connectors.DOCKER}
            setRefValue
            width={510}
          />
        </Container>
      </>
    )
  }

  return (
    <>
      <div className={cx(stepCss.formGroup)}>
        <FormMultiTypeConnectorField
          type={'K8sCluster'}
          name="connectorRef"
          label={getString('connectors.title.k8sCluster')}
          placeholder={getString('pipelineSteps.build.infraSpecifications.kubernetesClusterPlaceholder')}
          disabled={readonly}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          tooltipProps={{
            dataTooltipId: 'k8sCluster'
          }}
          multiTypeProps={{ expressions, disabled: readonly, allowableTypes }}
          gitScope={{ repo: defaultTo(repoIdentifier, repoName), branch, getDefaultFromOtherRepo: true }}
          setRefValue
          width={510}
        />
      </div>

      <div className={cx(stepCss.formGroup)}>
        <FormInput.MultiTextInput
          name="namespace"
          label={getString('common.namespace')}
          placeholder={getString('pipeline.infraSpecifications.namespacePlaceholder')}
          disabled={readonly}
          multiTextInputProps={{ expressions, textProps: { disabled: readonly }, allowableTypes }}
        />
        {getMultiTypeFromValue(formikRef.values.namespace) === MultiTypeInputType.RUNTIME && !readonly && (
          <ConfigureOptions
            style={{ marginBottom: 12 }}
            value={formikRef.values.namespace as string}
            type="String"
            variableName="namespace"
            showRequiredField={false}
            showDefaultField={false}
            onChange={value => {
              formikRef.setFieldValue('namespace', value)
            }}
            isReadonly={readonly}
            allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
          />
        )}
      </div>

      <Accordion className={stepCss.accordion}>
        <Accordion.Panel
          id="optional-config"
          summary={getString('common.optionalConfig')}
          details={renderAccordianDetailSection(formikRef)}
        />
      </Accordion>
    </>
  )
}
