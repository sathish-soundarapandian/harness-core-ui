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
// import { defaultTo, merge } from 'lodash-es'
// import set from 'lodash-es/set'
// import produce from 'immer'
import type { ConfigFileWrapper, StoreConfigWrapper } from 'services/cd-ng'
import { StringUtils } from '@common/exports'

import { useStrings } from 'framework/strings'
import { FILE_TYPE_VALUES } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import { MultiConfigSelectField } from './MultiConfigSelectField/MultiConfigSelectField'

// import { ConfigFileIconByType, ConfigFileTypeTitle } from '../../ConfigFilesHelper'
import type { ConfigFileHarnessDataType } from '../../ConfigFilesInterface'
import css from './ConfigFilesType.module.scss'

interface ConfigFilesPropType {
  //   changeConfigFileType: (selected: ConfigFileType) => void
  //   configFilesTypes: Array<ConfigFileType>
  //   selectedConfigFile: ConfigFileType | null
  //   configFileInitialValue?: any
  stepName: string
  handleSubmit: any
}

// interface ConfigFileData {
//   name: string
//   identifier: string
//   fileType: string
//   files: any[]
// }

export function HarnessConfigStep({
  //   selectedConfigFile,
  //   configFilesTypes,
  //   changeConfigFileType,
  stepName = 'step name',
  // configFileInitialValue,
  prevStepData,
  previousStep,
  //   nextStep,
  handleSubmit
}: StepProps<any> & ConfigFilesPropType): React.ReactElement {
  //   const gotoNextStep = (): void => {
  //     nextStep?.()
  //   }

  const { getString } = useStrings()

  const [initialValues, setInitialValues] = useState({
    identifier: '',
    files: [],
    fileType: FILE_TYPE_VALUES.FILE_STORE,
    store: ''
  })

  React.useEffect(() => {
    console.log('prevStepData', prevStepData)
    setInitialValues({
      ...initialValues,
      ...prevStepData,
      files: prevStepData?.files?.length > 0 ? prevStepData.files : prevStepData.secretFiles,
      secretFiles: undefined,
      fileType: prevStepData?.fileType ? prevStepData.fileType : FILE_TYPE_VALUES.FILE_STORE
    })
  }, [prevStepData])

  const submitFormData = (formData: ConfigFileHarnessDataType & { store?: string }): void => {
    const { fileType } = formData
    const configFileObj: ConfigFileWrapper = {
      configFile: {
        identifier: formData.identifier,
        spec: {
          store: {
            type: formData?.store as StoreConfigWrapper['type'],
            spec: {
              files:
                fileType === FILE_TYPE_VALUES.FILE_STORE
                  ? formData?.files?.map(({ path, scope }) => ({
                      path,
                      scope
                    }))
                  : undefined,
              secretFiles: fileType === FILE_TYPE_VALUES.ENCRYPTED ? formData?.files.map(path => path) : undefined
            }
          }
          // configOverridePath: formData.configOverridePath
        }
      }
    }
    console.log('confgiObj', configFileObj)
    handleSubmit(configFileObj)
  }

  return (
    <Container className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>
      <Formik
        initialValues={initialValues}
        formName="configFileDetails"
        validationSchema={Yup.object().shape({
          identifier: Yup.string().required(getString('pipeline.configFiles.error.identifier')),
          fileType: Yup.string().required(getString('pipeline.configFiles.error.fileType')),
          files: Yup.array()
            .of(
              Yup.object().shape({
                path: Yup.string().required(getString('pipeline.configFiles.error.file'))
              })
            )
            .required(getString('pipeline.configFiles.error.files'))
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
          console.log('formikProps', formikProps)
          return (
            <Form>
              <div className={css.headerContainer}>
                <FormInput.Text
                  name="identifier"
                  label={getString('pipeline.configFiles.identifierLabel')}
                  className={css.identifierField}
                  onChange={e => {
                    formikProps.setFieldValue('identifier', StringUtils.getIdentifierFromName(e.target.value))
                  }}
                />
                <FormInput.RadioGroup
                  name="fileType"
                  className={css.selectFileType}
                  radioGroup={{ inline: true }}
                  label={getString('pipeline.configFiles.selectFileType')}
                  onChange={() => {
                    formikProps.setFieldValue('files', [{}])
                  }}
                  items={[
                    {
                      label: getString('resourcePage.fileStore'),
                      value: FILE_TYPE_VALUES.FILE_STORE
                      //   disabled: false
                    },
                    { label: getString('encrypted'), value: FILE_TYPE_VALUES.ENCRYPTED }
                  ]}
                />
                <MultiConfigSelectField
                  name="files"
                  fileType={formikProps.values.fileType}
                  formik={formikProps}
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
                  onClick={() => previousStep?.()}
                />
                <Button
                  variation={ButtonVariation.PRIMARY}
                  type="submit"
                  // disabled={selectedConfigFile === null}
                  text={getString('continue')}
                  rightIcon="chevron-right"
                />
              </Layout.Horizontal>
            </Form>
          )
        }}
      </Formik>
    </Container>
  )
}
