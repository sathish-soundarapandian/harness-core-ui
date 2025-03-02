/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Accordion,
  AllowedTypes,
  Button,
  ButtonVariation,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  StepProps,
  Text
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import cx from 'classnames'
import * as Yup from 'yup'
import { defaultTo, get } from 'lodash-es'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper } from 'services/cd-ng'
import MultiConfigSelectField from '@pipeline/components/ConfigFilesSelection/ConfigFilesWizard/ConfigFilesSteps/MultiConfigSelectField/MultiConfigSelectField'
import { FILE_TYPE_VALUES } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import { FileUsage } from '@filestore/interfaces/FileStore'
import {
  getSkipResourceVersioningBasedOnDeclarativeRollback,
  helmVersions,
  ManifestIdentifierValidation,
  ManifestStoreMap
} from '../../Manifesthelper'
import type {
  HelmHarnessFileStoreFormData,
  HelmWithHarnessStoreDataType,
  HelmWithHarnessStoreManifestLastStepPrevStepData,
  ManifestTypes
} from '../../ManifestInterface'
import HelmAdvancedStepSection from '../HelmAdvancedStepSection'
import { handleCommandFlagsSubmitData, removeEmptyFieldsFromStringArray } from '../ManifestUtils'
import css from '../CommonManifestDetails/CommonManifestDetails.module.scss'
import helmcss from '../HelmWithGIT/HelmWithGIT.module.scss'

interface HelmWithHarnessStorePropType {
  stepName: string
  allowableTypes: AllowedTypes
  initialValues: ManifestConfig
  expressions: string[]
  selectedManifest: ManifestTypes | null
  handleSubmit: (data: ManifestConfigWrapper) => void
  manifestIdsList: Array<string>
  deploymentType?: string
  isReadonly?: boolean
  editManifestModePrevStepData?: HelmWithHarnessStoreManifestLastStepPrevStepData
}

function HelmWithHarnessStore({
  stepName,
  selectedManifest,
  deploymentType,
  allowableTypes,
  expressions,
  initialValues,
  handleSubmit,
  prevStepData,
  previousStep,
  manifestIdsList,
  editManifestModePrevStepData
}: StepProps<ConnectorConfigDTO> & HelmWithHarnessStorePropType): React.ReactElement {
  const { getString } = useStrings()
  const isActiveAdvancedStep: boolean = initialValues?.spec?.skipResourceVersioning || initialValues?.spec?.commandFlags
  const [selectedHelmVersion, setHelmVersion] = useState(initialValues?.spec?.helmVersion ?? 'V3')

  const modifiedPrevStepData = defaultTo(prevStepData, editManifestModePrevStepData)

  const getInitialValues = (): HelmWithHarnessStoreDataType => {
    const specValues = get(initialValues, 'spec.store.spec', null)
    const valuesPaths = get(initialValues, 'spec.valuesPaths')
    if (specValues) {
      return {
        ...specValues,
        identifier: initialValues.identifier,
        helmVersion: initialValues.spec?.helmVersion,
        valuesPaths:
          typeof valuesPaths === 'string' ? valuesPaths : removeEmptyFieldsFromStringArray(valuesPaths, true),
        skipResourceVersioning: get(initialValues, 'spec.skipResourceVersioning'),
        enableDeclarativeRollback: get(initialValues, 'spec.enableDeclarativeRollback'),
        commandFlags: initialValues.spec?.commandFlags?.map((commandFlag: { commandType: string; flag: string }) => ({
          commandType: commandFlag.commandType,
          flag: commandFlag.flag
        })) || [{ commandType: undefined, flag: undefined, id: uuid('', nameSpace()) }]
      }
    }
    return {
      identifier: '',
      files: [''],
      valuesPaths: [''],
      skipResourceVersioning: false,
      enableDeclarativeRollback: false,
      helmVersion: 'V3',
      commandFlags: [{ commandType: undefined, flag: undefined, id: uuid('', nameSpace()) }]
    }
  }

  const submitFormData = (formData: HelmHarnessFileStoreFormData & { store?: string }): void => {
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
            valuesPaths:
              typeof formData?.valuesPaths === 'string'
                ? formData?.valuesPaths
                : removeEmptyFieldsFromStringArray(formData.valuesPaths),
            // formData.valuesPaths,
            helmVersion: formData?.helmVersion,
            skipResourceVersioning: getSkipResourceVersioningBasedOnDeclarativeRollback(
              formData?.skipResourceVersioning,
              formData?.enableDeclarativeRollback
            ),
            enableDeclarativeRollback: formData?.enableDeclarativeRollback
          }
        }
      }
      handleCommandFlagsSubmitData(manifestObj, formData)
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
        formName="helmHarnessFileStore"
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
          } as unknown as HelmHarnessFileStoreFormData)
        }}
      >
        {formik => {
          return (
            <FormikForm>
              <Layout.Vertical
                flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
                className={css.manifestForm}
              >
                <div className={css.manifestStepWidth}>
                  <div className={helmcss.halfWidth}>
                    <FormInput.Text
                      name="identifier"
                      label={getString('pipeline.manifestType.manifestIdentifier')}
                      placeholder={getString('pipeline.manifestType.manifestPlaceholder')}
                      isIdentifier={true}
                    />
                  </div>
                  <div className={helmcss.halfWidth}>
                    <FormInput.Select
                      name="helmVersion"
                      label={getString('helmVersion')}
                      items={helmVersions}
                      onChange={value => {
                        if (value?.value !== selectedHelmVersion) {
                          formik.setFieldValue('commandFlags', [
                            { commandType: undefined, flag: undefined, id: uuid('', nameSpace()) }
                          ])
                          setHelmVersion(value)
                        }
                      }}
                    />
                  </div>
                  <div className={helmcss.halfWidth}>
                    <MultiConfigSelectField
                      name="files"
                      allowableTypes={allowableTypes}
                      fileType={FILE_TYPE_VALUES.FILE_STORE}
                      formik={formik}
                      expressions={expressions}
                      fileUsage={FileUsage.MANIFEST_FILE}
                      values={formik.values.files}
                      multiTypeFieldSelectorProps={{
                        disableTypeSelection: false,
                        label: <Text>{getString('fileFolderPathText')}</Text>
                      }}
                    />
                  </div>
                  <div className={helmcss.halfWidth}>
                    <MultiConfigSelectField
                      name="valuesPaths"
                      fileType={FILE_TYPE_VALUES.FILE_STORE}
                      formik={formik}
                      expressions={expressions}
                      allowableTypes={allowableTypes}
                      fileUsage={FileUsage.MANIFEST_FILE}
                      values={formik.values.valuesPaths}
                      multiTypeFieldSelectorProps={{
                        disableTypeSelection: false,
                        label: <Text>{getString('pipeline.manifestType.valuesYamlPath')}</Text>
                      }}
                      allowSinglePathDeletion
                    />
                  </div>
                  <Accordion
                    activeId={isActiveAdvancedStep ? getString('advancedTitle') : ''}
                    className={cx({
                      [helmcss.advancedStepOpen]: isActiveAdvancedStep
                    })}
                  >
                    <Accordion.Panel
                      id={getString('advancedTitle')}
                      addDomId={true}
                      summary={getString('advancedTitle')}
                      details={
                        <HelmAdvancedStepSection
                          formik={formik}
                          expressions={expressions}
                          allowableTypes={allowableTypes}
                          helmVersion={formik.values?.helmVersion}
                          deploymentType={deploymentType as string}
                          helmStore={modifiedPrevStepData?.store ?? ''}
                        />
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
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export default HelmWithHarnessStore
