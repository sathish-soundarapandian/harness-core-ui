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
  Formik,
  Text,
  StepProps,
  ButtonVariation,
  AllowedTypes,
  FormikForm,
  FormInput
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'

import * as Yup from 'yup'

import { get } from 'lodash-es'
import { isValueFixed } from '@common/utils/utils'
import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper } from 'services/cd-ng'
import type { ModalViewFor } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { shouldHideHeaderAndNavBtns } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import type { HelmRepoOverrideManifestDataType, ManifestTypes } from '../../ManifestInterface'
import { ManifestIdentifierValidation } from '../../Manifesthelper'

import css from '../CommonManifestDetails/CommonManifestDetails.module.scss'

interface HelmRepoOverrideManifestPropType {
  stepName: string
  expressions: string[]
  allowableTypes: AllowedTypes
  initialValues: ManifestConfig
  selectedManifest: ManifestTypes | null
  handleSubmit: (data: ManifestConfigWrapper) => void
  manifestIdsList: Array<string>
  isReadonly?: boolean
  context?: ModalViewFor
}

function HelmRepoOverrideManifest({
  stepName,
  selectedManifest,
  initialValues,
  handleSubmit,
  prevStepData,
  previousStep,
  manifestIdsList,
  context
}: StepProps<ConnectorConfigDTO> & HelmRepoOverrideManifestPropType): React.ReactElement {
  const { getString } = useStrings()
  const hideHeaderAndNavBtns = context ? shouldHideHeaderAndNavBtns(context) : false

  const getInitialValues = (): HelmRepoOverrideManifestDataType => {
    const specValues = get(initialValues, 'spec', null)

    if (specValues)
      return {
        ...specValues,
        identifier: initialValues.identifier
      }
    return {
      identifier: ''
    }
  }

  const submitFormData = (
    formData: HelmRepoOverrideManifestDataType & { store?: string; connectorRef?: string }
  ): void => {
    const manifestObj: ManifestConfigWrapper = {
      manifest: {
        identifier: formData.identifier,
        type: selectedManifest as ManifestTypes,
        spec: {
          type: formData?.store,
          connectorRef: formData?.connectorRef
        }
      }
    }

    handleSubmit(manifestObj)
  }
  const validationSchema = Yup.object().shape({
    ...ManifestIdentifierValidation(
      getString,
      manifestIdsList,
      initialValues?.identifier,
      getString('pipeline.uniqueName')
    )
  })
  const onSubmitFormData = (formData: HelmRepoOverrideManifestDataType): void => {
    const submitObj = {
      ...prevStepData,
      ...formData,
      connectorRef: prevStepData?.connectorRef
        ? !isValueFixed(prevStepData?.connectorRef)
          ? prevStepData?.connectorRef
          : prevStepData?.connectorRef?.value
        : prevStepData?.identifier
        ? prevStepData?.identifier
        : ''
    }
    submitFormData(submitObj)
  }
  const handleValidate = (formData: HelmRepoOverrideManifestDataType): void => {
    if (hideHeaderAndNavBtns) {
      onSubmitFormData(formData)
    }
  }
  const handleOnSubmit = (formData: HelmRepoOverrideManifestDataType): void => {
    onSubmitFormData(formData)
  }
  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      {!hideHeaderAndNavBtns && (
        <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
          {stepName}
        </Text>
      )}

      <Formik
        initialValues={getInitialValues()}
        formName="manifestDetails"
        validationSchema={validationSchema}
        validate={handleValidate}
        onSubmit={handleOnSubmit}
      >
        <FormikForm>
          <Layout.Vertical
            flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
            className={css.manifestForm}
          >
            <div className={css.manifestStepWidth}>
              <div className={css.halfWidth}>
                <FormInput.Text
                  name="identifier"
                  label={getString('pipeline.manifestType.manifestIdentifier')}
                  placeholder={getString('pipeline.manifestType.manifestPlaceholder')}
                />
              </div>
            </div>
            {!hideHeaderAndNavBtns && (
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
            )}
          </Layout.Vertical>
        </FormikForm>
      </Formik>
    </Layout.Vertical>
  )
}

export default HelmRepoOverrideManifest
