/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import {
  Button,
  Text,
  Formik,
  IconName,
  Layout,
  StepProps,
  ThumbnailSelect,
  ButtonVariation
} from '@wings-software/uicore'
import { Form } from 'formik'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { manifestTypeIcons, manifestTypeLabels } from '../Manifesthelper'
import type { ManifestStepInitData, ManifestTypes } from '../ManifestInterface'
import css from './ManifestWizardSteps.module.scss'

interface ManifestPropType {
  changeManifestType: (selected: ManifestTypes | null) => void
  manifestTypes: Array<ManifestTypes>
  selectedManifest: ManifestTypes | null
  stepName: string
  initialValues: ManifestStepInitData
}

export function ManifestRepoTypes({
  selectedManifest,
  manifestTypes,
  changeManifestType,
  stepName,
  prevStepData,
  nextStep,
  initialValues
}: StepProps<ConnectorConfigDTO> & ManifestPropType): React.ReactElement {
  const [selectedManifestType, setselectedManifestType] = React.useState(selectedManifest)

  const handleOptionSelection = (selected: ManifestTypes): void => {
    setselectedManifestType(selected)
    changeManifestType(selected)
  }

  const { getString } = useStrings()

  const supportedManifestTypes = useMemo(
    () =>
      manifestTypes?.map(manifest => ({
        label: getString(manifestTypeLabels[manifest]),
        icon: manifestTypeIcons[manifest] as IconName,
        value: manifest
      })),
    [getString, manifestTypes]
  )

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>
      <Formik
        initialValues={{ manifestType: selectedManifestType }}
        formName="manifestType"
        validationSchema={Yup.object().shape({
          manifestType: Yup.string().required(getString('pipeline.manifestType.manifestTyperequired'))
        })}
        onSubmit={() => {
          changeManifestType(selectedManifestType)
          if (initialValues.selectedManifest !== selectedManifestType) {
            nextStep?.({ ...prevStepData, store: '' })
          } else {
            nextStep?.({ ...prevStepData })
          }
        }}
        enableReinitialize={true}
      >
        {() => (
          <Form>
            <Layout.Vertical
              flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
              className={css.manifestForm}
            >
              <Layout.Horizontal spacing="large">
                <ThumbnailSelect
                  className={css.thumbnailSelect}
                  name={'manifestType'}
                  items={supportedManifestTypes}
                  onChange={handleOptionSelection}
                />
              </Layout.Horizontal>
              <Layout.Horizontal>
                <Button
                  variation={ButtonVariation.PRIMARY}
                  type="submit"
                  disabled={selectedManifestType === null}
                  text={getString('continue')}
                  rightIcon="chevron-right"
                  className={css.saveBtn}
                />
              </Layout.Horizontal>
            </Layout.Vertical>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}
