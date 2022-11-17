/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import {
  Button,
  Formik,
  Layout,
  Heading,
  ButtonVariation,
  Text,
  FormInput,
  SelectOption,
  getMultiTypeFromValue,
  Accordion,
  MultiTypeInputType,
  Container,
  Checkbox,
  StepProps,
  AllowedTypes
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import cx from 'classnames'
import { Form } from 'formik'
import { get } from 'lodash-es'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useStrings } from 'framework/strings'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { HarnessOption } from '@pipeline/components/StartupScriptSelection/HarnessOption'
import { formInputNames, formikOnChangeNames, stepTwoValidationSchema, getPath } from './TerraformConfigFormHelper'

import type { Connector } from '../TerraformInterfaces'

import css from './TerraformConfigForm.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
interface TerraformConfigStepTwoProps {
  allowableTypes: AllowedTypes
  isReadonly: boolean
  onSubmitCallBack: any
  isTerraformPlan?: boolean
  isBackendConfig?: boolean
}

export const TerraformConfigStepTwo: React.FC<StepProps<any> & TerraformConfigStepTwoProps> = ({
  previousStep,
  prevStepData,
  onSubmitCallBack,
  isReadonly = false,
  allowableTypes,
  name,
  isTerraformPlan = false,
  isBackendConfig = false
}) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const gitFetchTypes: SelectOption[] = [
    { label: getString('gitFetchTypes.fromBranch'), value: getString('pipelineSteps.deploy.inputSet.branch') },
    { label: getString('gitFetchTypes.fromCommit'), value: getString('pipelineSteps.commitIdValue') }
  ]
  const validationSchema = stepTwoValidationSchema(isTerraformPlan, isBackendConfig, getString)

  const [path, setPath] = React.useState('')

  useEffect(() => {
    setPath(getPath(isTerraformPlan, isBackendConfig))
  }, [isTerraformPlan, isBackendConfig])

  if (prevStepData?.selectedType === 'Harness') {
    let values = get(prevStepData.formValues, `${getPath(isTerraformPlan, isBackendConfig)}.store`)
    if (values?.type !== 'Harness') {
      values = null
    }
    return (
      <HarnessOption
        initialValues={values}
        stepName={name as string}
        handleSubmit={data => {
          /* istanbul ignore next */
          onSubmitCallBack(data, prevStepData)
        }}
        formName="startupScriptDetails"
        prevStepData={prevStepData}
        previousStep={previousStep}
        expressions={expressions}
      />
    )
  }

  return (
    <Layout.Vertical className={css.tfConfigForm}>
      <Heading level={2} style={{ color: Color.BLACK, fontSize: 24, fontWeight: 'bold' }} margin={{ bottom: 'xlarge' }}>
        {name}
      </Heading>
      <Formik
        formName={'tfRemoteWizardForm'}
        initialValues={prevStepData.formValues}
        onSubmit={data => {
          /* istanbul ignore next */
          onSubmitCallBack(data, prevStepData)
        }}
        validationSchema={validationSchema}
      >
        {formik => {
          const connectorValue = get(formik?.values, `${path}.store.spec.connectorRef`) as Connector
          const store = get(formik?.values, `${path}.store.spec`)
          return (
            <Form>
              <div className={css.tfRemoteForm}>
                {(connectorValue?.connector?.spec?.connectionType === 'Account' ||
                  connectorValue?.connector?.spec?.type === 'Account' ||
                  prevStepData?.urlType === 'Account') && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.MultiTextInput
                      label={getString('pipelineSteps.repoName')}
                      name={formInputNames(path).repoName}
                      placeholder={getString('pipelineSteps.repoName')}
                      multiTextInputProps={{ expressions, allowableTypes }}
                    />
                    {
                      /* istanbul ignore next */
                      getMultiTypeFromValue(store?.repoName) === MultiTypeInputType.RUNTIME && (
                        <ConfigureOptions
                          style={{ alignSelf: 'center', marginTop: 1 }}
                          value={store?.repoName as string}
                          type="String"
                          variableName={formikOnChangeNames(path).repoName}
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={value => {
                            formik.setFieldValue(formikOnChangeNames(path).repoName, value)
                          }}
                          isReadonly={isReadonly}
                        />
                      )
                    }
                  </div>
                )}
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.Select
                    items={gitFetchTypes}
                    name={formInputNames(path).gitFetchType}
                    label={getString('pipeline.manifestType.gitFetchTypeLabel')}
                    placeholder={getString('pipeline.manifestType.gitFetchTypeLabel')}
                  />
                </div>
                {store?.gitFetchType === gitFetchTypes[0].value && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.MultiTextInput
                      label={getString('pipelineSteps.deploy.inputSet.branch')}
                      placeholder={getString('pipeline.manifestType.branchPlaceholder')}
                      name={formInputNames(path).branch}
                      multiTextInputProps={{ expressions, allowableTypes }}
                    />
                    {
                      /* istanbul ignore next */
                      getMultiTypeFromValue(store?.branch) === MultiTypeInputType.RUNTIME && (
                        <ConfigureOptions
                          style={{ alignSelf: 'center', marginTop: 1 }}
                          value={store?.branch as string}
                          type="String"
                          variableName={formInputNames(path).branch}
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={value => {
                            formik.setFieldValue(formikOnChangeNames(path).branch, value)
                          }}
                          isReadonly={isReadonly}
                        />
                      )
                    }
                  </div>
                )}

                {store?.gitFetchType === gitFetchTypes[1].value && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.MultiTextInput
                      label={getString('pipeline.manifestType.commitId')}
                      placeholder={getString('pipeline.manifestType.commitPlaceholder')}
                      name={formInputNames(path).commitId}
                      multiTextInputProps={{ expressions, allowableTypes }}
                    />
                    {
                      /* istanbul ignore next */
                      getMultiTypeFromValue(store?.commitId) === MultiTypeInputType.RUNTIME && (
                        <ConfigureOptions
                          style={{ alignSelf: 'center', marginTop: 1 }}
                          value={store?.commitId as string}
                          type="String"
                          variableName={formInputNames(path).commitId}
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={value => {
                            formik.setFieldValue(formikOnChangeNames(path).commitId, value)
                          }}
                          isReadonly={isReadonly}
                        />
                      )
                    }
                  </div>
                )}

                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.MultiTextInput
                    label={getString('common.git.filePath')}
                    placeholder={getString('pipeline.manifestType.pathPlaceholder')}
                    name={formInputNames(path).folderPath}
                    multiTextInputProps={{ expressions, allowableTypes }}
                  />
                  {
                    /* istanbul ignore next */
                    getMultiTypeFromValue(store?.folderPath) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center', marginTop: 1 }}
                        value={store?.folderPath as string}
                        type="String"
                        variableName={formInputNames(path).folderPath}
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => {
                          formik.setFieldValue(formikOnChangeNames(path).folderPath, value)
                        }}
                        isReadonly={isReadonly}
                      />
                    )
                  }
                </div>

                {!isBackendConfig && (
                  <Accordion>
                    <Accordion.Panel
                      id="advanced-config"
                      summary={getString('common.advanced')}
                      details={
                        <Container margin={{ top: 'xsmall' }}>
                          <Text
                            tooltipProps={{ dataTooltipId: 'sourceModule' }}
                            font={{ variation: FontVariation.FORM_LABEL }}
                          >
                            Module Source
                          </Text>

                          <>
                            <Checkbox
                              data-testid={`useConnectorCredentials`}
                              name={formInputNames(path).useConnectorCredentials}
                              label={getString('cd.useConnectorCredentials')}
                              className={css.checkBox}
                              checked={
                                isTerraformPlan
                                  ? formik?.values?.spec?.configuration?.configFiles?.moduleSource
                                      ?.useConnectorCredentials
                                  : formik?.values?.spec?.configuration?.spec?.configFiles?.moduleSource
                                      ?.useConnectorCredentials
                              }
                              onChange={e => {
                                formik.setFieldValue(
                                  formikOnChangeNames(path).useConnectorCredentials,
                                  e.currentTarget.checked
                                )
                              }}
                            />
                          </>
                        </Container>
                      }
                    />
                  </Accordion>
                )}
              </div>

              <Layout.Horizontal spacing="xxlarge">
                <Button
                  text={getString('back')}
                  variation={ButtonVariation.SECONDARY}
                  icon="chevron-left"
                  onClick={() => {
                    previousStep?.(prevStepData)
                  }}
                  data-testid={'previous-button'}
                  data-name="tf-remote-back-btn"
                />
                <Button
                  type="submit"
                  variation={ButtonVariation.PRIMARY}
                  text={getString('submit')}
                  rightIcon="chevron-right"
                />
              </Layout.Horizontal>
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}
