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
  AllowedTypes as MultiTypeAllowedTypes,
  StepProps
} from '@harness/uicore'
import cx from 'classnames'
import { FontVariation } from '@harness/design-system'
import { Form } from 'formik'
import * as Yup from 'yup'
import { get, isEmpty, isUndefined, set } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { Connectors } from '@connectors/constants'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { ConnectorTypes, GitRepoName, gitFetchTypeList, GitFetchTypes } from './types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import styles from './styles.module.scss'

interface StepTwoProps {
  stepName: string
  expressions: string[]
  allowableTypes: MultiTypeAllowedTypes
  initialValues: any
  handleSubmit: (data: any) => void
  prevStepData?: any
  previousStep?: any
  isReadonly: boolean
}

const StepTwo: React.FC<StepProps<any> & StepTwoProps> = ({
  stepName,
  expressions,
  allowableTypes,
  initialValues,
  handleSubmit,
  prevStepData,
  previousStep,
  isReadonly = false
}) => {
  const { getString } = useStrings()
  const gitConnectionType: string = prevStepData?.store === Connectors.GIT ? 'connectionType' : 'type'
  const connectionType =
    prevStepData?.connectorRef?.connector?.spec?.[gitConnectionType] === GitRepoName.Repo ||
      prevStepData?.urlType === GitRepoName.Repo
      ? GitRepoName.Repo
      : GitRepoName.Account
  const getInitialValues = useCallback(() => {
    const specValues = get(initialValues, `spec.configuration.spec.store.spec`, '')
    if (specValues) {
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

  const submitFormData = (formData: any & { store?: string; connectorRef?: string }): void => {
    const remoteFileStore = {
      type: formData?.store as ConnectorTypes,
      spec: {
        connectorRef: formData?.connectorRef,
        gitFetchType: formData?.gitFetchType,
        ...(formData?.gitFetchType === 'Branch' ? { branch: formData?.branch } : { commitId: formData?.commitId }),
        paths:
          getMultiTypeFromValue(formData.paths) === MultiTypeInputType.RUNTIME ? formData?.paths : [formData?.paths]
      }
    }

    if (connectionType === GitRepoName.Account) {
      set(remoteFileStore, 'spec.repoName', formData?.repoName)
    }

    handleSubmit(remoteFileStore)
  }

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={styles.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>

      <Formik
        initialValues={getInitialValues()}
        formName={`remoteStoreDetails`}
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
                name: getString('common.git.filePath')
              })
            ),
          repoName: Yup.string().test(
            'repoName',
            getString('common.validation.fieldIsRequired', {
              name: getString('common.repositoryName')
            }),
            value => {
              if (
                connectionType === GitRepoName.Repo ||
                getMultiTypeFromValue(prevStepData?.connectorRef) !== MultiTypeInputType.FIXED
              ) {
                return true
              }
              return !isEmpty(value) && value?.length > 0
            }
          )
        })}
        onSubmit={formData => {
          submitFormData({
            ...prevStepData,
            ...formData,
            connectorRef: prevStepData?.connectorRef
              ? getMultiTypeFromValue(prevStepData?.connectorRef) !== MultiTypeInputType.FIXED
                ? prevStepData?.connectorRef
                : prevStepData?.connectorRef?.value
              : prevStepData?.identifier
                ? prevStepData?.identifier
                : ''
          })
        }}
      >
        {({ setFieldValue, values }) => (
          <Form>
            <Layout.Vertical
              flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
              className={cx(styles.form, styles.scriptWizard)}
            >
              <div className={styles.scriptWizard}>
                {!!(
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

                      {getMultiTypeFromValue(values?.repoName) === MultiTypeInputType.RUNTIME && (
                        <ConfigureOptions
                          value={values?.repoName as string}
                          type="String"
                          variableName="repoName"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={value => setFieldValue('repoName', value)}
                          isReadonly={isReadonly}
                          allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
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
                {values?.gitFetchType === GitFetchTypes.Branch && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.MultiTextInput
                      multiTextInputProps={{ expressions, allowableTypes }}
                      label={getString('common.branchName')}
                      placeholder={getString('pipeline.manifestType.branchPlaceholder')}
                      name="branch"
                    />

                    {getMultiTypeFromValue(values?.branch) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        value={values?.branch as string}
                        type="String"
                        variableName="branch"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => setFieldValue('branch', value)}
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

                    {getMultiTypeFromValue(values?.commitId) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        value={values?.commitId as string}
                        type="String"
                        variableName="commitId"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => setFieldValue('commitId', value)}
                        isReadonly={isReadonly}
                        allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                      />
                    )}
                  </div>
                )}
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.MultiTextInput
                    label={getString('common.git.filePath')}
                    placeholder={getString('common.git.filePath')}
                    name={'paths'}
                    multiTextInputProps={{ expressions, allowableTypes }}
                  />
                  {getMultiTypeFromValue(values?.paths as string) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ alignSelf: 'center', marginTop: 1 }}
                      value={values?.paths as string}
                      type="String"
                      variableName={'paths'}
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => setFieldValue('paths', value)}
                      isReadonly={isReadonly}
                      allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                    />
                  )}
                </div>
              </div>

              <Layout.Horizontal spacing="medium" className={styles.saveBtn}>
                <Button
                  variation={ButtonVariation.SECONDARY}
                  text={getString('back')}
                  icon="chevron-left"
                  onClick={() => previousStep?.(prevStepData)}
                />
                <Button
                  variation={ButtonVariation.PRIMARY}
                  type="submit"
                  text={getString('submit')}
                  rightIcon="chevron-right"
                  data-testid="submit"
                />
              </Layout.Horizontal>
            </Layout.Vertical>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default StepTwo
