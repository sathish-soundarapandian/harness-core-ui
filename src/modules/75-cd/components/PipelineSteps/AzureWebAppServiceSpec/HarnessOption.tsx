/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Layout,
  Button,
  FormInput,
  Formik,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Text,
  ButtonVariation,
  StepProps
} from '@wings-software/uicore'
import cx from 'classnames'
import { FontVariation } from '@harness/design-system'
import { Form } from 'formik'
import * as Yup from 'yup'

import { get, set } from 'lodash-es'
import type { ConnectorConfigDTO, StoreConfigWrapper } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import {
  ConnectorTypes,
  fileTypes,
  HarnessFileStore
} from './AzureWebAppStartupScriptSelection/StartupScriptInterface.types'
import MultiConfigSelectField from './AzureWebAppStartupScriptSelection/MultiConfigSelectField'
import css from './AzureWebAppStartupScriptSelection/StartupScriptSelection.module.scss'

export interface HarnessOptionPropsInterfrace {
  initialValues: StoreConfigWrapper
  handleSubmit: (data: StoreConfigWrapper) => void
  stepName: string
  formName: string
  expressions: string[]
}

export function HarnessOption({
  initialValues,
  stepName,
  handleSubmit,
  formName,
  previousStep,
  prevStepData,
  expressions
}: StepProps<ConnectorConfigDTO> & HarnessOptionPropsInterfrace): React.ReactElement {
  const { getString } = useStrings()
  const getHarnessStoreInitialValues = (): HarnessFileStore => {
    const specValues = get(initialValues, 'spec', null)
    if (specValues) {
      if (specValues.files?.length) {
        if (
          getMultiTypeFromValue(specValues.files, [MultiTypeInputType.RUNTIME, MultiTypeInputType.FIXED], true) ===
          MultiTypeInputType.RUNTIME
        ) {
          return {
            fileType: fileTypes.FILE_STORE,
            file: specValues?.files
          }
        }
        return {
          fileType: fileTypes.FILE_STORE,
          file: specValues?.files[0]
        }
      } else {
        if (
          getMultiTypeFromValue(specValues.files, [MultiTypeInputType.RUNTIME, MultiTypeInputType.FIXED], true) ===
          MultiTypeInputType.RUNTIME
        ) {
          return {
            fileType: fileTypes.ENCRYPTED,
            file: specValues?.secretFiles
          }
        }
        return {
          fileType: fileTypes.ENCRYPTED,
          file: specValues.secretFiles[0]
        }
      }
    }
    return {
      fileType: fileTypes.FILE_STORE,
      file: ''
    }
  }
  const submitHarnessFormData = (formData: HarnessFileStore & { store?: string }): void => {
    if (formData.fileType === 'fileStore') {
      const startupScript = {
        type: formData?.store as ConnectorTypes,
        spec: {
          files: [formData?.file]
        }
      }
      if (
        getMultiTypeFromValue(formData.file, [MultiTypeInputType.RUNTIME, MultiTypeInputType.FIXED], true) ===
        MultiTypeInputType.RUNTIME
      ) {
        set(startupScript, 'spec.files', formData.file)
      }
      handleSubmit(startupScript)
    } else {
      const startupScript = {
        type: formData?.store as ConnectorTypes,
        spec: {
          secretFiles: [formData?.file]
        }
      }
      if (
        getMultiTypeFromValue(formData.file, [MultiTypeInputType.RUNTIME, MultiTypeInputType.FIXED], true) ===
        MultiTypeInputType.RUNTIME
      ) {
        set(startupScript, 'spec.secretFiles', formData.file)
      }
      handleSubmit(startupScript)
    }
  }
  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>
      <Formik
        initialValues={getHarnessStoreInitialValues()}
        formName={formName}
        validationSchema={Yup.object().shape({
          file: Yup.lazy(() =>
            Yup.string().required(getString('common.validation.fieldIsRequired', { name: getString('common.file') }))
          )
        })}
        onSubmit={formData => {
          submitHarnessFormData({
            ...prevStepData,
            ...formData
          })
        }}
      >
        {formik => {
          return (
            <Form>
              <Layout.Vertical
                flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
                className={cx(css.startupScriptForm, css.startupScriptWizard)}
              >
                <div className={css.startupScriptWizard}>
                  <FormInput.RadioGroup
                    name="fileType"
                    className={css.selectFileType}
                    radioGroup={{ inline: true }}
                    label={getString('pipeline.configFiles.selectFileType')}
                    onChange={() => {
                      if (getMultiTypeFromValue(formik.values.file) === MultiTypeInputType.FIXED) {
                        formik.setFieldValue('file', '')
                      }
                    }}
                    items={[
                      {
                        label: getString('pipeline.startupScript.plainText'),
                        value: fileTypes.FILE_STORE
                      },
                      { label: getString('encrypted'), value: fileTypes.ENCRYPTED }
                    ]}
                  />
                  <MultiConfigSelectField
                    name="file"
                    fileType={formik.values.fileType as string}
                    formik={formik}
                    expressions={expressions}
                    values={formik.values.file as string}
                    multiTypeFieldSelectorProps={{
                      disableTypeSelection: false,
                      label: (
                        <Text style={{ display: 'flex', alignItems: 'center', color: 'rgb(11, 11, 13)' }}>
                          {formik.values.fileType === fileTypes.FILE_STORE
                            ? getString('fileFolderPathText')
                            : getString('encrypted')}
                        </Text>
                      )
                    }}
                  />
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
                    disabled={formik.values.file ? false : true}
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
