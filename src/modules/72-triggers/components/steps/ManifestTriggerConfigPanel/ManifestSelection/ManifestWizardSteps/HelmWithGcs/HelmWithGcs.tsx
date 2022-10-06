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
  StepProps,
  Text,
  ButtonVariation,
  getErrorInfoFromErrorObject
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { FontVariation } from '@harness/design-system'
import { Form } from 'formik'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import { ConnectorConfigDTO, useGetGCSBucketList } from 'services/cd-ng'
import type { AccountPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useToaster } from '@common/components'
import type { BuildStore, HelmManifestSpec } from 'services/pipeline-ng'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { helmVersions } from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { ManifestLastStepProps, ManifestTriggerSource } from '../../ManifestInterface'
import css from '../ManifestWizardSteps.module.scss'
import helmcss from '../HelmWithHttp/Helm.module.scss'

function HelmWithGcs({
  stepName,
  prevStepData,
  expressions,
  allowableTypes,
  initialValues,
  handleSubmit,
  previousStep
}: StepProps<ConnectorConfigDTO> & ManifestLastStepProps): React.ReactElement {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps & AccountPathProps>()

  const {
    data: bucketData,
    error,
    loading,
    refetch: refetchBuckets
  } = useGetGCSBucketList({
    lazy: true,
    debounce: 300
  })

  const bucketOptions = Object.keys(bucketData?.data || {}).map(item => ({
    label: item,
    value: item
  }))

  const onBucketNameFocus = (): void => {
    if (!bucketData?.data) {
      refetchBuckets({
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          connectorRef: prevStepData?.connectorRef?.value
        }
      })
    }
  }

  const getInitialValues = (): HelmManifestSpec => {
    const { spec } = initialValues
    const { store } = spec ?? {}
    const { spec: storeSpec } = store ?? {}

    return {
      folderPath: storeSpec?.folderPath ?? '',
      bucketName: storeSpec?.bucketName ?? '',
      chartName: spec.chartName ?? '',
      helmVersion: spec.helmVersion ?? 'V2'
    }
  }
  const submitFormData = (formData: HelmManifestSpec): void => {
    const { connectorRef, store } = prevStepData ?? {}
    const { bucketName, folderPath, chartName, helmVersion } = formData

    const manifestTriggerSource: ManifestTriggerSource = {
      type: 'Manifest',
      spec: {
        type: 'HelmChart',
        spec: {
          store: {
            type: store as BuildStore['type'],
            spec: {
              connectorRef: (connectorRef as ConnectorSelectedValue)?.value,
              bucketName,
              folderPath
            }
          },
          chartName,
          helmVersion
        }
      }
    }

    handleSubmit(manifestTriggerSource)
  }

  const validationSchema = Yup.object().shape({
    bucketName: Yup.mixed().required(getString('pipeline.manifestType.bucketNameRequired')),
    chartName: Yup.string().trim().required(getString('pipeline.manifestType.http.chartNameRequired')),
    helmVersion: Yup.string().trim().required(getString('pipeline.manifestType.helmVersionRequired'))
  })

  return (
    <Layout.Vertical spacing="xxlarge" padding="small" className={css.manifestStore}>
      {error && showError(getErrorInfoFromErrorObject(error as any))}
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        formName="helmWithGcs"
        validationSchema={validationSchema}
        onSubmit={submitFormData}
      >
        <Form>
          <div className={helmcss.helmGitForm}>
            <Layout.Horizontal flex spacing="huge">
              <div className={helmcss.halfWidth}>
                <FormInput.MultiTypeInput
                  selectItems={bucketOptions}
                  disabled={loading}
                  useValue
                  label={getString('pipeline.manifestType.bucketName')}
                  placeholder={getString('pipeline.manifestType.bucketNamePlaceholder')}
                  name="bucketName"
                  multiTypeInputProps={{
                    selectProps: {
                      items: bucketOptions,
                      allowCreatingNewItems: true
                    },
                    expressions,
                    allowableTypes,
                    onFocus: onBucketNameFocus
                  }}
                />
              </div>
              <div className={helmcss.halfWidth}>
                <FormInput.MultiTextInput
                  label={getString('chartPath')}
                  multiTextInputProps={{ expressions, allowableTypes }}
                  placeholder={getString('pipeline.manifestType.chartPathPlaceholder')}
                  name="folderPath"
                  isOptional={true}
                />
              </div>
            </Layout.Horizontal>
            <Layout.Horizontal flex spacing="huge">
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
              variation={ButtonVariation.SECONDARY}
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
        </Form>
      </Formik>
    </Layout.Vertical>
  )
}

export default HelmWithGcs
