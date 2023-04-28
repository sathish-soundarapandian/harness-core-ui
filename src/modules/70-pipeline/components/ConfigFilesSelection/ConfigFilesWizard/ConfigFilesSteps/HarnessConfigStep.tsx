/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Form } from 'formik'
import * as Yup from 'yup'
import { defaultTo } from 'lodash-es'
import { Button, ButtonVariation, Text, Container, Formik, Layout, StepProps, FormInput, Label } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'

import type { ConfigFileWrapper, ConnectorConfigDTO, StoreConfigWrapper } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { FileUsage } from '@filestore/interfaces/FileStore'
import { FILE_TYPE_VALUES, prepareConfigFilesValue } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import type { ConfigFileHarnessDataType, HarnessConfigFileLastStepPrevStepData } from '../../ConfigFilesInterface'
import { MultiConfigSelectField } from './MultiConfigSelectField/MultiConfigSelectField'
import css from './ConfigFilesType.module.scss'

interface ConfigFilesPropType {
  stepName: string
  handleSubmit: any
  expressions: string[]
  isEditMode: boolean
  listOfConfigFiles: any[]
  configFileIndex?: number
  deploymentType?: string
  handleConnectorViewChange?: (status: boolean) => void
  editConfigFilePrevStepData?: HarnessConfigFileLastStepPrevStepData
}
export function HarnessConfigStep({
  stepName = 'step name',
  prevStepData,
  previousStep,
  handleSubmit,
  expressions,
  isEditMode,
  listOfConfigFiles,
  configFileIndex,
  deploymentType,
  handleConnectorViewChange,
  editConfigFilePrevStepData
}: StepProps<ConnectorConfigDTO> & ConfigFilesPropType): React.ReactElement {
  const modifiedPrevStepData = defaultTo(prevStepData, editConfigFilePrevStepData)

  const { getString } = useStrings()
  const isEditState = defaultTo(modifiedPrevStepData?.isEditMode, isEditMode)
  const fileIndex = defaultTo(modifiedPrevStepData?.configFileIndex, configFileIndex)

  const [initialValues, setInitialValues] = useState({
    identifier: '',
    files: [''],
    fileType: FILE_TYPE_VALUES.FILE_STORE,
    store: '',
    secretFiles: undefined
  })

  React.useEffect(() => {
    if (!isEditState) {
      setInitialValues({
        ...initialValues,
        ...modifiedPrevStepData,
        secretFiles: undefined
      })
      return
    }
    setInitialValues({
      ...initialValues,
      ...modifiedPrevStepData,
      files: modifiedPrevStepData?.files?.length > 0 ? modifiedPrevStepData?.files : modifiedPrevStepData?.secretFiles,
      secretFiles: undefined
    })
  }, [modifiedPrevStepData])

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
        }
      }
    }
    handleSubmit(configFileObj)
  }

  const identifierValidation = Yup.lazy(value => {
    return !isEditState
      ? Yup.mixed()
          .notOneOf(
            [...listOfConfigFiles.map(({ configFile }) => configFile.identifier)],
            getString('pipeline.configFiles.error.duplicateIdError', { configFileIdentifier: value })
          )
          .required(getString('validation.identifierRequired'))
      : listOfConfigFiles.map(({ configFile }) => configFile.identifier).indexOf(value) === fileIndex
      ? Yup.mixed().required(getString('validation.identifierRequired'))
      : Yup.mixed()
          .notOneOf(
            [...listOfConfigFiles.map(({ configFile }) => configFile.identifier)],
            getString('pipeline.configFiles.error.duplicateIdError')
          )
          .required(getString('validation.identifierRequired'))
  })

  return (
    <Container className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'xxlarge' }}>
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
              ...modifiedPrevStepData,
              ...formData
            })
          }}
          enableReinitialize={true}
        >
          {formikProps => {
            return (
              <Form className={css.configContainer}>
                <div className={css.headerContainer}>
                  <Label htmlFor="identifier">{getString('pipeline.configFiles.identifierLabel')}</Label>
                  <FormInput.Text name="identifier" className={css.identifierField} isIdentifier={true} />
                  {!isEditState && (
                    <>
                      <Label className={css.fileTypeLabel} htmlFor="fileType">
                        {getString('pipeline.configFiles.selectFileType')}
                      </Label>
                      <FormInput.RadioGroup
                        name="fileType"
                        className={css.selectFileType}
                        radioGroup={{ inline: true }}
                        disabled={isEditState}
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
                    </>
                  )}
                  <div className={css.multiConfigFile}>
                    <MultiConfigSelectField
                      name="files"
                      fileType={formikProps.values.fileType}
                      formik={formikProps}
                      expressions={expressions}
                      values={formikProps.values.files}
                      fileUsage={FileUsage.CONFIG}
                      deploymentType={deploymentType}
                      multiTypeFieldSelectorProps={{
                        disableTypeSelection: false,
                        label: (
                          <Label htmlFor="files" className={css.filesLabel}>
                            {formikProps.values.fileType === FILE_TYPE_VALUES.FILE_STORE
                              ? getString('fileFolderPathText')
                              : getString('pipeline.configFiles.encryptedFiles')}
                          </Label>
                        )
                      }}
                    />
                  </div>
                </div>
                <Layout.Horizontal>
                  <Button
                    text={getString('back')}
                    icon="chevron-left"
                    variation={ButtonVariation.SECONDARY}
                    onClick={() => {
                      handleConnectorViewChange?.(false)
                      previousStep?.({ ...modifiedPrevStepData })
                    }}
                    margin={{ right: 'medium' }}
                  />
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    type="submit"
                    disabled={formikProps.values.store === null}
                    text={getString('submit')}
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
