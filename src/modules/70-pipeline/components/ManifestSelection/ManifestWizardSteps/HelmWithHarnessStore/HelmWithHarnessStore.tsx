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
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  StepProps,
  Text
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import cx from 'classnames'
import { Form } from 'formik'
import * as Yup from 'yup'
import { get } from 'lodash-es'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper } from 'services/cd-ng'
import MultiConfigSelectField from '@pipeline/components/ConfigFilesSelection/ConfigFilesWizard/ConfigFilesSteps/MultiConfigSelectField/MultiConfigSelectField'
import { FILE_TYPE_VALUES } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import { FileUsage } from '@filestore/interfaces/FileStore'
import { helmVersions, ManifestIdentifierValidation, ManifestStoreMap } from '../../Manifesthelper'
import type {
  CommandFlags,
  HelmHarnessFileStoreFormData,
  HelmVersionOptions,
  ManifestTypes
} from '../../ManifestInterface'
import HelmAdvancedStepSection from '../HelmAdvancedStepSection'
import { handleCommandFlagsSubmitData } from '../ManifestUtils'
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
}
interface HelmWithHarnessStoreDataType {
  identifier: string
  files: string[]
  valuesPaths: string[]
  skipResourceVersioning: boolean
  helmVersion: HelmVersionOptions
  commandFlags: Array<CommandFlags>
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
  manifestIdsList
}: StepProps<ConnectorConfigDTO> & HelmWithHarnessStorePropType): React.ReactElement {
  const { getString } = useStrings()
  const isActiveAdvancedStep: boolean = initialValues?.spec?.skipResourceVersioning || initialValues?.spec?.commandFlags
  const [selectedHelmVersion, setHelmVersion] = useState(initialValues?.spec?.helmVersion ?? 'V2')

  const getInitialValues = (): HelmWithHarnessStoreDataType => {
    const specValues = get(initialValues, 'spec.store.spec', null)
    const valuesPaths = get(initialValues, 'spec.valuesPaths')
    if (specValues) {
      return {
        ...specValues,
        identifier: initialValues.identifier,
        helmVersion: initialValues.spec?.helmVersion,
        valuesPaths,
        skipResourceVersioning: get(initialValues, 'spec.skipResourceVersioning'),
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
      helmVersion: 'V2',
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
            valuesPaths: formData.valuesPaths,
            helmVersion: formData?.helmVersion,
            skipResourceVersioning: formData.skipResourceVersioning
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
          } as unknown as HelmHarnessFileStoreFormData)
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
                  <div className={helmcss.halfWidth}>
                    <FormInput.Text
                      name="identifier"
                      label={getString('pipeline.manifestType.manifestIdentifier')}
                      placeholder={getString('pipeline.manifestType.manifestPlaceholder')}
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
                          helmStore={prevStepData?.store ?? ''}
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

export default HelmWithHarnessStore
