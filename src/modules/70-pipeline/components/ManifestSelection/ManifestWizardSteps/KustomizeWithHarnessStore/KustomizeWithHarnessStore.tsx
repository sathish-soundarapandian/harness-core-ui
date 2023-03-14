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
import { Form } from 'formik'
import * as Yup from 'yup'
import { defaultTo, get, isBoolean, isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper } from 'services/cd-ng'
import { FormMultiTypeCheckboxField } from '@common/components'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import MultiConfigSelectField from '@pipeline/components/ConfigFilesSelection/ConfigFilesWizard/ConfigFilesSteps/MultiConfigSelectField/MultiConfigSelectField'
import { FILE_TYPE_VALUES } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import { FileUsage } from '@filestore/interfaces/FileStore'
import {
  getSkipResourceVersioningBasedOnDeclarativeRollback,
  ManifestIdentifierValidation,
  ManifestStoreMap
} from '../../Manifesthelper'
import type {
  KustomizeWithHarnessStoreManifestLastStepPrevStepData,
  KustomizeWithHarnessStorePropTypeDataType,
  ManifestTypes
} from '../../ManifestInterface'
import { removeEmptyFieldsFromStringArray } from '../ManifestUtils'
import css from '../CommonManifestDetails/CommonManifestDetails.module.scss'

interface KustomizeWithHarnessStorePropType {
  stepName: string
  allowableTypes: AllowedTypes
  initialValues: ManifestConfig
  selectedManifest: ManifestTypes | null
  handleSubmit: (data: ManifestConfigWrapper) => void
  manifestIdsList: Array<string>
  expressions: Array<string>
  isReadonly?: boolean
  editManifestModePrevStepData?: KustomizeWithHarnessStoreManifestLastStepPrevStepData
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
  isReadonly,
  editManifestModePrevStepData
}: StepProps<ConnectorConfigDTO> & KustomizeWithHarnessStorePropType): React.ReactElement {
  const { getString } = useStrings()

  const modifiedPrevStepData = defaultTo(prevStepData, editManifestModePrevStepData)

  const getInitialValues = (): KustomizeWithHarnessStorePropTypeDataType => {
    const specValues = get(initialValues, 'spec.store.spec', null)
    const patchesPaths = get(initialValues, 'spec.patchesPaths')
    const overlayConfiguration = get(initialValues, 'spec.overlayConfiguration.kustomizeYamlFolderPath')
    if (specValues) {
      return {
        ...specValues,
        identifier: initialValues.identifier,
        overlayConfiguration,
        patchesPaths:
          typeof patchesPaths === 'string' ? patchesPaths : removeEmptyFieldsFromStringArray(patchesPaths, true),
        pluginPath: get(initialValues, 'spec.pluginPath'),
        skipResourceVersioning: get(initialValues, 'spec.skipResourceVersioning'),
        enableDeclarativeRollback: get(initialValues, 'spec.enableDeclarativeRollback')
      }
    }
    return {
      identifier: '',
      files: [''],
      skipResourceVersioning: false,
      enableDeclarativeRollback: false
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
            overlayConfiguration: !isEmpty(formData.overlayConfiguration)
              ? {
                  kustomizeYamlFolderPath: formData.overlayConfiguration
                }
              : undefined,
            patchesPaths:
              typeof formData.patchesPaths === 'string'
                ? formData.patchesPaths
                : removeEmptyFieldsFromStringArray(formData.patchesPaths),
            pluginPath: formData?.pluginPath,
            skipResourceVersioning: getSkipResourceVersioningBasedOnDeclarativeRollback(
              formData?.skipResourceVersioning,
              formData?.enableDeclarativeRollback
            ),
            enableDeclarativeRollback: formData?.enableDeclarativeRollback
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
          ...ManifestIdentifierValidation(
            getString,
            manifestIdsList,
            initialValues?.identifier,
            getString('pipeline.uniqueName')
          ),
          files: Yup.lazy((value): Yup.Schema<unknown> => {
            if (getMultiTypeFromValue(value as string[]) === MultiTypeInputType.FIXED) {
              return Yup.array().of(Yup.string().required(getString('pipeline.manifestType.pathRequired')))
            }
            return Yup.string().required(getString('pipeline.manifestType.pathRequired'))
          })
        })}
        onSubmit={formData => {
          submitFormData({
            ...modifiedPrevStepData,
            ...formData
          } as unknown as KustomizeWithHarnessStorePropTypeDataType)
        }}
      >
        {formik => {
          const isSkipVersioningDisabled =
            isBoolean(formik?.values?.enableDeclarativeRollback) && !!formik?.values?.enableDeclarativeRollback

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
                  <div className={cx(css.halfWidth, css.addmarginBottom)}>
                    <MultiConfigSelectField
                      name="files"
                      allowableTypes={allowableTypes}
                      fileType={FILE_TYPE_VALUES.FILE_STORE}
                      formik={formik}
                      expressions={expressions}
                      values={formik.values.files}
                      fileUsage={FileUsage.MANIFEST_FILE}
                      multiTypeFieldSelectorProps={{
                        disableTypeSelection: false,
                        label: <Text>{getString('pipeline.manifestType.kustomizeFolderPath')}</Text>
                      }}
                      restrictToSingleEntry
                    />
                  </div>
                  <div
                    className={cx(css.halfWidth, {
                      [css.runtimeInput]:
                        getMultiTypeFromValue(formik.values?.overlayConfiguration as string) ===
                        MultiTypeInputType.RUNTIME
                    })}
                  >
                    <FormInput.MultiTextInput
                      name="overlayConfiguration"
                      multiTextInputProps={{ expressions, allowableTypes }}
                      label={getString('pipeline.manifestType.kustomizeYamlFolderPath')}
                      placeholder={getString('pipeline.manifestType.kustomizeFolderPathPlaceholder')}
                    />
                    {getMultiTypeFromValue(get(formik, 'values.overlayConfiguration')) ===
                      MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center', marginBottom: 4 }}
                        value={get(formik, 'values.overlayConfiguration', '')}
                        type="String"
                        variableName="overlayConfiguration"
                        showRequiredField={false}
                        showDefaultField={false}
                        onChange={
                          /* istanbul ignore next */ value => formik.setFieldValue('overlayConfiguration', value)
                        }
                        isReadonly={isReadonly}
                      />
                    )}
                  </div>
                  <div className={css.halfWidth}>
                    <MultiConfigSelectField
                      name="patchesPaths"
                      allowableTypes={allowableTypes}
                      fileType={FILE_TYPE_VALUES.FILE_STORE}
                      formik={formik}
                      expressions={expressions}
                      values={formik.values.files}
                      fileUsage={FileUsage.MANIFEST_FILE}
                      multiTypeFieldSelectorProps={{
                        disableTypeSelection: false,
                        label: <Text>{getString('pipeline.manifestTypeLabels.KustomizePatches')}</Text>
                      }}
                      allowSinglePathDeletion
                    />
                  </div>
                  <div
                    className={cx(css.halfWidth, {
                      [css.runtimeInput]:
                        getMultiTypeFromValue(formik.values?.pluginPath) === MultiTypeInputType.RUNTIME
                    })}
                  >
                    <FormInput.MultiTextInput
                      label={getString('pluginPath')}
                      placeholder={getString('pipeline.manifestType.kustomizePluginPathPlaceholder')}
                      name="pluginPath"
                      isOptional={true}
                      multiTextInputProps={{ expressions, allowableTypes }}
                    />
                    {getMultiTypeFromValue(formik.values?.pluginPath) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center', marginBottom: 4 }}
                        value={formik.values?.pluginPath as string}
                        type="String"
                        variableName="pluginPath"
                        showRequiredField={false}
                        showDefaultField={false}
                        onChange={value => formik.setFieldValue('pluginPath', value)}
                        isReadonly={isReadonly}
                      />
                    )}
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
                        <Layout.Vertical width={'50%'} margin={{ bottom: 'huge' }}>
                          <Layout.Horizontal
                            flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
                            margin={{ bottom: 'small' }}
                          >
                            <FormMultiTypeCheckboxField
                              name="enableDeclarativeRollback"
                              label={getString('pipeline.manifestType.enableDeclarativeRollback')}
                              multiTypeTextbox={{ expressions, allowableTypes }}
                              className={css.checkbox}
                            />
                            {getMultiTypeFromValue(formik.values?.enableDeclarativeRollback) ===
                              MultiTypeInputType.RUNTIME && (
                              <ConfigureOptions
                                value={get(formik, 'values.enableDeclarativeRollback', '') as string}
                                type="String"
                                variableName="enableDeclarativeRollback"
                                showRequiredField={false}
                                showDefaultField={false}
                                onChange={value => formik.setFieldValue('enableDeclarativeRollback', value)}
                                style={{ alignSelf: 'center', marginTop: 11 }}
                                className={css.addmarginTop}
                                isReadonly={isReadonly}
                              />
                            )}
                          </Layout.Horizontal>
                          <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                            <FormMultiTypeCheckboxField
                              key={isSkipVersioningDisabled.toString()}
                              name="skipResourceVersioning"
                              label={getString('skipResourceVersion')}
                              multiTypeTextbox={{ expressions, allowableTypes, disabled: isSkipVersioningDisabled }}
                              className={css.checkbox}
                              disabled={isSkipVersioningDisabled}
                            />
                            {getMultiTypeFromValue(get(formik, 'values.skipResourceVersioning')) ===
                              MultiTypeInputType.RUNTIME && (
                              <ConfigureOptions
                                value={get(formik, 'values.skipResourceVersioning', '') as string}
                                type="String"
                                variableName="skipResourceVersioning"
                                showRequiredField={false}
                                showDefaultField={false}
                                onChange={value => formik.setFieldValue('skipResourceVersioning', value)}
                                style={{ alignSelf: 'center', marginTop: 11 }}
                                className={css.addmarginTop}
                                isReadonly={isReadonly}
                              />
                            )}
                          </Layout.Horizontal>
                        </Layout.Vertical>
                      }
                    />
                  </Accordion>
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

export default KustomizeWithHarnessStore
