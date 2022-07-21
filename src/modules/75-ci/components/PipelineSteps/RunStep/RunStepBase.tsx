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
  Container
} from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import type { FormikProps } from 'formik'
import get from 'lodash/get'
import { StepFormikFowardRef, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
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
import type { RunStepProps, RunStepData, RunStepDataUI } from './RunStep'
import { transformValuesFieldsConfig, getEditViewValidateFieldsConfig } from './RunStepFunctionConfigs'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import {
  AllMultiTypeInputTypesForStep,
  useGetPropagatedStageById,
  validateConnectorRefAndImageDepdendency
} from '../CIStep/StepUtils'
import { CIStep } from '../CIStep/CIStep'
import { ConnectorRefWithImage } from '../CIStep/ConnectorRefWithImage'
import { CIBuildInfrastructureType } from '../../../constants/Constants'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const RunStepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly, stepViewType, onChange }: RunStepProps,
  formikRef: StepFormikFowardRef<RunStepData>
): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId }
    }
  } = usePipelineContext()

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const currentStage = useGetPropagatedStageById(selectedStageId || '')

  const buildInfrastructureType: CIBuildInfrastructureType = get(currentStage, 'stage.spec.infrastructure.type')

  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<RunStepData, RunStepDataUI>(
        initialValues,
        transformValuesFieldsConfig,
        { imagePullPolicyOptions: GetImagePullPolicyOptions(), shellOptions: GetShellOptions(getString) }
      )}
      formName="ciRunStep"
      validate={valuesToValidate => {
        /* If a user configures AWS VMs as an infra, the steps can be executed directly on the VMS or in a container on a VM. 
        For the latter case, even though Container Registry and Image are optional for AWS VMs infra, they both need to be specified for container to be spawned properly */
        if (buildInfrastructureType === CIBuildInfrastructureType.VM) {
          return validateConnectorRefAndImageDepdendency(
            get(valuesToValidate, 'spec.connectorRef', ''),
            get(valuesToValidate, 'spec.image', ''),
            getString
          )
        }
        const schemaValues = getFormValuesInCorrectFormat<RunStepDataUI, RunStepData>(
          valuesToValidate,
          transformValuesFieldsConfig
        )
        onChange?.(schemaValues)
        return validate(
          valuesToValidate,
          getEditViewValidateFieldsConfig(buildInfrastructureType),
          {
            initialValues,
            steps: currentStage?.stage?.spec?.execution?.steps || {},
            serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || [],
            getString
          },
          stepViewType
        )
      }}
      onSubmit={(_values: RunStepDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<RunStepDataUI, RunStepData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<RunStepData>) => {
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
            {buildInfrastructureType !== CIBuildInfrastructureType.VM ? (
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
              <MultiTypeFieldSelector
                name="spec.command"
                label={
                  <Text
                    color={Color.GREY_800}
                    font={{ size: 'normal', weight: 'bold' }}
                    className={css.inpLabel}
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    {getString('commandLabel')}
                  </Text>
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
                id="optional-config"
                summary={getString('common.optionalConfig')}
                details={
                  <Container margin={{ top: 'medium' }}>
                    {buildInfrastructureType === CIBuildInfrastructureType.VM ? (
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
                            CIBuildInfrastructureType.VM,
                            CIBuildInfrastructureType.KubernetesHosted
                          ].includes(buildInfrastructureType)
                        },
                        'spec.reportPaths': {},
                        'spec.envVariables': {},
                        'spec.outputVariables': {}
                      }}
                    />
                    <StepCommonFields
                      enableFields={['spec.imagePullPolicy']}
                      disabled={readonly}
                      buildInfrastructureType={buildInfrastructureType}
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

export const RunStepBaseWithRef = React.forwardRef(RunStepBase)
