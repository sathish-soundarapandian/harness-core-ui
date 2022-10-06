/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import {
  Text,
  Formik,
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormikForm,
  Accordion,
  Container,
  Layout
} from '@wings-software/uicore'
import { isEmpty, get } from 'lodash-es'
import { Color } from '@harness/design-system'
import type { FormikProps } from 'formik'
import { useLocation } from 'react-router-dom'
import { StepFormikFowardRef, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import StepCommonFields, {
  GetImagePullPolicyOptions,
  GetShellOptions
} from '@ci/components/PipelineSteps/StepCommonFields/StepCommonFields'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { MultiTypeSelectField } from '@common/components/MultiTypeSelect/MultiTypeSelect'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { CIBuildInfrastructureType } from '@pipeline/utils/constants'
import type { BackgroundStepProps, BackgroundStepData, BackgroundStepDataUI } from './BackgroundStep'
import { transformValuesFieldsConfig, getEditViewValidateFieldsConfig } from './BackgroundStepFunctionConfigs'
import { CIStepOptionalConfig, getOptionalSubLabel, PathnameParams } from '../CIStep/CIStepOptionalConfig'
import {
  AllMultiTypeInputTypesForStep,
  SupportedInputTypesForListItems,
  SupportedInputTypesForListTypeField,
  useGetPropagatedStageById,
  validateConnectorRefAndImageDepdendency
} from '../CIStep/StepUtils'
import { CIStep } from '../CIStep/CIStep'
import { ConnectorRefWithImage } from '../CIStep/ConnectorRefWithImage'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const BackgroundStepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly, stepViewType, onChange }: BackgroundStepProps,
  formikRef: StepFormikFowardRef<BackgroundStepData>
): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId }
    }
  } = usePipelineContext()

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const currentStage = useGetPropagatedStageById(selectedStageId || '')

  const buildInfrastructureType: CIBuildInfrastructureType =
    get(currentStage, 'stage.spec.infrastructure.type') || get(currentStage, 'stage.spec.runtime.type')
  const isBuildInfrastructureTypeVM = [
    CIBuildInfrastructureType.VM,
    CIBuildInfrastructureType.Cloud,
    CIBuildInfrastructureType.Docker
  ].includes(buildInfrastructureType)
  const pathnameParams = useLocation()?.pathname?.split('/') || []

  const isTemplateStudio = pathnameParams.includes(PathnameParams.TEMPLATE_STUDIO)

  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<BackgroundStepData, BackgroundStepDataUI>(
        initialValues,
        transformValuesFieldsConfig,
        { imagePullPolicyOptions: GetImagePullPolicyOptions(), shellOptions: GetShellOptions(getString) }
      )}
      formName="ciBackgroundStep"
      validate={valuesToValidate => {
        /* If a user configures AWS VMs as an infra, the steps can be executed directly on the VMS or in a container on a VM. 
        For the latter case, even though Container Registry and Image are optional for AWS VMs infra, they both need to be specified for container to be spawned properly */
        const vmConnectorRefImageDependencyError = validateConnectorRefAndImageDepdendency(
          get(valuesToValidate, 'spec.connectorRef', ''),
          get(valuesToValidate, 'spec.image', ''),
          getString
        )
        if (isBuildInfrastructureTypeVM && !isEmpty(vmConnectorRefImageDependencyError)) {
          return vmConnectorRefImageDependencyError
        }
        const schemaValues = getFormValuesInCorrectFormat<BackgroundStepDataUI, BackgroundStepData>(
          valuesToValidate,
          transformValuesFieldsConfig
        )
        onChange?.(schemaValues)
        return validate(
          valuesToValidate,
          getEditViewValidateFieldsConfig(isBuildInfrastructureTypeVM),
          {
            initialValues,
            steps: currentStage?.stage?.spec?.execution?.steps || {},
            serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || [],
            getString
          },
          stepViewType
        )
      }}
      onSubmit={(_values: BackgroundStepDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<BackgroundStepDataUI, BackgroundStepData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<BackgroundStepData>) => {
        // This is required
        setFormikRef?.(formikRef, formik)

        return (
          <FormikForm>
            <CIStep
              isNewStep={isNewStep}
              readonly={readonly}
              stepViewType={stepViewType}
              formik={formik}
              enableFields={{
                name: {},
                description: {}
              }}
            />
            {![
              CIBuildInfrastructureType.VM,
              CIBuildInfrastructureType.Cloud,
              CIBuildInfrastructureType.Docker
            ].includes(buildInfrastructureType) ? (
              <ConnectorRefWithImage showOptionalSublabel={false} readonly={readonly} stepViewType={stepViewType} />
            ) : null}
            <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
              <MultiTypeSelectField
                name="spec.shell"
                label={
                  <Text
                    tooltipProps={{ dataTooltipId: 'run_shell' }}
                    className={css.inpLabel}
                    color={Color.GREY_600}
                    font={{ size: 'small', weight: 'semi-bold' }}
                  >
                    {getString('common.shell')}
                  </Text>
                }
                multiTypeInputProps={{
                  selectItems: GetShellOptions(getString),
                  placeholder: getString('select'),
                  multiTypeInputProps: {
                    expressions,
                    selectProps: { items: GetShellOptions(getString) },
                    allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                  },
                  disabled: readonly
                }}
                disabled={readonly}
                configureOptionsProps={{ variableName: 'spec.shell' }}
              />
            </Container>

            <div className={cx(css.fieldsGroup, css.withoutSpacing, css.topPadding3, css.bottomPadding3)}>
              <MultiTypeList
                name="spec.entrypoint"
                multiTextInputProps={{
                  expressions,
                  allowableTypes: SupportedInputTypesForListItems
                }}
                multiTypeFieldSelectorProps={{
                  label: (
                    <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                      <Text
                        style={{ display: 'flex', alignItems: 'center' }}
                        className={css.inpLabel}
                        color={Color.GREY_800}
                        font={{ size: 'small', weight: 'semi-bold' }}
                      >
                        {getString('entryPointLabel')}
                      </Text>
                      &nbsp;
                      {getOptionalSubLabel(getString, 'dependencyEntryPoint')}
                    </Layout.Horizontal>
                  ),
                  allowedTypes: SupportedInputTypesForListTypeField
                }}
                disabled={readonly}
              />
            </div>
            <div className={cx(css.fieldsGroup, css.withoutSpacing, css.topPadding3, css.bottomPadding3)}>
              <MultiTypeFieldSelector
                name="spec.command"
                label={
                  <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                    <Text
                      color={Color.GREY_800}
                      font={{ size: 'normal', weight: 'bold' }}
                      className={css.inpLabel}
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      {getString('commandLabel')}
                    </Text>
                    &nbsp;
                    {getOptionalSubLabel(getString, 'command')}
                  </Layout.Horizontal>
                }
                defaultValueToReset=""
                skipRenderValueInExpressionLabel
                allowedTypes={AllMultiTypeInputTypesForStep}
                expressionRender={() => {
                  return (
                    <ShellScriptMonacoField
                      title={getString('commandLabel')}
                      name="spec.command"
                      scriptType="Bash"
                      expressions={expressions}
                      disabled={readonly}
                    />
                  )
                }}
                style={{ flexGrow: 1, marginBottom: 0 }}
                disableTypeSelection={readonly}
              >
                <ShellScriptMonacoField
                  title={getString('commandLabel')}
                  name="spec.command"
                  scriptType="Bash"
                  disabled={readonly}
                  expressions={expressions}
                />
              </MultiTypeFieldSelector>
              {getMultiTypeFromValue(formik?.values?.spec?.command) === MultiTypeInputType.RUNTIME && (
                <ConfigureOptions
                  style={{ marginTop: 17 }}
                  value={formik?.values?.spec?.command as string}
                  type={getString('string')}
                  variableName="spec.command"
                  showRequiredField={false}
                  showDefaultField={false}
                  showAdvanced={true}
                  onChange={value => formik?.setFieldValue('spec.command', value)}
                  isReadonly={readonly}
                />
              )}
            </div>
            <Accordion className={css.accordion}>
              <Accordion.Panel
                id="additional-config"
                summary={getString('pipeline.additionalConfiguration')}
                details={
                  <Container margin={{ top: 'medium' }}>
                    {isBuildInfrastructureTypeVM ? (
                      <ConnectorRefWithImage
                        showOptionalSublabel={true}
                        readonly={readonly}
                        stepViewType={stepViewType}
                      />
                    ) : null}
                    <CIStepOptionalConfig
                      stepViewType={stepViewType}
                      readonly={readonly}
                      enableFields={{
                        'spec.privileged': {
                          shouldHide: [
                            CIBuildInfrastructureType.Cloud,
                            CIBuildInfrastructureType.VM,
                            CIBuildInfrastructureType.KubernetesHosted,
                            CIBuildInfrastructureType.Docker
                          ].includes(buildInfrastructureType)
                        },
                        'spec.reportPaths': {},
                        'spec.envVariables': {},
                        ...((isBuildInfrastructureTypeVM || isTemplateStudio) && {
                          'spec.portBindings': {}
                        })
                      }}
                    />
                    <StepCommonFields
                      enableFields={['spec.imagePullPolicy']}
                      disabled={readonly}
                      buildInfrastructureType={buildInfrastructureType}
                      withoutTimeout={true}
                    />
                  </Container>
                }
              />
            </Accordion>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const BackgroundStepBaseWithRef = React.forwardRef(BackgroundStepBase)
