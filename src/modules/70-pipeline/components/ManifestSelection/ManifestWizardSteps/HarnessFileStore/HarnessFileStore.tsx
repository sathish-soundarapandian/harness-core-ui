/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  AllowedTypes,
  Button,
  ButtonVariation,
  Formik,
  FormInput,
  Layout,
  MultiTypeInputType,
  StepProps,
  Text
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { FieldArray, Form } from 'formik'
import * as Yup from 'yup'
import { defaultTo, get, set } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper } from 'services/cd-ng'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import FileStoreSelectField from '@filestore/components/MultiTypeFileSelect/FileStoreSelect/FileStoreSelectField'
import { ManifestDataType, ManifestIdentifierValidation, ManifestStoreMap } from '../../Manifesthelper'
import type { HarnessFileStoreDataType, HarnessFileStoreFormData, ManifestTypes } from '../../ManifestInterface'
import css from '../K8sValuesManifest/ManifestDetails.module.scss'

interface HarnessFileStorePropType {
  stepName: string
  allowableTypes: AllowedTypes
  initialValues: ManifestConfig
  selectedManifest: ManifestTypes | null
  handleSubmit: (data: ManifestConfigWrapper) => void
  manifestIdsList: Array<string>
  isReadonly?: boolean
}

const showValuesPaths = (selectedManifest: ManifestTypes): boolean => {
  return [ManifestDataType.K8sManifest, ManifestDataType.HelmChart].includes(selectedManifest)
}
const showParamsPaths = (selectedManifest: ManifestTypes): boolean => {
  return selectedManifest === ManifestDataType.OpenshiftTemplate
}

function HarnessFileStore({
  stepName,
  selectedManifest,
  allowableTypes,
  initialValues,
  handleSubmit,
  prevStepData,
  previousStep,
  manifestIdsList
}: StepProps<ConnectorConfigDTO> & HarnessFileStorePropType): React.ReactElement {
  const { getString } = useStrings()

  const getInitialValues = (): HarnessFileStoreDataType => {
    const specValues = get(initialValues, 'spec.store.spec', null)
    const valuesPaths = get(initialValues, 'spec.valuesPaths')
    const paramsPaths = get(initialValues, 'spec.paramsPaths')
    if (specValues) {
      return {
        ...specValues,
        identifier: initialValues.identifier,
        valuesPaths,
        paramsPaths
      }
    }
    return {
      identifier: '',
      files: [''],
      valuesPaths: [''],
      paramsPaths: ['']
    }
  }

  const submitFormData = (formData: HarnessFileStoreFormData & { store?: string }): void => {
    /* istanbul ignore else */
    if (formData) {
      const manifestObj: ManifestConfigWrapper = {
        manifest: {
          identifier: formData.identifier,
          type: selectedManifest as ManifestTypes,
          spec: {
            store: {
              type: ManifestStoreMap.Harness,
              spec: {
                files: formData.files
              }
            }
          }
        }
      }
      if (showValuesPaths(selectedManifest as ManifestTypes)) {
        set(manifestObj, 'manifest.spec.valuesPaths', formData.valuesPaths)
      }
      if (showParamsPaths(selectedManifest as ManifestTypes)) {
        set(manifestObj, 'manifest.spec.paramsPaths', formData.paramsPaths)
      }

      handleSubmit(manifestObj)
    }
  }

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>

      <Formik
        initialValues={getInitialValues()}
        formName="harnessFileStore"
        validationSchema={Yup.object().shape({
          ...ManifestIdentifierValidation(manifestIdsList, initialValues?.identifier, getString('pipeline.uniqueName'))
        })}
        onSubmit={formData => {
          submitFormData({
            ...prevStepData,
            ...formData
          } as unknown as HarnessFileStoreFormData)
        }}
      >
        {(formik: { setFieldValue: (a: string, b: string) => void; values: HarnessFileStoreDataType }) => {
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
                  <div className={css.halfWidth}>
                    <MultiTypeFieldSelector
                      defaultValueToReset={['']}
                      allowedTypes={
                        (allowableTypes as MultiTypeInputType[]).filter(
                          allowedType => allowedType !== MultiTypeInputType.EXPRESSION
                        ) as AllowedTypes
                      }
                      name="files"
                      label={getString('resourcePage.fileStore')}
                    >
                      <FieldArray
                        name="files"
                        render={({ push, remove }) => (
                          <Layout.Vertical>
                            {defaultTo(get(formik, 'values.files'), []).map((file: string, index: number) => (
                              <Layout.Horizontal key={file} margin={{ top: 'medium' }}>
                                <FileStoreSelectField name={`files[${index}]`} />
                                {index !== 0 && (
                                  /* istanbul ignore next */ <Button
                                    minimal
                                    icon="main-trash"
                                    onClick={() => remove(index)}
                                  />
                                )}
                              </Layout.Horizontal>
                            ))}
                            <span>
                              <Button
                                minimal
                                text={getString('add')}
                                variation={ButtonVariation.PRIMARY}
                                onClick={() => push({})}
                              />
                            </span>
                          </Layout.Vertical>
                        )}
                      />
                    </MultiTypeFieldSelector>
                  </div>
                  {showValuesPaths(selectedManifest as ManifestTypes) && (
                    <div className={css.halfWidth}>
                      <MultiTypeFieldSelector
                        defaultValueToReset={['']}
                        allowedTypes={
                          (allowableTypes as MultiTypeInputType[]).filter(
                            allowedType => allowedType !== MultiTypeInputType.EXPRESSION
                          ) as AllowedTypes
                        }
                        name="valuesPaths"
                        label={getString('pipeline.manifestType.valuesYamlPath')}
                      >
                        <FieldArray
                          name="valuesPaths"
                          render={({ push, remove }) => (
                            <Layout.Vertical>
                              {defaultTo(get(formik, 'values.valuesPaths'), []).map((paths: string, index: number) => (
                                <Layout.Horizontal key={paths} margin={{ top: 'medium' }}>
                                  <FileStoreSelectField name={`valuesPaths[${index}]`} />

                                  {index !== 0 && (
                                    /* istanbul ignore next */ <Button
                                      minimal
                                      icon="main-trash"
                                      onClick={() => remove(index)}
                                    />
                                  )}
                                </Layout.Horizontal>
                              ))}
                              <span>
                                <Button
                                  minimal
                                  text={getString('add')}
                                  variation={ButtonVariation.PRIMARY}
                                  onClick={() => push('')}
                                />
                              </span>
                            </Layout.Vertical>
                          )}
                        />
                      </MultiTypeFieldSelector>
                    </div>
                  )}
                  {showParamsPaths(selectedManifest as ManifestTypes) && (
                    <div className={css.halfWidth}>
                      <MultiTypeFieldSelector
                        defaultValueToReset={['']}
                        allowedTypes={
                          (allowableTypes as MultiTypeInputType[]).filter(
                            allowedType => allowedType !== MultiTypeInputType.EXPRESSION
                          ) as AllowedTypes
                        }
                        name="paramsPaths"
                        label={getString('pipeline.manifestType.paramsYamlPath')}
                      >
                        <FieldArray
                          name="paramsPaths"
                          render={({ push, remove }) => (
                            <Layout.Vertical>
                              {defaultTo(get(formik, 'values.paramsPaths'), []).map((paths: string, index: number) => (
                                <Layout.Horizontal key={paths} margin={{ top: 'medium' }}>
                                  <FileStoreSelectField name={`paramsPaths[${index}]`} />

                                  {index !== 0 && (
                                    /* istanbul ignore next */ <Button
                                      minimal
                                      icon="main-trash"
                                      onClick={() => remove(index)}
                                    />
                                  )}
                                </Layout.Horizontal>
                              ))}
                              <span>
                                <Button
                                  minimal
                                  text={getString('add')}
                                  variation={ButtonVariation.PRIMARY}
                                  onClick={() => push('')}
                                />
                              </span>
                            </Layout.Vertical>
                          )}
                        />
                      </MultiTypeFieldSelector>
                    </div>
                  )}
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

export default HarnessFileStore
