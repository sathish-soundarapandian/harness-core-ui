/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import {
  Layout,
  Button,
  FormInput,
  Formik,
  MultiTypeInputType,
  Text,
  StepProps,
  ButtonVariation
} from '@wings-software/uicore'
import cx from 'classnames'
import { FontVariation } from '@harness/design-system'
import { Form } from 'formik'

import { get } from 'lodash-es'

import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO } from 'services/cd-ng'

import FileStoreInput from '@filestore/components/FileStoreSelectField/FileStoreSelectField'
import css from './StartupScriptSelection.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface StartupScriptWizardStepTwoProps {
  stepName: string
  expressions: string[]
  allowableTypes: MultiTypeInputType[]
  // chage to StartupScriptConfig if it is present in services
  initialValues: any
  handleSubmit: (data: any) => void
  isReadonly?: boolean
}

enum fileTypes {
  PLainText = 'PlainText',
  Encrypted = 'Encrypted'
}

const fileTypesOptions = [
  { label: 'Plain text', value: fileTypes.PLainText },
  { label: 'Encrypted', value: fileTypes.Encrypted }
]

function StartupScriptWizardStepTwo({
  stepName,
  initialValues,
  handleSubmit,
  prevStepData,
  previousStep,
}: StepProps<ConnectorConfigDTO> & StartupScriptWizardStepTwoProps): React.ReactElement {
  const { getString } = useStrings()

  const getInitialValues = useCallback((): {
    fileType: 'Plain text' | 'Encrypted'
    filePath: string | undefined
    fileReference: any
  } => {
    const specValues = get(initialValues, 'store.spec', null)

    if (specValues) {
      return {
        ...specValues
      }
    }
    return {
      fileType: 'Plain text',
      filePath: '',
      fileReference: undefined
    }
  }, [])

  const submitFormData = (formData: {
    fileType: 'Plain text' | 'Encrypted'
    filePath: string | undefined
    fileReference: any
    store?: string
  }): void => {
    const startupScript = {
      store: {
        type: formData?.store,
        spec: {
          fileReference: formData?.fileReference,
          fileType: formData?.fileType,
          filePath: formData?.filePath
        }
      }
    }

    handleSubmit(startupScript)
  }

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>

      <Formik
        initialValues={getInitialValues()}
        formName="startupScriptDetails"
        // todo
        validationSchema={null}
        onSubmit={formData => {
          submitFormData({
            ...prevStepData,
            ...formData
          })
        }}
      >
        <Form>
          <Layout.Vertical
            flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
            className={cx(css.startupScriptForm, css.startupScriptWizard)}
          >
            <div className={css.startupScriptWizard}>
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormInput.Select
                  name="gitFetchType"
                  label={getString('pipeline.manifestType.gitFetchTypeLabel')}
                  items={fileTypesOptions}
                />
              </div>
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FileStoreInput name="filePath" label={getString('fileFolderPathText')} />
              </div>
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
      </Formik>
    </Layout.Vertical>
  )
}

export default StartupScriptWizardStepTwo
