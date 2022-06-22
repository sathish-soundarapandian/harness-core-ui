/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonVariation, Text, Container, Formik, Layout, StepProps } from '@harness/uicore'
import { Form } from 'formik'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { Radio, RadioGroup } from '@blueprintjs/core'
import cx from 'classnames'

import { useStrings } from 'framework/strings'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { MultiConfigSelectField } from './MultiConfigSelectField/MultiConfigSelectField'

// import { ConfigFileIconByType, ConfigFileTypeTitle } from '../../ConfigFilesHelper'
// import type { ConfigFileType } from '../../ConfigFilesInterface'
import css from './ConfigFilesType.module.scss'

interface ConfigFilesPropType {
  //   changeConfigFileType: (selected: ConfigFileType) => void
  //   configFilesTypes: Array<ConfigFileType>
  //   selectedConfigFile: ConfigFileType | null
  //   configFileInitialValue?: any
  stepName: string
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
  nextStep
}: StepProps<ConnectorConfigDTO> & ConfigFilesPropType): React.ReactElement {
  const gotoNextStep = (): void => {
    nextStep?.()
  }

  const { getString } = useStrings()

  return (
    <Container className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>
      <Formik
        initialValues={{
          name: '',
          identifier: '',
          fileType: '',
          files: []
        }}
        formName="configFileDetails"
        validationSchema={Yup.object().shape({
          name: Yup.string().required(getString('pipeline.artifactsSelection.artifactTyperequired')),
          files: Yup.array()
            .of(
              Yup.object().shape({
                value: Yup.object().required('Must have file')
              })
            )
            .required('Must have files')
        })}
        onSubmit={gotoNextStep}
        enableReinitialize={true}
      >
        {formikProps => {
          return (
            <Form>
              <div className={css.headerContainer}>
                <NameId
                  identifierProps={{
                    inputName: 'name',
                    isIdentifierEditable: true
                    //   inputGroupProps: { disabled: true }
                  }}
                />
                <RadioGroup
                  selectedValue={formikProps.values.fileType}
                  disabled={false}
                  name="fileType"
                  onChange={e => {
                    formikProps.setFieldValue('fileType', e.currentTarget.value)
                  }}
                >
                  <Radio
                    value={'plainText'}
                    // label={getString('pipeline.conditionalExecution.statusOption.success')}
                    label="Plain Text"
                    className={cx(css.blackText, {
                      [css.active]: formikProps.values.fileType === 'plaintText'
                    })}
                  />
                  <Radio
                    value={'encrypted'}
                    label={getString('encrypted')}
                    className={cx(css.blackText, {
                      [css.active]: formikProps.values.fileType === 'encrypted'
                    })}
                  />
                </RadioGroup>
                {formikProps.values.fileType === 'encrypted' && (
                  <MultiConfigSelectField
                    name="files"
                    formik={formikProps}
                    multiTypeFieldSelectorProps={{
                      disableTypeSelection: true,
                      label: (
                        <Text style={{ display: 'flex', alignItems: 'center', color: 'rgb(11, 11, 13)' }}>
                          {getString('optionalField', { name: getString('environmentVariables') })}
                        </Text>
                      )
                    }}
                  />
                )}
              </div>
              <Layout.Horizontal>
                <Button
                  text={getString('back')}
                  icon="chevron-left"
                  variation={ButtonVariation.SECONDARY}
                  //   onClick={() => previousStep?.(prevStepData)}
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
