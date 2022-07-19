/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Accordion,
  AllowedTypes,
  Button,
  ButtonVariation,
  Formik,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  StepProps,
  Text
} from '@harness/uicore'
import cx from 'classnames'
import { FontVariation } from '@harness/design-system'
import { FieldArray, Form } from 'formik'
import * as Yup from 'yup'
import { defaultTo, get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper } from 'services/cd-ng'
import FileStoreSelectField from '@filestore/components/MultiTypeFileSelect/FileStoreSelect/FileStoreSelectField'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { FormMultiTypeCheckboxField } from '@common/components'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { ManifestIdentifierValidation, ManifestStoreMap } from '../../Manifesthelper'
import type { KustomizeWithHarnessStorePropTypeDataType, ManifestTypes } from '../../ManifestInterface'
import css from '../K8sValuesManifest/ManifestDetails.module.scss'

interface KustomizeWithHarnessStorePropType {
  stepName: string
  allowableTypes: AllowedTypes
  initialValues: ManifestConfig
  selectedManifest: ManifestTypes | null
  handleSubmit: (data: ManifestConfigWrapper) => void
  manifestIdsList: Array<string>
  expressions: Array<string>
  isReadonly?: boolean
}

function KustomizeWithHarnessStore({
  stepName,
  selectedManifest,
  allowableTypes,
  initialValues,
  handleSubmit,
  prevStepData,
  previousStep,
  manifestIdsList,
  expressions,
  isReadonly
}: StepProps<ConnectorConfigDTO> & KustomizeWithHarnessStorePropType): React.ReactElement {
  const { getString } = useStrings()

  const getInitialValues = (): KustomizeWithHarnessStorePropTypeDataType => {
    const specValues = get(initialValues, 'spec.store.spec', null)
    const patchesPaths = get(initialValues, 'spec.patchesPaths')
    if (specValues) {
      return {
        ...specValues,
        identifier: initialValues.identifier,
        manifestScope: get(initialValues, 'spec.manifestScope'),
        skipResourceVersioning: get(initialValues, 'spec.skipResourceVersioning'),
        patchesPaths
      }
    }
    return {
      identifier: '',
      manifestScope: '',
      files: [''],
      patchesPaths: [''],
      skipResourceVersioning: false
    }
  }

  const submitFormData = (formData: KustomizeWithHarnessStorePropTypeDataType & { store?: string }): void => {
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
            },
            patchesPaths: formData.patchesPaths,
            manifestScope: formData.manifestScope,
            skipResourceVersioning: formData.skipResourceVersioning
          }
        }
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
        formName="kustomizeHarnessFileStore"
        validationSchema={Yup.object().shape({
          ...ManifestIdentifierValidation(manifestIdsList, initialValues?.identifier, getString('pipeline.uniqueName')),
          manifestScope: Yup.mixed().required(getString('pipeline.manifestType.folderPathRequired'))
        })}
        onSubmit={formData => {
          submitFormData({
            ...prevStepData,
            ...formData
          } as unknown as KustomizeWithHarnessStorePropTypeDataType)
        }}
      >
        {(formik: {
          setFieldValue: (a: string, b: string) => void
          values: KustomizeWithHarnessStorePropTypeDataType
        }) => {
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
                  <div
                    className={cx(css.halfWidth, {
                      [css.runtimeInput]:
                        getMultiTypeFromValue(formik.values?.manifestScope) === MultiTypeInputType.RUNTIME
                    })}
                  >
                    <FormInput.MultiTextInput
                      name="manifestScope"
                      multiTextInputProps={{ expressions, allowableTypes }}
                      label={getString('pipeline.manifestType.manifestScope')}
                      placeholder={getString('pipeline.manifestType.folderPathPlaceholder')}
                    />
                    {getMultiTypeFromValue(get(formik, 'values.manifestScope')) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center', marginBottom: 4 }}
                        value={get(formik, 'values.manifestScope', '')}
                        type="String"
                        variableName="manifestScope"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={/* istanbul ignore next */ value => formik.setFieldValue('manifestScope', value)}
                        isReadonly={isReadonly}
                      />
                    )}
                  </div>
                  <div className={css.halfWidth}>
                    <MultiTypeFieldSelector
                      defaultValueToReset={[{ path: '', scope: 'account' }]}
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
                                    onClick={/* istanbul ignore next */ () => remove(index)}
                                  />
                                )}
                              </Layout.Horizontal>
                            ))}
                            <span>
                              <Button
                                minimal
                                text={getString('add')}
                                variation={ButtonVariation.PRIMARY}
                                onClick={/* istanbul ignore next */ () => push({})}
                              />
                            </span>
                          </Layout.Vertical>
                        )}
                      />
                    </MultiTypeFieldSelector>
                  </div>
                  <div className={css.halfWidth}>
                    <MultiTypeFieldSelector
                      defaultValueToReset={['']}
                      allowedTypes={
                        (allowableTypes as MultiTypeInputType[]).filter(
                          allowedType => allowedType !== MultiTypeInputType.EXPRESSION
                        ) as AllowedTypes
                      }
                      name="patchesPaths"
                      label={getString('pipeline.manifestTypeLabels.KustomizePatches')}
                    >
                      <FieldArray
                        name="patchesPaths"
                        render={({ push, remove }) => (
                          <Layout.Vertical>
                            {defaultTo(get(formik, 'values.patchesPaths'), []).map((paths: string, index: number) => (
                              <Layout.Horizontal key={paths} margin={{ top: 'medium' }}>
                                <FileStoreSelectField name={`patchesPaths[${index}]`} />

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
                                onClick={/* istanbul ignore next */ () => push('')}
                              />
                            </span>
                          </Layout.Vertical>
                        )}
                      />
                    </MultiTypeFieldSelector>
                  </div>
                  <Accordion
                    activeId={get(initialValues, 'spec.skipResourceVersioning') ? getString('advancedTitle') : ''}
                    className={css.advancedStepOpen}
                  >
                    <Accordion.Panel
                      id={getString('advancedTitle')}
                      addDomId={true}
                      summary={getString('advancedTitle')}
                      details={
                        <Layout.Horizontal
                          width={'50%'}
                          flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
                          margin={{ bottom: 'huge' }}
                        >
                          <FormMultiTypeCheckboxField
                            name="skipResourceVersioning"
                            label={getString('skipResourceVersion')}
                            multiTypeTextbox={{ expressions, allowableTypes }}
                            className={css.checkbox}
                          />
                          {getMultiTypeFromValue(get(formik, 'values.skipResourceVersioning')) ===
                            MultiTypeInputType.RUNTIME && (
                            <ConfigureOptions
                              value={get(formik, 'values.skipResourceVersioning', '') as string}
                              type="String"
                              variableName="skipResourceVersioning"
                              showRequiredField={false}
                              showDefaultField={false}
                              showAdvanced={true}
                              onChange={value => formik.setFieldValue('skipResourceVersioning', value)}
                              style={{ alignSelf: 'center', marginTop: 11 }}
                              className={css.addmarginTop}
                              isReadonly={isReadonly}
                            />
                          )}
                        </Layout.Horizontal>
                      }
                    />
                  </Accordion>
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

export default KustomizeWithHarnessStore
