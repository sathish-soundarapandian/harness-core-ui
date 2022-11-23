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
  Container,
  Formik,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  StepProps,
  Text
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Form } from 'formik'
import * as Yup from 'yup'
import { get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper } from 'services/cd-ng'
import MultiConfigSelectField from '@pipeline/components/ConfigFilesSelection/ConfigFilesWizard/ConfigFilesSteps/MultiConfigSelectField/MultiConfigSelectField'
import { FILE_TYPE_VALUES } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import { FileUsage } from '@filestore/interfaces/FileStore'
import { cfCliVersions, ManifestIdentifierValidation, ManifestStoreMap } from '../../Manifesthelper'
import type { TASWithHarnessStorePropTypeDataType, ManifestTypes } from '../../ManifestInterface'
import css from '../CommonManifestDetails/CommonManifestDetails.module.scss'

interface TASWithHarnessStorePropType {
  stepName: string
  allowableTypes: AllowedTypes
  initialValues: ManifestConfig
  selectedManifest: ManifestTypes | null
  handleSubmit: (data: ManifestConfigWrapper) => void
  manifestIdsList: Array<string>
  expressions: Array<string>
  isReadonly?: boolean
}

function TASWithHarnessStore({
  stepName,
  selectedManifest,
  allowableTypes,
  initialValues,
  handleSubmit,
  prevStepData,
  previousStep,
  manifestIdsList,
  expressions
}: StepProps<ConnectorConfigDTO> & TASWithHarnessStorePropType): React.ReactElement {
  const { getString } = useStrings()

  const getInitialValues = (): TASWithHarnessStorePropTypeDataType => {
    const specValues = get(initialValues, 'spec.store.spec', null)
    const varsPaths = get(initialValues, 'spec.varsPaths')
    const autoScalerPath = get(initialValues, 'spec.autoScalerPath')
    if (specValues) {
      return {
        ...specValues,
        identifier: initialValues.identifier,
        cfCliVersion: initialValues.spec?.cfCliVersion,
        varsPaths,
        autoScalerPath
      }
    }
    return {
      identifier: '',
      files: [''],
      varsPaths: [''],
      autoScalerPath: [''],
      cfCliVersion: 'V7'
    }
  }

  const submitFormData = (formData: TASWithHarnessStorePropTypeDataType & { store?: string }): void => {
    /* istanbul ignore else */
    if (formData) {
      const manifestObj: ManifestConfigWrapper = {
        manifest: {
          identifier: formData.identifier,
          type: selectedManifest as ManifestTypes,
          spec: {
            cfCliVersion: formData?.cfCliVersion,
            store: {
              type: ManifestStoreMap.Harness,
              spec: {
                files: formData.files
              }
            },
            varsPaths: formData.varsPaths,
            autoScalerPath: formData.autoScalerPath
          }
        }
      }
      // AUTOSCALER CHECKBOX REMAINING
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
          } as unknown as TASWithHarnessStorePropTypeDataType)
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
                  <Container className={css.halfWidth}>
                    <FormInput.Text
                      name="identifier"
                      label={getString('pipeline.manifestType.manifestIdentifier')}
                      placeholder={getString('pipeline.manifestType.manifestPlaceholder')}
                    />
                  </Container>
                  <Container className={css.halfWidth} margin={{ bottom: 'medium' }}>
                    <FormInput.Select
                      name="cfCliVersion"
                      label={getString('pipeline.manifestType.cfCliVersion')}
                      items={cfCliVersions}
                    />
                  </Container>
                  <Container className={css.halfWidth} margin={{ bottom: 'medium' }} padding={0}>
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
                        label: (
                          <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_600}>
                            {getString('fileFolderPathText')}
                          </Text>
                        )
                      }}
                      restrictToSingleEntry={true}
                    />
                  </Container>

                  <Container className={css.halfWidth}>
                    <MultiConfigSelectField
                      name="varsPaths"
                      allowableTypes={allowableTypes}
                      fileType={FILE_TYPE_VALUES.FILE_STORE}
                      formik={formik}
                      expressions={expressions}
                      values={formik.values.varsPaths as string[]}
                      fileUsage={FileUsage.MANIFEST_FILE}
                      multiTypeFieldSelectorProps={{
                        disableTypeSelection: false,
                        label: <Text>{getString('pipeline.manifestType.varsYAMLPath')}</Text>
                      }}
                    />
                  </Container>

                  <Container className={css.halfWidth}>
                    <MultiConfigSelectField
                      name="autoScalerPath"
                      allowableTypes={allowableTypes}
                      fileType={FILE_TYPE_VALUES.FILE_STORE}
                      formik={formik}
                      expressions={expressions}
                      values={formik.values.autoScalerPath as string[]}
                      fileUsage={FileUsage.MANIFEST_FILE}
                      multiTypeFieldSelectorProps={{
                        disableTypeSelection: false,
                        label: <Text>{getString('pipeline.manifestType.autoScalerYAMLPath')}</Text>
                      }}
                      restrictToSingleEntry={true}
                    />
                  </Container>
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

export default TASWithHarnessStore
