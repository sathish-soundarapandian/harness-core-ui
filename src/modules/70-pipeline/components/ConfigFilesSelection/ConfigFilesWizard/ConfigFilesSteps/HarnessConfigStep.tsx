/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Button, ButtonVariation, Text, Container, Formik, Layout, StepProps, FormInput } from '@harness/uicore'
import { Form } from 'formik'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import type { ConfigFileWrapper, StoreConfigWrapper } from 'services/cd-ng'
import { StringUtils } from '@common/exports'
import { useStrings } from 'framework/strings'
import { FileUsage } from '@filestore/interfaces/FileStore'
import { FILE_TYPE_VALUES, prepareConfigFilesValue } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import { MultiConfigSelectField } from './MultiConfigSelectField/MultiConfigSelectField'

import type { ConfigFileHarnessDataType } from '../../ConfigFilesInterface'
import css from './ConfigFilesType.module.scss'

interface ConfigFilesPropType {
  stepName: string
  handleSubmit: any
  expressions: string[]
  isEditMode: boolean
  listOfConfigFiles: any[]
  configFileIndex?: number
}
export function HarnessConfigStep({
  stepName = 'step name',
  prevStepData,
  previousStep,
  handleSubmit,
  expressions,
  isEditMode,
  listOfConfigFiles,
  configFileIndex
}: StepProps<any> & ConfigFilesPropType): React.ReactElement {
  const { getString } = useStrings()

  const [initialValues, setInitialValues] = useState({
    identifier: '',
    files: [''],
    fileType: FILE_TYPE_VALUES.FILE_STORE,
    store: ''
  })

  React.useEffect(() => {
    if (!isEditMode) {
      setInitialValues({
        ...initialValues,

        ...prevStepData,
        secretFiles: undefined
      })
      return
    }
    setInitialValues({
      ...initialValues,
      ...prevStepData,
      files: prevStepData?.files?.length > 0 ? prevStepData.files : prevStepData.secretFiles,
      secretFiles: undefined
    })
  }, [prevStepData])

  const submitFormData = (formData: ConfigFileHarnessDataType & { store?: string }): void => {
    const { files, secretFiles } = prepareConfigFilesValue(formData)
    const configFileObj: ConfigFileWrapper = {
      configFile: {
        identifier: formData.identifier,
        spec: {
          store: {
            type: formData?.store as StoreConfigWrapper['type'],
            spec: {
              files,
              secretFiles
            }
          }
          // configOverridePath: formData.configOverridePath
        }
      }
    }
    handleSubmit(configFileObj)
  }

  const identifierValidation = Yup.lazy(value => {
    return !isEditMode
      ? Yup.mixed()
          .notOneOf(
            [...listOfConfigFiles.map(({ configFile }) => configFile.identifier)],
            getString('validation.duplicateIdError')
          )
          .required(getString('validation.identifierRequired'))
      : listOfConfigFiles.map(({ configFile }) => configFile.identifier).indexOf(value) === configFileIndex
      ? Yup.mixed().required(getString('validation.identifierRequired'))
      : Yup.mixed()
          .notOneOf(
            [...listOfConfigFiles.map(({ configFile }) => configFile.identifier)],
            getString('validation.duplicateIdError')
          )
          .required(getString('validation.identifierRequired'))
  })

  return (
    <Container className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>
      {initialValues.store && (
        <Formik
          initialValues={initialValues}
          formName="configFileDetails"
          validationSchema={Yup.object().shape({
            identifier: identifierValidation,
            files: Yup.lazy(value =>
              Array.isArray(value)
                ? Yup.array().of(Yup.string().required(getString('pipeline.configFiles.error.fileSelection')))
                : Yup.string().required()
            )
          })}
          onSubmit={formData => {
            submitFormData({
              ...prevStepData,
              ...formData
            })
          }}
          enableReinitialize={true}
        >
          {formikProps => {
            return (
              <Form className={css.configContainer}>
                <div className={css.headerContainer}>
                  <FormInput.Text
                    name="identifier"
                    label={getString('pipeline.configFiles.identifierLabel')}
                    className={css.identifierField}
                    onChange={e => {
                      const { value } = e.target as HTMLInputElement
                      if (value) {
                        formikProps.setFieldValue('identifier', StringUtils.getIdentifierFromName(value))
                      }
                    }}
                  />
                  {!isEditMode && (
                    <FormInput.RadioGroup
                      name="fileType"
                      className={css.selectFileType}
                      radioGroup={{ inline: true }}
                      disabled={isEditMode}
                      label={getString('pipeline.configFiles.selectFileType')}
                      onChange={() => {
                        formikProps.setFieldValue('files', [''])
                      }}
                      items={[
                        {
                          label: getString('resourcePage.fileStore'),
                          value: FILE_TYPE_VALUES.FILE_STORE
                        },
                        { label: getString('encrypted'), value: FILE_TYPE_VALUES.ENCRYPTED }
                      ]}
                    />
                  )}
                  <MultiConfigSelectField
                    name="files"
                    fileType={formikProps.values.fileType}
                    formik={formikProps}
                    expressions={expressions}
                    values={formikProps.values.files}
                    fileUsage={FileUsage.CONFIG}
                    multiTypeFieldSelectorProps={{
                      disableTypeSelection: false,
                      label: (
                        <Text style={{ display: 'flex', alignItems: 'center', color: 'rgb(11, 11, 13)' }}>
                          {formikProps.values.fileType === FILE_TYPE_VALUES.FILE_STORE
                            ? getString('fileFolderPathText')
                            : getString('pipeline.configFiles.encryptedFiles')}
                        </Text>
                      )
                    }}
                  />
                </div>
                <Layout.Horizontal>
                  <Button
                    text={getString('back')}
                    icon="chevron-left"
                    variation={ButtonVariation.SECONDARY}
                    onClick={() => previousStep?.({ ...prevStepData })}
                    margin={{ right: 'medium' }}
                  />
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    type="submit"
                    disabled={formikProps.values.store === null}
                    text={getString('continue')}
                    rightIcon="chevron-right"
                    margin={{ left: 'medium' }}
                  />
                </Layout.Horizontal>
              </Form>
            )
          }}
        </Formik>
      )}
    </Container>
  )
}
