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
import { FontVariation } from '@harness/design-system'
import { Form } from 'formik'
import * as Yup from 'yup'
import { get, set } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper } from 'services/cd-ng'
import MultiConfigSelectField from '@pipeline/components/ConfigFilesSelection/ConfigFilesWizard/ConfigFilesSteps/MultiConfigSelectField/MultiConfigSelectField'
import { FILE_TYPE_VALUES } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import { FormMultiTypeCheckboxField } from '@common/components'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { ManifestDataType, ManifestIdentifierValidation, ManifestStoreMap } from '../../Manifesthelper'
import type { HarnessFileStoreDataType, HarnessFileStoreFormData, ManifestTypes } from '../../ManifestInterface'
import css from '../K8sValuesManifest/ManifestDetails.module.scss'

interface HarnessFileStorePropType {
  stepName: string
  allowableTypes: AllowedTypes
  initialValues: ManifestConfig
  expressions: string[]
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
const showSkipResourceVersion = (selectedManifest: ManifestTypes): boolean => {
  return [ManifestDataType.K8sManifest, ManifestDataType.HelmChart, ManifestDataType.OpenshiftTemplate].includes(
    selectedManifest
  )
}
function HarnessFileStore({
  stepName,
  selectedManifest,
  allowableTypes,
  expressions,
  initialValues,
  handleSubmit,
  prevStepData,
  previousStep,
  manifestIdsList,
  isReadonly
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
        paramsPaths,
        skipResourceVersioning: get(initialValues, 'spec.skipResourceVersioning')
      }
    }
    return {
      identifier: '',
      files: [''],
      valuesPaths: [''],
      paramsPaths: [''],
      skipResourceVersioning: false
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
      if (showSkipResourceVersion(selectedManifest as ManifestTypes)) {
        set(manifestObj, 'manifest.spec.skipResourceVersioning', formData?.skipResourceVersioning)
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
          ...ManifestIdentifierValidation(manifestIdsList, initialValues?.identifier, getString('pipeline.uniqueName')),
          files: Yup.lazy((value): Yup.Schema<unknown> => {
            if (getMultiTypeFromValue(value as string[]) === MultiTypeInputType.FIXED) {
              return Yup.array().of(Yup.string().required(getString('pipeline.manifestType.pathRequired')))
            }
            return Yup.string().required(getString('pipeline.manifestType.pathRequired'))
          })
        })}
        onSubmit={formData => {
          submitFormData({
            ...prevStepData,
            ...formData
          } as unknown as HarnessFileStoreFormData)
        }}
      >
        {formik => {
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
                    <MultiConfigSelectField
                      name="files"
                      allowableTypes={allowableTypes}
                      fileType={FILE_TYPE_VALUES.FILE_STORE}
                      formik={formik}
                      expressions={expressions}
                      values={formik.values.files}
                      multiTypeFieldSelectorProps={{
                        disableTypeSelection: false,
                        label: <Text>{getString('fileFolderPathText')}</Text>
                      }}
                    />
                  </div>
                  {showValuesPaths(selectedManifest as ManifestTypes) && (
                    <div className={css.halfWidth}>
                      <MultiConfigSelectField
                        name="valuesPaths"
                        fileType={FILE_TYPE_VALUES.FILE_STORE}
                        formik={formik}
                        expressions={expressions}
                        allowableTypes={allowableTypes}
                        values={formik.values.valuesPaths}
                        multiTypeFieldSelectorProps={{
                          disableTypeSelection: false,
                          label: <Text>{getString('pipeline.manifestType.valuesYamlPath')}</Text>
                        }}
                      />
                    </div>
                  )}
                  {showParamsPaths(selectedManifest as ManifestTypes) && (
                    <div className={css.halfWidth}>
                      <MultiConfigSelectField
                        name="paramsPaths"
                        allowableTypes={allowableTypes}
                        fileType={FILE_TYPE_VALUES.FILE_STORE}
                        formik={formik}
                        expressions={expressions}
                        values={formik.values.paramsPaths}
                        multiTypeFieldSelectorProps={{
                          disableTypeSelection: false,
                          label: <Text>{getString('pipeline.manifestType.paramsYamlPath')}</Text>
                        }}
                      />
                    </div>
                  )}
                  {showSkipResourceVersion(selectedManifest as ManifestTypes) && (
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
