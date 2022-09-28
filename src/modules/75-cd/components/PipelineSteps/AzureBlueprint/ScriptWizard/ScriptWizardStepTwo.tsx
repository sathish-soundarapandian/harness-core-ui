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
  ButtonVariation,
  AllowedTypes,
  StepProps
} from '@wings-software/uicore'
import cx from 'classnames'
import { FontVariation } from '@harness/design-system'
import { Form } from 'formik'
import * as Yup from 'yup'

import { get, isEmpty, set } from 'lodash-es'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { Connectors } from '@connectors/constants'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { GitRepoName } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { isValueRuntimeInput } from '@common/utils/utils'
import type { ConnectorTypes } from '../../AzureWebAppServiceSpec/AzureWebAppStartupScriptSelection/StartupScriptInterface.types'
import { gitFetchTypeList, GitFetchTypes, AzureBlueprintData } from '../AzureBlueprintTypes.types'
import { HarnessOption } from '../../AzureWebAppServiceSpec/HarnessOption'

import css from './ScriptWizard.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface ScriptWizardStepTwoProps {
  expressions: string[]
  allowableTypes: AllowedTypes
  initialValues: AzureBlueprintData
  handleSubmit: (data: any) => void
  isReadonly: boolean
  name: string
}

export const ScriptWizardStepTwo = ({
  expressions,
  allowableTypes,
  initialValues,
  handleSubmit,
  prevStepData,
  previousStep,
  isReadonly = false,
  name
}: StepProps<ConnectorConfigDTO> & ScriptWizardStepTwoProps): React.ReactElement => {
  const { getString } = useStrings()
  /* istanbul ignore next */
  const gitConnectionType: string = prevStepData?.store === Connectors.GIT ? 'connectionType' : 'type'
  /* istanbul ignore next */
  const connectionType =
    prevStepData?.connectorRef?.connector?.spec?.[gitConnectionType] === GitRepoName.Repo ||
    prevStepData?.urlType === GitRepoName.Repo
      ? GitRepoName.Repo
      : GitRepoName.Account
  const getInitialValues = useCallback(() => {
    const specValues = get(initialValues, `spec.configuration.template.store.spec`, '')
    if (specValues) {
      return {
        ...specValues,
        branch: specValues.branch,
        commitId: specValues.commitId,
        repoName: specValues.repoName,
        gitFetchType: specValues.gitFetchType,
        folderPath: specValues.folderPath
      }
    }
    return {
      branch: undefined,
      commitId: undefined,
      gitFetchType: 'Branch',
      folderPath: undefined,
      repoName: undefined
    }
  }, [])
  /* istanbul ignore next */
  const submitFormData = (formData: any & { store?: string; connectorRef?: string }): void => {
    const remoteFile = {
      type: formData?.store as ConnectorTypes,
      spec: {
        connectorRef: formData?.connectorRef,
        gitFetchType: formData?.gitFetchType,
        folderPath: /* istanbul ignore next */ formData?.folderPath
      }
    }
    /* istanbul ignore next */
    if (connectionType === GitRepoName.Account) {
      set(remoteFile, 'spec.repoName', formData?.repoName)
    }
    /* istanbul ignore next */
    if (remoteFile?.spec) {
      if (formData?.gitFetchType === 'Branch') {
        set(remoteFile, 'spec.branch', formData?.branch)
      } else if (formData?.gitFetchType === 'Commit') {
        set(remoteFile, 'spec.commitId', formData?.commitId)
      }
    }

    handleSubmit(remoteFile)
  }

  if (prevStepData?.store === 'Harness') {
    const values = get(initialValues, `spec.configuration.template.store`, '')
    return (
      <HarnessOption
        initialValues={values}
        stepName={name}
        handleSubmit={
          /* istanbul ignore next */
          data => {
            handleSubmit({
              ...data,
              store: {
                ...data?.store,
                type: 'Harness'
              }
            })
          }
        }
        formName="azureBluePrintScriptDetails"
        prevStepData={prevStepData}
        previousStep={previousStep}
        expressions={expressions}
      />
    )
  }

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {name}
      </Text>

      <Formik
        initialValues={getInitialValues()}
        formName="startupScriptDetails"
        validationSchema={Yup.object().shape({
          gitFetchType: Yup.string(),
          branch: Yup.string().when('gitFetchType', {
            is: 'Branch',
            then: Yup.string().trim().required(getString('validation.branchName'))
          }),
          commitId: Yup.string().when('gitFetchType', {
            is: 'Commit',
            then: Yup.string().trim().required(getString('validation.commitId'))
          }),
          folderPath: Yup.string()
            .trim()
            .required(
              getString('common.validation.fieldIsRequired', {
                name: getString('cd.azureBlueprint.templateFolderPath')
              })
            ),
          repoName: Yup.string().test(
            'repoName',
            getString('common.validation.repositoryName'),
            /* istanbul ignore next */ value => {
              if (
                connectionType === GitRepoName.Repo ||
                getMultiTypeFromValue(prevStepData?.connectorRef) !== MultiTypeInputType.FIXED
              ) {
                return true
              }
              /* istanbul ignore next */
              return !isEmpty(value) && value?.length > 0
            }
          )
        })}
        onSubmit={
          /* istanbul ignore next */ formData => {
            submitFormData({
              ...prevStepData,
              ...formData,
              connectorRef: prevStepData?.connectorRef
                ? getMultiTypeFromValue(prevStepData?.connectorRef) !== MultiTypeInputType.FIXED
                  ? prevStepData?.connectorRef
                  : prevStepData?.connectorRef?.value
                : /* istanbul ignore next */ prevStepData?.identifier || ''
            })
          }
        }
      >
        {({ setFieldValue, values }) => (
          <Form>
            <Layout.Vertical
              flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
              className={cx(css.startupScriptForm, css.scriptWizard)}
            >
              <div className={css.scriptWizard}>
                {
                  /* istanbul ignore next */
                  !!(
                    connectionType === GitRepoName.Account &&
                    getMultiTypeFromValue(prevStepData?.connectorRef) === MultiTypeInputType.FIXED
                  ) && (
                    <div className={cx(stepCss.formGroup, stepCss.md)}>
                      <FormInput.MultiTextInput
                        multiTextInputProps={{ expressions, allowableTypes }}
                        label={getString('common.repositoryName')}
                        placeholder={getString('common.repositoryName')}
                        name="repoName"
                      />
                      {isValueRuntimeInput(values?.repoName) && (
                        <ConfigureOptions
                          value={values?.repoName as string}
                          type="String"
                          variableName="repoName"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={/* istanbul ignore next */ value => setFieldValue('repoName', value)}
                          isReadonly={isReadonly}
                          allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                        />
                      )}
                    </div>
                  )
                }
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.Select
                    name="gitFetchType"
                    label={getString('pipeline.manifestType.gitFetchTypeLabel')}
                    items={gitFetchTypeList}
                  />
                </div>
                {values?.gitFetchType === GitFetchTypes.Branch && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.MultiTextInput
                      multiTextInputProps={{ expressions, allowableTypes }}
                      label={getString('pipelineSteps.deploy.inputSet.branch')}
                      placeholder={getString('pipeline.manifestType.branchPlaceholder')}
                      name="branch"
                    />

                    {isValueRuntimeInput(values?.branch) && (
                      <ConfigureOptions
                        value={values?.branch as string}
                        type="String"
                        variableName="branch"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={/* istanbul ignore next */ value => setFieldValue('branch', value)}
                        isReadonly={isReadonly}
                        allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                      />
                    )}
                  </div>
                )}

                {values?.gitFetchType === GitFetchTypes.Commit && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.MultiTextInput
                      multiTextInputProps={{ expressions, allowableTypes }}
                      label={getString('pipeline.manifestType.commitId')}
                      placeholder={getString('pipeline.manifestType.commitPlaceholder')}
                      name="commitId"
                    />

                    {isValueRuntimeInput(values?.commitId) && (
                      <ConfigureOptions
                        value={values?.commitId as string}
                        type="String"
                        variableName="commitId"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={/* istanbul ignore next */ value => setFieldValue('commitId', value)}
                        isReadonly={isReadonly}
                        allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                      />
                    )}
                  </div>
                )}
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.MultiTextInput
                    label={getString('cd.azureBlueprint.templateFolderPath')}
                    placeholder={getString('cd.azureBlueprint.templateFolderPath')}
                    name={'folderPath'}
                    multiTextInputProps={{ expressions, allowableTypes }}
                  />
                  {isValueRuntimeInput(values?.folderPath as string) && (
                    <ConfigureOptions
                      style={{ alignSelf: 'center', marginTop: 1 }}
                      value={values?.folderPath as string}
                      type="String"
                      variableName={'folderPath'}
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={
                        /* istanbul ignore next */ value => {
                          setFieldValue('folderPath', value)
                        }
                      }
                      isReadonly={isReadonly}
                      allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                    />
                  )}
                </div>
              </div>

              <Layout.Horizontal spacing="medium" className={css.saveBtn}>
                <Button
                  variation={ButtonVariation.SECONDARY}
                  text={getString('back')}
                  icon="chevron-left"
                  onClick={/* istanbul ignore next */ () => previousStep?.(prevStepData)}
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
        )}
      </Formik>
    </Layout.Vertical>
  )
}
