/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import {
  Layout,
  Button,
  FormInput,
  Formik,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Text,
  StepProps,
  ButtonVariation
} from '@harness/uicore'
import cx from 'classnames'
import { FontVariation } from '@harness/design-system'
import { Form } from 'formik'
import * as Yup from 'yup'

import { get, isEmpty, isUndefined, set } from 'lodash-es'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { Connectors } from '@connectors/constants'

import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { GitRepoName } from '@pipeline/components/ManifestSelection/Manifesthelper'

import {
  ConnectorTypes,
  gitFetchTypeList,
  GitFetchTypes,
  StartupScriptDataType,
  StartupScriptWizardStepTwoProps
} from './StartupScriptInterface.types'
import { HarnessOption } from './HarnessOption'
import css from './StartupScriptSelection.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

function StartupScriptWizardStepTwo({
  stepName,
  expressions,
  allowableTypes,
  initialValues,
  handleSubmit,
  prevStepData,
  previousStep,
  singleAvailableStore,
  isReadonly = false
}: StepProps<ConnectorConfigDTO> & StartupScriptWizardStepTwoProps): React.ReactElement {
  const { getString } = useStrings()

  const modifiedPrevStepData =
    !prevStepData && singleAvailableStore
      ? {
          selectedStore: singleAvailableStore,
          connectorRef: singleAvailableStore
        }
      : prevStepData

  const gitConnectionType: string = modifiedPrevStepData?.selectedStore === Connectors.GIT ? 'connectionType' : 'type'
  const connectionType =
    modifiedPrevStepData?.connectorRef?.connector?.spec?.[gitConnectionType] === GitRepoName.Repo ||
    modifiedPrevStepData?.urlType === GitRepoName.Repo
      ? GitRepoName.Repo
      : GitRepoName.Account

  const getInitialValues = useCallback((): StartupScriptDataType => {
    const specValues = get(initialValues, 'store.spec', null)
    if (specValues && get(initialValues, 'store.type') !== 'Harness') {
      return {
        ...specValues,
        branch: specValues.branch,
        commitId: specValues.commitId,
        repoName: specValues.repoName,
        gitFetchType: specValues.gitFetchType,
        paths:
          typeof specValues.paths === 'string' || isUndefined(specValues.paths) ? specValues.paths : specValues.paths[0]
      }
    }
    return {
      branch: undefined,
      commitId: undefined,
      gitFetchType: 'Branch',
      paths: undefined,
      repoName: undefined
    }
  }, [])

  const submitFormData = (
    formData: StartupScriptDataType & { selectedStore?: string; connectorRef?: string }
  ): void => {
    const startupCommand = {
      store: {
        type: formData?.selectedStore as ConnectorTypes,
        spec: {
          connectorRef: formData?.connectorRef,
          gitFetchType: formData?.gitFetchType,
          paths:
            /* istanbul ignore next */ getMultiTypeFromValue(formData.paths) === MultiTypeInputType.RUNTIME
              ? formData?.paths
              : [formData?.paths]
        }
      }
    }

    if (connectionType === GitRepoName.Account) {
      set(startupCommand, 'store.spec.repoName', formData?.repoName)
    }

    if (startupCommand?.store?.spec) {
      if (formData?.gitFetchType === 'Branch') {
        set(startupCommand, 'store.spec.branch', formData?.branch)
      } else if (formData?.gitFetchType === 'Commit') {
        set(startupCommand, 'store.spec.commitId', formData?.commitId)
      }
    }

    handleSubmit(startupCommand)
  }

  if (modifiedPrevStepData?.selectedStore === 'Harness') {
    return (
      <HarnessOption
        initialValues={initialValues?.store?.type === 'Harness' ? initialValues?.store : undefined}
        stepName={stepName}
        handleSubmit={handleSubmit}
        formName="startupScriptDetails"
        prevStepData={modifiedPrevStepData}
        previousStep={previousStep}
        expressions={expressions}
      />
    )
  }

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>

      <Formik
        initialValues={getInitialValues()}
        formName="startupScriptDetails"
        validationSchema={Yup.object().shape({
          branch: Yup.string().when('gitFetchType', {
            is: 'Branch',
            then: Yup.string().trim().required(getString('validation.branchName'))
          }),
          commitId: Yup.string().when('gitFetchType', {
            is: 'Commit',
            then: Yup.string().trim().required(getString('validation.commitId'))
          }),
          paths: Yup.string()
            .trim()
            .required(
              getString('common.validation.fieldIsRequired', {
                name: getString('pipeline.startup.scriptFilePath')
              })
            ),
          repoName: Yup.string().test('repoName', getString('common.validation.repositoryName'), value => {
            if (connectionType === GitRepoName.Repo) {
              return true
            }
            return !isEmpty(value) && value?.length > 0
          })
        })}
        onSubmit={formData => {
          submitFormData({
            ...modifiedPrevStepData,
            ...formData,
            connectorRef: modifiedPrevStepData?.connectorRef
              ? getMultiTypeFromValue(modifiedPrevStepData?.connectorRef) !== MultiTypeInputType.FIXED
                ? modifiedPrevStepData?.connectorRef
                : modifiedPrevStepData?.connectorRef?.value
              : /* istanbul ignore next */ modifiedPrevStepData?.identifier
              ? modifiedPrevStepData?.identifier
              : ''
          })
        }}
      >
        {(formik: { setFieldValue: (a: string, b: string) => void; values: StartupScriptDataType }) => {
          return (
            <Form>
              <Layout.Vertical
                flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
                className={cx(css.startupScriptForm, css.startupScriptWizard)}
              >
                <div className={css.startupScriptWizard}>
                  {!!(connectionType === GitRepoName.Account) && (
                    <div className={cx(stepCss.formGroup, stepCss.md)}>
                      <FormInput.MultiTextInput
                        multiTextInputProps={{ expressions, allowableTypes }}
                        label={getString('common.repositoryName')}
                        placeholder={getString('common.repositoryName')}
                        name="repoName"
                      />

                      {getMultiTypeFromValue(formik.values?.repoName) === MultiTypeInputType.RUNTIME && (
                        <ConfigureOptions
                          value={formik.values?.repoName as string}
                          type="String"
                          variableName="repoName"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={/* istanbul ignore next */ value => formik.setFieldValue('repoName', value)}
                          isReadonly={isReadonly}
                        />
                      )}
                    </div>
                  )}
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.Select
                      name="gitFetchType"
                      label={getString('pipeline.manifestType.gitFetchTypeLabel')}
                      items={gitFetchTypeList}
                    />
                  </div>
                  {formik.values?.gitFetchType === GitFetchTypes.Branch && (
                    <div className={cx(stepCss.formGroup, stepCss.md)}>
                      <FormInput.MultiTextInput
                        multiTextInputProps={{ expressions, allowableTypes }}
                        label={getString('pipelineSteps.deploy.inputSet.branch')}
                        placeholder={getString('pipeline.manifestType.branchPlaceholder')}
                        name="branch"
                      />

                      {getMultiTypeFromValue(formik.values?.branch) === MultiTypeInputType.RUNTIME && (
                        <ConfigureOptions
                          value={formik.values?.branch as string}
                          type="String"
                          variableName="branch"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={/* istanbul ignore next */ value => formik.setFieldValue('branch', value)}
                          isReadonly={isReadonly}
                        />
                      )}
                    </div>
                  )}

                  {formik.values?.gitFetchType === GitFetchTypes.Commit && (
                    <div className={cx(stepCss.formGroup, stepCss.md)}>
                      <FormInput.MultiTextInput
                        multiTextInputProps={{ expressions, allowableTypes }}
                        label={getString('pipeline.manifestType.commitId')}
                        placeholder={getString('pipeline.manifestType.commitPlaceholder')}
                        name="commitId"
                      />

                      {getMultiTypeFromValue(formik.values?.commitId) === MultiTypeInputType.RUNTIME && (
                        <ConfigureOptions
                          value={formik.values?.commitId as string}
                          type="String"
                          variableName="commitId"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={/* istanbul ignore next */ value => formik.setFieldValue('commitId', value)}
                          isReadonly={isReadonly}
                        />
                      )}
                    </div>
                  )}
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.MultiTextInput
                      label={getString('pipeline.startup.scriptFilePath')}
                      placeholder={getString('pipeline.startup.scriptFilePath')}
                      name={'paths'}
                      multiTextInputProps={{ expressions, allowableTypes }}
                    />
                    {getMultiTypeFromValue(formik.values?.paths as string) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center', marginTop: 1 }}
                        value={formik.values?.paths as string}
                        type="String"
                        variableName={'paths'}
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={
                          /* istanbul ignore next */ value => {
                            formik.setFieldValue('paths', value)
                          }
                        }
                        isReadonly={isReadonly}
                      />
                    )}
                  </div>
                </div>

                <Layout.Horizontal spacing="medium" className={css.saveBtn}>
                  <Button
                    variation={ButtonVariation.SECONDARY}
                    text={getString('back')}
                    icon="chevron-left"
                    onClick={() => previousStep?.(modifiedPrevStepData)}
                  />
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    type="submit"
                    text={getString('submit')}
                    rightIcon="chevron-right"
                  />
                </Layout.Horizontal>
              </Layout.Vertical>
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export default StartupScriptWizardStepTwo
