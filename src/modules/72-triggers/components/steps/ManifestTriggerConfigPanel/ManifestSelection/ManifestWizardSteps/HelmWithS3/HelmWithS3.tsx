/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Form, FormikValues } from 'formik'
import * as Yup from 'yup'
import { defaultTo, memoize } from 'lodash-es'
import {
  Text,
  Layout,
  Button,
  FormInput,
  Formik,
  StepProps,
  SelectOption,
  ButtonVariation
} from '@wings-software/uicore'
import { FontVariation } from '@harness/design-system'
import { Menu } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { ConnectorConfigDTO, useGetBucketListForS3 } from 'services/cd-ng'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import { useListAwsRegions } from 'services/portal'
import type { BuildStore, HelmManifestSpec } from 'services/pipeline-ng'
import type { AccountPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { helmVersions } from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { ManifestLastStepProps, ManifestTriggerSource } from '../../ManifestInterface'
import css from '../ManifestWizardSteps.module.scss'
import helmcss from '../HelmWithHttp/Helm.module.scss'

function HelmWithS3({
  stepName,
  prevStepData,
  expressions,
  allowableTypes,
  initialValues,
  handleSubmit,
  previousStep
}: StepProps<ConnectorConfigDTO> & ManifestLastStepProps): React.ReactElement {
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()
  const [regions, setRegions] = useState<SelectOption[]>([])

  /* Code related to region */
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps & AccountPathProps>()

  const { data: regionData } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })

  useEffect(() => {
    const regionValues = defaultTo(regionData?.resource, []).map(region => ({
      value: region.value,
      label: region.name
    }))

    setRegions(regionValues as SelectOption[])
  }, [regionData?.resource])
  /* Code related to region */

  /* Code related to bucketName */

  const fetchBucket = (regionValue: string): void => {
    refetchBuckets({
      queryParams: {
        connectorRef: prevStepData?.connectorRef?.value,
        region: regionValue,
        accountIdentifier: accountId,
        projectIdentifier,
        orgIdentifier
      }
    })
  }
  const {
    data: bucketData,
    error,
    loading,
    refetch: refetchBuckets
  } = useGetBucketListForS3({
    lazy: true,
    debounce: 300
  })

  const getSelectItems = useCallback(() => {
    return Object.keys(defaultTo(bucketData?.data, [])).map(bucket => ({
      value: bucket,
      label: bucket
    }))
  }, [bucketData?.data])

  const getBuckets = (): { label: string; value: string }[] => {
    if (loading) {
      return [{ label: 'Loading Buckets...', value: 'Loading Buckets...' }]
    }
    return getSelectItems()
  }
  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={loading}
        onClick={handleClick}
      />
    </div>
  ))

  const getInitialValues = (): HelmManifestSpec => {
    const { spec } = initialValues
    const { store } = spec ?? {}
    const { spec: storeSpec } = store ?? {}

    return {
      region: storeSpec?.region ?? '',
      bucketName: storeSpec?.bucketName ?? '',
      folderPath: storeSpec?.folderPath ?? '',
      chartName: spec.chartName ?? '',
      helmVersion: spec.helmVersion ?? 'V2'
    }
  }

  const submitFormData = (formData: HelmManifestSpec): void => {
    const { connectorRef, store } = prevStepData ?? {}
    const { region, bucketName, folderPath, chartName, helmVersion } = formData

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
              folderPath,
              region
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
    region: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.region')),
    bucketName: Yup.mixed().required(getString('pipeline.manifestType.bucketNameRequired')),
    folderPath: Yup.string().trim().required(getString('pipeline.manifestType.chartPathRequired')),
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
        formName="helmWithS3"
        validationSchema={validationSchema}
        onSubmit={submitFormData}
      >
        {(formik: FormikValues) => (
          <Form>
            <div className={helmcss.helmGitForm}>
              <Layout.Horizontal flex spacing="huge">
                <div className={helmcss.halfWidth}>
                  <FormInput.MultiTypeInput
                    name="region"
                    selectItems={regions}
                    useValue
                    placeholder={getString('pipeline.regionPlaceholder')}
                    multiTypeInputProps={{
                      expressions,
                      allowableTypes
                    }}
                    label={getString('regionLabel')}
                  />
                </div>
                <div className={helmcss.halfWidth}>
                  <FormInput.MultiTypeInput
                    selectItems={getBuckets()}
                    label={getString('pipeline.manifestType.bucketName')}
                    placeholder={getString('pipeline.manifestType.bucketPlaceHolder')}
                    name="bucketName"
                    multiTypeInputProps={{
                      expressions,
                      allowableTypes,
                      selectProps: {
                        noResults: (
                          <Text lineClamp={1}>
                            {getRBACErrorMessage(error as RBACError) || getString('pipeline.noBuckets')}
                          </Text>
                        ),
                        itemRenderer: itemRenderer,
                        items: getBuckets(),
                        allowCreatingNewItems: true
                      },
                      onFocus: () => {
                        if (!bucketData?.data && formik.values.region) {
                          fetchBucket(formik.values.region)
                        }
                      }
                    }}
                    useValue
                  />
                </div>
              </Layout.Horizontal>

              <Layout.Horizontal flex spacing="huge">
                <div className={helmcss.halfWidth}>
                  <FormInput.MultiTextInput
                    label={getString('chartPath')}
                    placeholder={getString('pipeline.manifestType.chartPathPlaceholder')}
                    name="folderPath"
                    multiTextInputProps={{ expressions, allowableTypes }}
                  />
                </div>

                <div className={helmcss.halfWidth}>
                  <FormInput.MultiTextInput
                    name="chartName"
                    multiTextInputProps={{ expressions, allowableTypes }}
                    label={getString('pipeline.manifestType.http.chartName')}
                    placeholder={getString('pipeline.manifestType.http.chartNamePlaceHolder')}
                  />
                </div>
              </Layout.Horizontal>

              <Layout.Horizontal flex spacing="huge" margin={{ bottom: 'small' }}>
                <div className={helmcss.halfWidth}>
                  <FormInput.Select name="helmVersion" label={getString('helmVersion')} items={helmVersions} />
                </div>
              </Layout.Horizontal>
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
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default HelmWithS3
