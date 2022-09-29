/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Button, FormInput, Formik, StepProps, Text, ButtonVariation } from '@wings-software/uicore'
import { Form } from 'formik'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { BuildStore, HelmManifestSpec } from 'services/pipeline-ng'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { helmVersions } from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { ManifestStepInitData } from '@pipeline/components/ManifestSelection/ManifestInterface'
import type { ManifestLastStepProps, ManifestTriggerSource } from '../../ManifestInterface'
import css from '../ManifestWizardSteps.module.scss'
import helmcss from './Helm.module.scss'

function HelmWithHttp({
  stepName,
  prevStepData,
  expressions,
  allowableTypes,
  initialValues,
  handleSubmit,
  previousStep
}: StepProps<ManifestStepInitData> & ManifestLastStepProps): React.ReactElement {
  const { getString } = useStrings()

  const getInitialValues = (): HelmManifestSpec => {
    const { spec } = initialValues
    return {
      helmVersion: spec.helmVersion ?? 'V2',
      chartName: spec.chartName as string
    }
  }

  const submitFormData = (formData: HelmManifestSpec): void => {
    const { connectorRef, store } = prevStepData ?? {}
    const manifestTriggerSource: ManifestTriggerSource = {
      type: 'Manifest',
      spec: {
        type: 'HelmChart',
        spec: {
          store: {
            type: store as BuildStore['type'],
            spec: {
              connectorRef: (connectorRef as ConnectorSelectedValue)?.value
            }
          },
          ...formData
        }
      }
    }

    handleSubmit(manifestTriggerSource)
  }

  const validationSchema = Yup.object().shape({
    chartName: Yup.string().trim().required(getString('pipeline.manifestType.http.chartNameRequired')),
    helmVersion: Yup.string().trim().required(getString('pipeline.manifestType.helmVersionRequired'))
  })

  return (
    <Layout.Vertical spacing="xxlarge" padding="small" className={css.manifestStore}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        formName="helmWithHttp"
        validationSchema={validationSchema}
        onSubmit={submitFormData}
      >
        {() => (
          <Form>
            <div className={helmcss.helmGitForm}>
              <Layout.Horizontal flex spacing="huge" style={{ alignItems: 'flex-start' }}>
                <div className={helmcss.halfWidth}>
                  <FormInput.MultiTextInput
                    name="chartName"
                    multiTextInputProps={{ expressions, allowableTypes }}
                    label={getString('pipeline.manifestType.http.chartName')}
                    placeholder={getString('pipeline.manifestType.http.chartNamePlaceHolder')}
                  />
                </div>
                <div className={helmcss.halfWidth}>
                  <FormInput.Select name="helmVersion" label={getString('helmVersion')} items={helmVersions} />
                </div>
              </Layout.Horizontal>
            </div>

            <Layout.Horizontal spacing="medium" className={css.saveBtn}>
              <Button
                text={getString('back')}
                icon="chevron-left"
                variation={ButtonVariation.SECONDARY}
                onClick={() => previousStep?.(prevStepData)}
              />
              <Button
                variation={ButtonVariation.PRIMARY}
                type="submit"
                text={getString('submit')}
                rightIcon="chevron-right"
              />
            </Layout.Horizontal>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default HelmWithHttp
