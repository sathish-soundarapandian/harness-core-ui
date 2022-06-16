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
  ButtonVariation,
  RUNTIME_INPUT_VALUE
} from '@wings-software/uicore'
import cx from 'classnames'
import { FontVariation } from '@harness/design-system'
import { Form } from 'formik'
import * as Yup from 'yup'

import { defaultTo, get, set } from 'lodash-es'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO, ReleaseRepoManifest } from 'services/cd-ng'
import { ManifestStoreMap, GitRepoName, gitFetchTypeList, GitFetchTypes } from '../Manifesthelper'

import css from '../ManifestWizardSteps/K8sValuesManifest/ManifestDetails.module.scss'

interface ReleaseRepoDataType {
  identifier: string
  branch: string | undefined
  commitId: string | undefined
  gitFetchType: 'Branch' | 'Commit'
  paths: any
  repoName?: string
}
interface ReleaseRepoProps {
  stepName: string
  expressions: string[]
  allowableTypes: MultiTypeInputType[]
  initialValues: ReleaseRepoManifest
  manifest: any
  handleSubmit: (data: ReleaseRepoManifest) => void
  isReadonly?: boolean
}

function RepoDetails({
  stepName,
  expressions,
  handleSubmit,
  prevStepData,
  previousStep,
  manifest,
  isReadonly = false
}: StepProps<ConnectorConfigDTO> & ReleaseRepoProps): React.ReactElement {
  const { getString } = useStrings()

  const getInitialValues = useCallback((): ReleaseRepoDataType => {
    const specValues = get(manifest, 'spec.store.spec', null)
    const pathValue =
      get(specValues, 'paths', []) === RUNTIME_INPUT_VALUE ? specValues.paths : get(specValues, 'paths', [])[0]
    if (specValues) {
      return {
        ...specValues,
        identifier: manifest.identifier,
        paths: pathValue
      }
    }
    return {
      identifier: '',
      branch: undefined,
      commitId: undefined,
      gitFetchType: 'Branch',
      paths: ''
    }
  }, [])

  const submitFormData = (formData: ReleaseRepoDataType & { store?: string; connectorRef?: string }): void => {
    const manifestObj: ReleaseRepoManifest = {
      manifest: {
        identifier: formData.identifier,
        type: 'ReleaseRepo',
        spec: {
          store: {
            type: formData.store,
            spec: {
              connectorRef: formData.connectorRef,
              gitFetchType: formData.gitFetchType,
              paths: [formData.paths]
            }
          }
        }
      }
    }
    /* istanbul ignore else */
    if (manifestObj.manifest.spec.store) {
      if (formData.gitFetchType === 'Branch') {
        set(manifestObj, 'manifest.spec.store.spec.branch', defaultTo(formData.branch, ''))
      } /*istanbul ignore else */ else if (formData.gitFetchType === 'Commit') {
        set(manifestObj, 'manifest.spec.store.spec.commitId', defaultTo(formData.commitId, ''))
      }
    }

    handleSubmit(manifestObj)
  }

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>

      <Formik
        initialValues={getInitialValues()}
        formName="releaseRepoDetails"
        validationSchema={Yup.object().shape({
          //...ManifestIdentifierValidation(manifestIdsList, initialValues?.identifier, getString('pipeline.uniqueName')),
          branch: Yup.string().when('gitFetchType', {
            is: 'Branch',
            then: Yup.string().trim().required(getString('validation.branchName'))
          }),
          commitId: Yup.string().when('gitFetchType', {
            is: 'Commit',
            then: Yup.string().trim().required(getString('validation.commitId'))
          }),
          paths: Yup.string().required()
        })}
        onSubmit={formData => {
          submitFormData({
            ...prevStepData,
            ...formData,
            connectorRef: defaultTo(prevStepData, { connectorRef: '' }).connectorRef
              ? getMultiTypeFromValue(get(prevStepData, 'connectorRef', '')) !== MultiTypeInputType.FIXED
                ? defaultTo(prevStepData, { connectorRef: '' }).connectorRef
                : defaultTo(prevStepData, { connectorRef: '' }).connectorRef.value
              : get(prevStepData, 'identifier', '')
              ? get(prevStepData, 'identifier', '')
              : ''
          })
        }}
      >
        {(formik: { setFieldValue: (a: string, b: string) => void; values: ReleaseRepoDataType }) => {
          return (
            <Form>
              <Layout.Vertical
                flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
                className={css.manifestForm}
              >
                <div className={css.manifestStepWidth}>
                  <div className={css.halfWidth}>
                    <FormInput.Text
                      name="identifier"
                      label={getString('pipeline.manifestType.manifestIdentifier')}
                      placeholder={getString('pipeline.manifestType.manifestPlaceholder')}
                    />
                  </div>

                  <Layout.Horizontal spacing="huge" margin={{ top: 'small', bottom: 'small' }}>
                    <div className={css.halfWidth}>
                      <FormInput.Select
                        name="gitFetchType"
                        label={getString('pipeline.manifestType.gitFetchTypeLabel')}
                        items={gitFetchTypeList}
                      />
                    </div>

                    {get(formik.values, 'gitFetchType', '') === GitFetchTypes.Branch && (
                      <div
                        className={cx(css.halfWidth, {
                          [css.runtimeInput]:
                            getMultiTypeFromValue(get(formik.values, 'branch', '')) === MultiTypeInputType.RUNTIME
                        })}
                      >
                        <FormInput.MultiTextInput
                          multiTextInputProps={{
                            expressions,
                            allowableTypes: [
                              MultiTypeInputType.FIXED,
                              MultiTypeInputType.RUNTIME,
                              MultiTypeInputType.EXPRESSION
                            ]
                          }}
                          label={getString('pipelineSteps.deploy.inputSet.branch')}
                          placeholder={getString('pipeline.manifestType.branchPlaceholder')}
                          name="branch"
                        />

                        {getMultiTypeFromValue(get(formik.values, 'branch', '')) === MultiTypeInputType.RUNTIME && (
                          <ConfigureOptions
                            value={get(formik.values, 'branch', '')}
                            type="String"
                            variableName="branch"
                            showRequiredField={false}
                            showDefaultField={false}
                            showAdvanced={true}
                            onChange={
                              /* istanbul ignore next */
                              value => {
                                /* istanbul ignore next */
                                formik.setFieldValue('branch', value)
                              }
                            }
                            isReadonly={isReadonly}
                          />
                        )}
                      </div>
                    )}

                    {get(formik.values, 'gitFetchType', '') === GitFetchTypes.Commit && (
                      <div
                        className={cx(css.halfWidth, {
                          [css.runtimeInput]:
                            getMultiTypeFromValue(get(formik.values, 'commitId', '')) === MultiTypeInputType.RUNTIME
                        })}
                      >
                        <FormInput.MultiTextInput
                          multiTextInputProps={{
                            expressions,
                            allowableTypes: [
                              MultiTypeInputType.FIXED,
                              MultiTypeInputType.RUNTIME,
                              MultiTypeInputType.EXPRESSION
                            ]
                          }}
                          label={getString('pipeline.manifestType.commitId')}
                          placeholder={getString('pipeline.manifestType.commitPlaceholder')}
                          name="commitId"
                        />

                        {getMultiTypeFromValue(get(formik.values, 'commitId', '')) === MultiTypeInputType.RUNTIME && (
                          <ConfigureOptions
                            value={get(formik.values, 'commitId', '')}
                            type="String"
                            variableName="commitId"
                            showRequiredField={false}
                            showDefaultField={false}
                            showAdvanced={true}
                            onChange={
                              /* istanbul ignore next */
                              value => {
                                /* istanbul ignore next */
                                formik.setFieldValue('commitId', value)
                              }
                            }
                            isReadonly={isReadonly}
                          />
                        )}
                      </div>
                    )}
                  </Layout.Horizontal>
                  <div
                    className={cx(css.halfWidth, {
                      [css.runtimeInput]:
                        getMultiTypeFromValue(get(formik.values, 'paths', '')) === MultiTypeInputType.RUNTIME
                    })}
                  >
                    <FormInput.MultiTextInput
                      multiTextInputProps={{
                        expressions,
                        allowableTypes: [
                          MultiTypeInputType.FIXED,
                          MultiTypeInputType.RUNTIME,
                          MultiTypeInputType.EXPRESSION
                        ]
                      }}
                      label={getString('common.git.filePath')}
                      placeholder={getString('pipeline.manifestType.pathPlaceholder')}
                      name="paths"
                    />

                    {getMultiTypeFromValue(get(formik.values, 'paths', '')) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        value={get(formik.values, 'paths', '')}
                        type="String"
                        variableName="paths"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={
                          /* istanbul ignore next */
                          value => {
                            /* istanbul ignore next */
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
                    onClick={
                      /* istanbul ignore next */
                      () => {
                        /* istanbul ignore next */
                        previousStep?.(prevStepData)
                      }
                    }
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

export default RepoDetails
