/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import {
  Button,
  ButtonVariation,
  Text,
  Container,
  Formik,
  IconName,
  Layout,
  StepProps,
  ThumbnailSelect
} from '@wings-software/uicore'
import { Form } from 'formik'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'

import type { ConnectorConfigDTO } from 'services/cd-ng'
import { ConfigFileIconByType, ConfigFileTypeTitle } from '../../ConfigFilesHelper'
import type { ConfigFileType } from '../../ConfigFilesInterface'
import css from './ConfigFilesType.module.scss'

interface ConfigFilesPropType {
  changeConfigFileType: (selected: ConfigFileType) => void
  configFilesTypes: Array<ConfigFileType>
  selectedConfigFile: ConfigFileType | null
  configFileInitialValue?: any
  stepName: string
}

export function ConfigFilesType({
  selectedConfigFile,
  configFilesTypes,
  changeConfigFileType,
  stepName,
  // configFileInitialValue,
  nextStep
}: StepProps<ConnectorConfigDTO> & ConfigFilesPropType): React.ReactElement {
  const [selectedConfigFileType, setSelectedConfigFileType] = React.useState(selectedConfigFile)

  const handleOptionSelection = (selected: ConfigFileType): void => {
    setSelectedConfigFileType(selected)
    changeConfigFileType(selected)
  }

  const gotoNextStep = (): void => {
    changeConfigFileType(selectedConfigFileType as ConfigFileType)
    nextStep?.()
  }

  const { getString } = useStrings()

  const supportedConfigFilesTypes = useMemo(
    () =>
      configFilesTypes.map(configFile => ({
        label: getString(ConfigFileTypeTitle[configFile]),
        icon: ConfigFileIconByType[configFile] as IconName,
        value: configFile
      })),
    [configFilesTypes]
  )
  return (
    <Container className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>
      <Formik
        initialValues={{ configFileType: selectedConfigFileType }}
        formName="configFileType"
        validationSchema={Yup.object().shape({
          configFileType: Yup.string().required(getString('pipeline.artifactsSelection.artifactTyperequired'))
        })}
        onSubmit={gotoNextStep}
        enableReinitialize={true}
      >
        {() => (
          <Form>
            <div className={css.headerContainer}>
              <Layout.Horizontal spacing="large">
                <ThumbnailSelect
                  className={css.thumbnailSelect}
                  name={'configFileType'}
                  items={supportedConfigFilesTypes}
                  onChange={handleOptionSelection}
                />
              </Layout.Horizontal>
            </div>
            <Layout.Horizontal>
              <Button
                variation={ButtonVariation.PRIMARY}
                type="submit"
                disabled={selectedConfigFile === null}
                text={getString('continue')}
                rightIcon="chevron-right"
              />
            </Layout.Horizontal>
          </Form>
        )}
      </Formik>
    </Container>
  )
}
