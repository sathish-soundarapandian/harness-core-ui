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
} from '@wings-software/uicore'
import cx from 'classnames'
import { FontVariation } from '@harness/design-system'
import { Form } from 'formik'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import * as Yup from 'yup'

import { get, set } from 'lodash-es'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import DragnDropPaths from '../ManifestSelection/DragnDropPaths'

import css from './StartupScriptSelection.module.scss'

interface StartupScriptWizardStepTwoProps {
  stepName: string
  expressions: string[]
  allowableTypes: MultiTypeInputType[]
  // chage to StartupScriptConfig if it is present in services
  initialValues: any
  handleSubmit: (data: any) => void
  isReadonly?: boolean
}

const gitFetchTypeList = [
  { label: 'Latest from Branch', value: 'Branch' },
  { label: 'Specific Commit Id / Git Tag', value: 'Commit' }
]

enum GitFetchTypes {
  Branch = 'Branch',
  Commit = 'Commit'
}

function StartupScriptWizardStepTwo({
  stepName,
  expressions,
  allowableTypes,
  initialValues,
  handleSubmit,
  prevStepData,
  previousStep,
  isReadonly = false
}: StepProps<ConnectorConfigDTO> & StartupScriptWizardStepTwoProps): React.ReactElement {
  const { getString } = useStrings()

  const getInitialValues = useCallback((): {
    branch: string | undefined
    commitId: string | undefined
    gitFetchType: 'Branch' | 'Commit'
    paths: any
  } => {
    const specValues = get(initialValues, 'spec.store.spec', null)

    if (specValues) {
      return {
        ...specValues,
        paths:
          typeof specValues.paths === 'string'
            ? specValues.paths
            : specValues.paths?.map((path: string) => ({ path, uuid: uuid(path, nameSpace()) }))
      }
    }
    return {
      branch: undefined,
      commitId: undefined,
      gitFetchType: 'Branch',
      paths: [{ path: '', uuid: uuid('', nameSpace()) }]
    }
  }, [])

  const submitFormData = (formData: {
    branch: string | undefined
    commitId: string | undefined
    gitFetchType: 'Branch' | 'Commit'
    paths: any
    store?: string
    connectorRef?: string
  }): void => {
    const startupScript = {
        store: {
          type: formData?.store,
          spec: {
            connectorRef: formData?.connectorRef,
            gitFetchType: formData?.gitFetchType,
            paths:
              typeof formData?.paths === 'string'
                ? formData?.paths
                : formData?.paths?.map((path: { path: string }) => path.path)
          }
        }
      }

    if (startupScript?.store) {
      if (formData?.gitFetchType === 'Branch') {
        set(startupScript, 'store.spec.branch', formData?.branch)
      } else if (formData?.gitFetchType === 'Commit') {
        set(startupScript, 'store.spec.commitId', formData?.commitId)
      }
    }

    handleSubmit(startupScript)
  }

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>

      <Formik
        initialValues={getInitialValues()}
        formName="manifestDetails"
        validationSchema={Yup.object().shape({
          branch: Yup.string().when('gitFetchType', {
            is: 'Branch',
            then: Yup.string().trim().required(getString('validation.branchName'))
          }),
          commitId: Yup.string().when('gitFetchType', {
            is: 'Commit',
            then: Yup.string().trim().required(getString('validation.commitId'))
          }),
          paths: Yup.lazy((value): Yup.Schema<unknown> => {
            if (getMultiTypeFromValue(value as any) === MultiTypeInputType.FIXED) {
              return Yup.array().of(
                Yup.object().shape({
                  path: Yup.string().min(1).required(getString('pipeline.manifestType.pathRequired'))
                })
              )
            }
            return Yup.string().required(getString('pipeline.manifestType.pathRequired'))
          })
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
        {(formik: {
          setFieldValue: (a: string, b: string) => void
          values: {
            branch: string | undefined
            commitId: string | undefined
            gitFetchType: 'Branch' | 'Commit'
            paths: any
          }
        }) => {
          return (
            <Form>
              <Layout.Vertical
                flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
                className={css.manifestForm}
              >
                <div className={css.manifestStepWidth}>
                  <Layout.Horizontal spacing="huge" margin={{ top: 'small', bottom: 'small' }}>
                    <FormInput.Select
                      name="gitFetchType"
                      label={getString('pipeline.manifestType.gitFetchTypeLabel')}
                      items={gitFetchTypeList}
                    />
                    {formik.values?.gitFetchType === GitFetchTypes.Branch && (
                      <div
                        className={cx(css.halfWidth, {
                          [css.runtimeInput]:
                            getMultiTypeFromValue(formik.values?.branch) === MultiTypeInputType.RUNTIME
                        })}
                      >
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
                            onChange={value => formik.setFieldValue('branch', value)}
                            isReadonly={isReadonly}
                          />
                        )}
                      </div>
                    )}

                    {formik.values?.gitFetchType === GitFetchTypes.Commit && (
                      <div
                        className={cx(css.halfWidth, {
                          [css.runtimeInput]:
                            getMultiTypeFromValue(formik.values?.commitId) === MultiTypeInputType.RUNTIME
                        })}
                      >
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
                            onChange={value => formik.setFieldValue('commitId', value)}
                            isReadonly={isReadonly}
                          />
                        )}
                      </div>
                    )}
                  </Layout.Horizontal>
                  <div className={css.halfWidth}>
                    <DragnDropPaths
                      formik={formik}
                      expressions={expressions}
                      allowableTypes={allowableTypes}
                      fieldPath="paths"
                      pathLabel={getString('fileFolderPathText')}
                      placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
                    />
                  </div>
                </div>

                <Layout.Horizontal spacing="medium" className={css.saveBtn}>
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
