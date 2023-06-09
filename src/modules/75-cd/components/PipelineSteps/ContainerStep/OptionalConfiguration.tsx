/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { AllowedTypes, Container, FormInput, getMultiTypeFromValue, MultiTypeInputType, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import type { FormikProps } from 'formik'
import { get } from 'lodash-es'
import { useParams } from 'react-router-dom'

import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'
import { isMultiTypeRuntime } from '@common/utils/utils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useStrings } from 'framework/strings'
import { getImagePullPolicyOptions, tolerationsCustomMap } from '@common/utils/ContainerRunStepUtils'
import Volumes from '@pipeline/components/Volumes/Volumes'
import { FormMultiTypeCheckboxField, Separator } from '@common/components'
import type { StringsMap } from 'stringTypes'
import MultiTypeCustomMap from '@common/components/MultiTypeCustomMap/MultiTypeCustomMap'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { OsTypes } from '@pipeline/utils/constants'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { Connectors } from '@connectors/constants'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import type { ContainerStepData } from './types'

import { getOsTypes } from './helper'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './ContainerStep.module.scss'

export default function OptionalConfiguration(props: {
  formik: FormikProps<ContainerStepData>
  readonly?: boolean
  allowableTypes: AllowedTypes
}): React.ReactElement {
  const { formik, readonly, allowableTypes } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const tolerationsValue = get(formik.values.spec.infrastructure.spec, 'tolerations')
  const showContainerSecurityContext = get(formik.values.spec.infrastructure.spec, 'os') !== OsTypes.Windows
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const renderCheckboxFields = React.useCallback(
    ({
      name,
      stringKey,
      tooltipId
    }: {
      name: string
      stringKey: keyof StringsMap
      tooltipId: string
    }): React.ReactElement => {
      return (
        <>
          <div className={cx(stepCss.formGroup)}>
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
          </div>
        </>
      )
    },
    []
  )

  const renderMultiTypeMap = React.useCallback(
    ({ name, stringKey }: { name: string; stringKey: keyof StringsMap }): React.ReactElement => (
      <div className={cx(stepCss.formGroup, stepCss.xlg, css.bottomMargin)}>
        <MultiTypeMap
          name={name}
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
      </div>
    ),
    [expressions, getString]
  )

  const renderMultiTypeList = React.useCallback(
    ({
      name,
      stringKey,
      tooltipId
    }: {
      name: string
      stringKey: keyof StringsMap
      tooltipId?: string
    }): React.ReactElement => {
      return (
        <>
          <div className={cx(stepCss.formGroup, stepCss.xlg, css.bottomMargin)}>
            <MultiTypeList
              multiTextInputProps={{
                expressions,
                allowableTypes: (allowableTypes as MultiTypeInputType[]).filter(
                  item => !isMultiTypeRuntime(item)
                ) as AllowedTypes
              }}
              formik={formik}
              name={name}
              disabled={readonly}
              multiTypeFieldSelectorProps={{
                label: <Text tooltipProps={{ dataTooltipId: tooltipId }}>{getString(stringKey)}</Text>
              }}
              configureOptionsProps={{
                hideExecutionTimeField: true
              }}
            />
          </div>
        </>
      )
    },
    [expressions, getString]
  )

  const renderContainerSecurityContext = React.useCallback((): JSX.Element => {
    return (
      <>
        <Separator topSeparation={0} />
        <div className={css.tabSubHeading} id="containerSecurityContext">
          {getString('pipeline.buildInfra.containerSecurityContext')}
        </div>
        {renderCheckboxFields({
          name: 'spec.infrastructure.spec.containerSecurityContext.priviliged',
          stringKey: 'pipeline.buildInfra.privileged',
          tooltipId: 'privileged'
        })}
        {renderCheckboxFields({
          name: 'spec.infrastructure.spec.containerSecurityContext.allowPrivilegeEscalation',
          stringKey: 'pipeline.buildInfra.allowPrivilegeEscalation',
          tooltipId: 'allowPrivilegeEscalation'
        })}

        {renderMultiTypeList({
          name: 'spec.infrastructure.spec.containerSecurityContext.capabilities.add',
          stringKey: 'pipeline.buildInfra.addCapabilities',
          tooltipId: 'addCapabilities'
        })}

        {renderMultiTypeList({
          name: 'spec.infrastructure.spec.containerSecurityContext.capabilities.drop',
          stringKey: 'pipeline.buildInfra.dropCapabilities',
          tooltipId: 'dropCapabilities'
        })}

        {renderCheckboxFields({
          name: 'spec.infrastructure.spec.containerSecurityContext.runAsNonRoot',
          stringKey: 'pipeline.buildInfra.runAsNonRoot',
          tooltipId: 'runAsNonRoot'
        })}
        {renderCheckboxFields({
          name: 'spec.infrastructure.spec.containerSecurityContext.readOnlyRootFilesystem',
          stringKey: 'pipeline.buildInfra.readOnlyRootFilesystem',
          tooltipId: 'readOnlyRootFilesystem'
        })}
        <div className={cx(stepCss.formGroup, stepCss.lg, css.bottomMargin)}>
          <FormInput.MultiTextInput
            label={getString('pipeline.stepCommonFields.runAsUser')}
            disabled={readonly}
            name="spec.infrastructure.spec.containerSecurityContext.runAsUser"
            multiTextInputProps={{ expressions, allowableTypes }}
            placeholder="1000"
          />
          {getMultiTypeFromValue(formik.values.spec.infrastructure?.spec?.containerSecurityContext?.runAsUser) ===
            MultiTypeInputType.RUNTIME &&
            !readonly && (
              <ConfigureOptions
                value={formik.values.spec.infrastructure?.spec?.containerSecurityContext?.runAsUser as string}
                type="String"
                variableName="spec.infrastructure.spec.containerSecurityContext.runAsUser"
                showRequiredField={false}
                showDefaultField={false}
                onChange={value => {
                  formik.setFieldValue('spec.infrastructure.spec.containerSecurityContext.runAsUser', value)
                }}
                style={{ marginBottom: 5 }}
                isReadonly={readonly}
                allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
              />
            )}
        </div>
        <Separator topSeparation={0} />
      </>
    )
  }, [expressions, getString])

  return (
    <>
      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormInput.MultiTypeInput
          name="spec.imagePullPolicy"
          label={getString('pipelineSteps.pullLabel')}
          disabled={readonly}
          useValue
          multiTypeInputProps={{
            selectProps: {
              items: getImagePullPolicyOptions(getString),
              addClearBtn: true
            },
            expressions,
            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
          }}
          selectItems={getImagePullPolicyOptions(getString)}
        />
      </div>

      {renderMultiTypeList({
        name: 'spec.outputVariables',
        stringKey: 'pipelineSteps.outputVariablesLabel'
      })}

      {renderMultiTypeMap({
        name: 'spec.envVariables',
        stringKey: 'environmentVariables'
      })}

      <div className={cx(stepCss.formGroup, stepCss.lg, css.bottomMargin)}>
        <FormInput.MultiTypeInput
          name="spec.infrastructure.spec.os"
          label={getString('pipeline.infraSpecifications.selectOs')}
          disabled={readonly}
          useValue
          multiTypeInputProps={{
            selectProps: {
              items: getOsTypes(getString),
              addClearBtn: true
            },
            expressions,
            disabled: readonly,
            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
          }}
          selectItems={getOsTypes(getString)}
        />
      </div>

      <div className={cx(stepCss.xxlg, css.bottomMargin)}>
        <Volumes
          name="spec.infrastructure.spec.volumes"
          formik={formik as FormikProps<unknown>}
          expressions={expressions}
          disabled={readonly}
          allowableTypes={[MultiTypeInputType.FIXED]}
        />
      </div>

      <div className={cx(stepCss.formGroup, stepCss.lg, css.bottomMargin)}>
        <FormInput.MultiTextInput
          label={getString('pipeline.infraSpecifications.serviceAccountName')}
          tooltipProps={{ dataTooltipId: 'serviceAccountName' }}
          name="spec.infrastructure.spec.serviceAccountName"
          placeholder={getString('pipeline.infraSpecifications.serviceAccountNamePlaceholder')}
          multiTextInputProps={{
            disabled: readonly
          }}
        />
        {getMultiTypeFromValue(formik.values.spec.infrastructure?.spec?.serviceAccountName) ===
          MultiTypeInputType.RUNTIME &&
          !readonly && (
            <ConfigureOptions
              value={formik.values.spec.infrastructure?.spec?.serviceAccountName as string}
              type="String"
              variableName="spec.infrastructure.spec.serviceAccountName"
              showRequiredField={false}
              showDefaultField={false}
              onChange={value => {
                formik.setFieldValue('spec.infrastructure.spec.serviceAccountName', value)
              }}
              style={{ marginBottom: 5 }}
              isReadonly={readonly}
              allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
            />
          )}
      </div>

      {renderCheckboxFields({
        name: 'spec.infrastructure.spec.automountServiceAccountToken',
        stringKey: 'pipeline.buildInfra.automountServiceAccountToken',
        tooltipId: 'automountServiceAccountToken'
      })}

      {renderMultiTypeMap({ name: 'spec.infrastructure.spec.labels', stringKey: 'ci.labels' })}

      {renderMultiTypeMap({ name: 'spec.infrastructure.spec.annotations', stringKey: 'common.annotations' })}

      {showContainerSecurityContext && renderContainerSecurityContext()}

      <div className={cx(stepCss.formGroup, stepCss.lg, css.bottomMargin)}>
        <FormInput.MultiTextInput
          tooltipProps={{ dataTooltipId: 'priorityClassName' }}
          label={getString('pipeline.buildInfra.priorityClassName')}
          name="spec.infrastructure.spec.priorityClassName"
          multiTextInputProps={{
            disabled: readonly
          }}
        />
        {getMultiTypeFromValue(formik.values.spec.infrastructure?.spec?.priorityClassName) ===
          MultiTypeInputType.RUNTIME &&
          !readonly && (
            <ConfigureOptions
              value={formik.values.spec.infrastructure?.spec?.priorityClassName as string}
              type="String"
              variableName="spec.infrastructure.spec.priorityClassName"
              showRequiredField={false}
              showDefaultField={false}
              onChange={value => {
                formik.setFieldValue('spec.infrastructure.spec.priorityClassName', value)
              }}
              style={{ marginBottom: 5 }}
              isReadonly={readonly}
              allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
            />
          )}
      </div>

      {renderMultiTypeMap({
        name: 'spec.infrastructure.spec.nodeSelector',
        stringKey: 'pipeline.buildInfra.nodeSelector'
      })}

      <div className={css.bottomMargin}>
        <Container
          className={cx(stepCss.xxlg, css.bottomMargin)}
          {...(typeof tolerationsValue === 'string' &&
            getMultiTypeFromValue(tolerationsValue) === MultiTypeInputType.RUNTIME && { width: 300 })}
        >
          <MultiTypeCustomMap
            name="spec.infrastructure.spec.tolerations"
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
              allowedTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
            }}
            configureOptionsProps={{
              hideExecutionTimeField: true
            }}
            disabled={readonly}
            multiTypeMapKeys={tolerationsCustomMap}
            enableConfigureOptions={false}
          />
        </Container>
      </div>

      <div className={css.bottomMargin}>
        <FormMultiTypeDurationField
          name="spec.infrastructure.spec.initTimeout"
          multiTypeDurationProps={{ expressions, allowableTypes }}
          label={
            <Text
              font={{ variation: FontVariation.FORM_LABEL }}
              margin={{ bottom: 'xsmall' }}
              tooltipProps={{ dataTooltipId: 'timeout' }}
            >
              {getString('pipeline.infraSpecifications.initTimeout')}
            </Text>
          }
          disabled={readonly}
          style={{ width: 300 }}
        />
      </div>
      <div>
        <FormMultiTypeConnectorField
          label={getString('connectors.title.harnessImageConnectorRef')}
          type={Connectors.DOCKER}
          name="spec.infrastructure.spec.harnessImageConnectorRef"
          placeholder={getString('connectors.placeholder.harnessImageConnectorRef')}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          style={{ marginBottom: 10 }}
          multiTypeProps={{ allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME] }}
          disabled={readonly}
          width={300}
          setRefValue
        />
      </div>
    </>
  )
}
