/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo } from 'react'
import { Form, FormikValues } from 'formik'
import { useParams } from 'react-router-dom'
import { defaultTo, memoize } from 'lodash-es'
import * as Yup from 'yup'
import { Menu } from '@blueprintjs/core'

import {
  Button,
  ButtonVariation,
  FontVariation,
  Formik,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  SelectOption,
  StepProps,
  Text
} from '@harness/uicore'
import type { AmazonS3RegistrySpec } from 'services/pipeline-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { ArtifactConfig, BucketResponse, ConnectorConfigDTO, useGetV2BucketListForS3 } from 'services/cd-ng'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import { ArtifactIdentifierValidation } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { useListAwsRegions } from 'services/portal'
import type { ImagePathProps } from '../../../ArtifactInterface'
import css from '../../ArtifactConnector.module.scss'

export interface AmazonS3ArtifactProps {
  key: string
  name: string
  initialValues: AmazonS3RegistrySpec
  handleSubmit: (data: ArtifactConfig) => void
}

export function AmazonS3(
  props: StepProps<ConnectorConfigDTO> & ImagePathProps<AmazonS3RegistrySpec>
): React.ReactElement {
  const { handleSubmit, prevStepData, initialValues, previousStep } = props

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()

  const [regions, setRegions] = React.useState<SelectOption[]>([])

  const {
    data: regionData,
    loading: loadingRegions,
    error: errorRegions
  } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })

  const {
    data: bucketData,
    error,
    loading,
    refetch: refetchBuckets
  } = useGetV2BucketListForS3({
    lazy: true,
    debounce: 300
  })

  const fetchBuckets = (region: string): void => {
    refetchBuckets({
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        connectorRef: prevStepData?.connectorId?.value ?? prevStepData?.connectorId,
        region: region
      }
    })
  }

  const selectItems = useMemo(() => {
    return bucketData?.data?.map((bucket: BucketResponse) => ({
      value: defaultTo(bucket.bucketName, ''),
      label: defaultTo(bucket.bucketName, '')
    }))
  }, [bucketData?.data])

  React.useEffect(() => {
    const regionValues = (regionData?.resource || []).map(region => ({
      value: region.value,
      label: region.name
    }))

    setRegions(regionValues as SelectOption[])
  }, [regionData?.resource])

  const getBuckets = (): { label: string; value: string }[] => {
    if (loading) {
      return [{ label: 'Loading Buckets...', value: 'Loading Buckets...' }]
    }
    return defaultTo(selectItems, [])
  }

  const schemaObject = {
    region: Yup.string(),
    bucketName: Yup.mixed().required(getString('pipeline.manifestType.bucketNameRequired')),
    filePathRegex: Yup.string().required(getString('pipeline.artifactsSelection.validation.filePathRegex'))
  }
  const sidecarSchema = Yup.object().shape({
    ...schemaObject,
    ...ArtifactIdentifierValidation([], initialValues?.identifier, getString('pipeline.uniqueIdentifier'))
  })

  const primarySchema = Yup.object().shape(schemaObject)

  const getValidationSchema = useCallback(() => {
    return primarySchema
  }, [primarySchema, sidecarSchema])

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

  const renderS3BucketField = (formik: FormikValues): JSX.Element => {
    return (
      <div className={css.imagePathContainer}>
        <FormInput.MultiTypeInput
          selectItems={getBuckets()}
          label={getString('pipeline.manifestType.bucketName')}
          placeholder={getString('pipeline.manifestType.bucketPlaceHolder')}
          name="bucketName"
          useValue
          multiTypeInputProps={{
            allowableTypes: [MultiTypeInputType.FIXED],
            selectProps: {
              noResults: (
                <Text lineClamp={1} width={500} height={100}>
                  {getRBACErrorMessage(error as RBACError) || getString('pipeline.noBuckets')}
                </Text>
              ),
              itemRenderer: itemRenderer,
              items: getBuckets(),
              allowCreatingNewItems: true
            },
            onFocus: () => {
              fetchBuckets(formik?.values?.region)
            }
          }}
        />
      </div>
    )
  }

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>
      <Formik
        initialValues={initialValues}
        formName="artifactoryArtifact"
        validationSchema={getValidationSchema()}
        onSubmit={formData => {
          handleSubmit({
            ...formData,
            connectorRef: prevStepData?.connectorId?.value
          })
        }}
      >
        {formik => (
          <Form>
            <div className={css.connectorForm}>
              <div className={css.imagePathContainer}>
                <FormInput.MultiTypeInput
                  name="region"
                  selectItems={regions}
                  useValue
                  multiTypeInputProps={{
                    onChange: () => {
                      formik.values?.bucketName &&
                        getMultiTypeFromValue(formik.values?.bucketName) === MultiTypeInputType.FIXED &&
                        formik.setFieldValue('bucketName', '')
                    },
                    selectProps: {
                      items: regions,
                      noResults: (
                        <Text lineClamp={1} width={500} height={100}>
                          {getRBACErrorMessage(errorRegions as RBACError) || getString('pipeline.noRegions')}
                        </Text>
                      )
                    },
                    allowableTypes: [MultiTypeInputType.FIXED]
                  }}
                  label={getString('regionLabel')}
                  placeholder={loadingRegions ? getString('loading') : getString('select')}
                />
              </div>

              {renderS3BucketField(formik)}

              <div className={css.imagePathContainer}>
                <FormInput.MultiTextInput
                  key={'filePathRegex'}
                  label={getString('pipeline.artifactsSelection.filePathRegexLabel')}
                  name="filePathRegex"
                  placeholder={getString('pipeline.artifactsSelection.filePathRegexPlaceholder')}
                  multiTextInputProps={{
                    allowableTypes: [MultiTypeInputType.FIXED]
                  }}
                />
              </div>
            </div>
            <Layout.Horizontal spacing="medium">
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
