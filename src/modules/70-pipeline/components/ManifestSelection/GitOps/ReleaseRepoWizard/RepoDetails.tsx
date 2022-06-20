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
import { gitFetchTypeList, GitFetchTypes } from '../../Manifesthelper'

import css from '../../ManifestWizardSteps/K8sValuesManifest/ManifestDetails.module.scss'

interface ReleaseRepoDataType {
  identifier: string
  branch?: string | undefined
  commitId?: string | undefined
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

function RepoDetailsFooter({
  backLabel,
  submitLabel,
  previousStep,
  prevStepData
}: {
  backLabel: string
  submitLabel: string
  previousStep: any
  prevStepData: any
}): React.ReactElement {
  return (
    <Layout.Horizontal spacing="medium" className={css.saveBtn}>
      <Button
        variation={ButtonVariation.SECONDARY}
        text={backLabel}
        icon="chevron-left"
        onClick={
          /* istanbul ignore next */
          () => {
            /* istanbul ignore next */
            previousStep?.(prevStepData)
          }
        }
      />
      <Button variation={ButtonVariation.PRIMARY} type="submit" text={submitLabel} rightIcon="chevron-right" />
    </Layout.Horizontal>
  )
}

function FormField({
  formik,
  placholder,
  label,
  expressions,
  isReadonly,
  allowableTypes,
  fieldName
}: {
  formik: any
  placholder: string
  expressions: string[]
  label: string
  isReadonly: boolean
  allowableTypes: MultiTypeInputType[]
  fieldName: string
}): React.ReactElement {
  return (
    <div
      className={cx(css.halfWidth, {
        [css.runtimeInput]: getMultiTypeFromValue(get(formik.values, fieldName, '')) === MultiTypeInputType.RUNTIME
      })}
    >
      <FormInput.MultiTextInput
        placeholder={placholder}
        name={fieldName}
        multiTextInputProps={{
          expressions,
          allowableTypes
        }}
        label={label}
      />

      {getMultiTypeFromValue(get(formik.values, fieldName, '')) === MultiTypeInputType.RUNTIME && (
        <ConfigureOptions
          showRequiredField={false}
          showDefaultField={false}
          value={get(formik.values, fieldName, '')}
          type="String"
          variableName={fieldName}
          showAdvanced={true}
          onChange={
            /* istanbul ignore next */
            value => {
              /* istanbul ignore next */
              formik.setFieldValue(fieldName, value)
            }
          }
          isReadonly={isReadonly}
        />
      )}
    </div>
  )
}

const submitFormData = (
  formData: ReleaseRepoDataType & { store?: string; connectorRef?: string },
  handleSubmit: (data: ReleaseRepoManifest) => void
): void => {
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
      /* istanbul ignore next */
      set(manifestObj, 'manifest.spec.store.spec.commitId', defaultTo(formData.commitId, ''))
    }
  }

  handleSubmit(manifestObj)
}

function RepoDetails({
  stepName,
  expressions,
  handleSubmit,
  prevStepData,
  previousStep,
  manifest,
  allowableTypes,
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

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>

      <Formik
        initialValues={getInitialValues()}
        formName="releaseRepoDetails"
        validationSchema={Yup.object().shape({
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
          submitFormData(
            {
              ...prevStepData,
              ...formData,
              connectorRef: defaultTo(prevStepData, { connectorRef: '' }).connectorRef
                ? getMultiTypeFromValue(get(prevStepData, 'connectorRef', '')) !== MultiTypeInputType.FIXED
                  ? defaultTo(prevStepData, { connectorRef: '' }).connectorRef
                  : defaultTo(prevStepData, { connectorRef: '' }).connectorRef.value
                : get(prevStepData, 'identifier', '')
                ? get(prevStepData, 'identifier', '')
                : ''
            },
            handleSubmit
          )
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
                      <FormField
                        formik={formik}
                        label={getString('pipelineSteps.deploy.inputSet.branch')}
                        placholder={getString('pipeline.manifestType.branchPlaceholder')}
                        expressions={expressions}
                        isReadonly={isReadonly}
                        fieldName={'branch'}
                        allowableTypes={allowableTypes}
                      />
                    )}

                    {get(formik.values, 'gitFetchType', '') === GitFetchTypes.Commit && (
                      <FormField
                        formik={formik}
                        label={getString('pipeline.manifestType.commitId')}
                        placholder={getString('pipeline.manifestType.commitPlaceholder')}
                        expressions={expressions}
                        isReadonly={isReadonly}
                        fieldName={'commitId'}
                        allowableTypes={allowableTypes}
                      />
                    )}
                  </Layout.Horizontal>

                  <FormField
                    formik={formik}
                    label={getString('common.git.filePath')}
                    placholder={getString('pipeline.manifestType.pathPlaceholder')}
                    expressions={expressions}
                    isReadonly={isReadonly}
                    fieldName={'paths'}
                    allowableTypes={allowableTypes}
                  />
                </div>
                <RepoDetailsFooter
                  backLabel={getString('back')}
                  submitLabel={getString('submit')}
                  previousStep={previousStep}
                  prevStepData={prevStepData}
                />
              </Layout.Vertical>
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export default RepoDetails
