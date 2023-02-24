/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import {
  Formik,
  Layout,
  Button,
  StepProps,
  Text,
  ButtonVariation,
  MultiTypeInputType,
  SelectOption,
  FormInput,
  FormikForm
} from '@harness/uicore'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { defaultTo, get } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getConnectorIdValue, amiFilters, resetFieldValue } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { useListAwsRegions } from 'services/portal'
import MultiTypeTagSelector from '@common/components/MultiTypeTagSelector/MultiTypeTagSelector'
import type { AMIRegistrySpec } from 'services/pipeline-ng'
import { useListTagsForAmiArtifactMutation } from 'services/cd-ng-rq'
import type { AMITagObject, ConnectorConfigDTO } from 'services/cd-ng'
import type { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import type { ImagePathProps } from '../../../ArtifactInterface'
import css from '../../ArtifactConnector.module.scss'

function FormComponent({
  expressions,
  prevStepData,
  initialValues,
  previousStep,
  formik,
  formClassName = ''
}: any): React.ReactElement {
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()
  const [regions, setRegions] = React.useState<SelectOption[]>([])
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [tags, setTags] = useState<SelectOption[]>([])
  const connectorRefValue = getConnectorIdValue(prevStepData)

  const {
    data: regionData,
    loading: fetchingRegions,
    error: awsRegionsError
  } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })

  useEffect(() => {
    if (!fetchingRegions && regionData?.resource) {
      const regionValues = defaultTo(regionData?.resource, []).map(region => ({
        value: region.value,
        label: region.name
      }))
      setRegions(regionValues as SelectOption[])
    }
  }, [regionData?.resource, fetchingRegions])

  const {
    data: tagsData,
    isLoading: isTagsLoading,
    mutate: refetchTags,
    error: tagsError
  } = useListTagsForAmiArtifactMutation({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      region: get(formik, 'values.region'),
      connectorRef: connectorRefValue || ''
    },
    body: ''
  })

  useEffect(() => {
    if (!isTagsLoading && tagsData?.data) {
      const tagOption = get(tagsData, 'data', []).map((tag: AMITagObject) => {
        const tagName = tag?.tagName as string
        return { label: tagName, value: tagName }
      })

      setTags(tagOption)
    }
  }, [tagsData?.data, isTagsLoading])

  useEffect(() => {
    if (formik.values?.region) {
      refetchTags()
    }
  }, [formik.values?.region, refetchTags])

  return (
    <FormikForm>
      <div className={cx(css.connectorForm, formClassName)}>
        <div className={css.jenkinsFieldContainer}>
          <FormInput.MultiTypeInput
            name="region"
            selectItems={regions}
            useValue
            multiTypeInputProps={{
              allowableTypes: [MultiTypeInputType.FIXED],
              selectProps: {
                noResults: (
                  <Text lineClamp={1} margin="small" width={384}>
                    {fetchingRegions
                      ? getString('common.loadingFieldOptions', {
                          fieldName: getString('regionLabel')
                        })
                      : getRBACErrorMessage(awsRegionsError as RBACError) || getString('pipeline.noRegions')}
                  </Text>
                ),
                items: regions
              },
              onChange: selectedRegion => {
                const selectedRegionValue = (selectedRegion as unknown as any)?.value ?? selectedRegion
                if (formik.values?.region !== selectedRegionValue) {
                  setTags([])
                  resetFieldValue(formik, 'tags', {})
                }
              }
            }}
            label={getString('regionLabel')}
            placeholder={getString('common.selectName', { name: getString('regionLabel') })}
          />
        </div>
        <div className={css.jenkinsFieldContainer}>
          <MultiTypeTagSelector
            name="tags"
            expressions={expressions}
            allowableTypes={[MultiTypeInputType.FIXED]}
            tags={tags}
            label={getString('pipeline.amiTags')}
            isLoadingTags={isTagsLoading}
            initialTags={formik?.initialValues?.tags || {}}
            errorMessage={get(tagsError, 'message', getString('common.noTags'))}
          />
        </div>
        <div className={css.jenkinsFieldContainer}>
          <MultiTypeTagSelector
            name="filters"
            expressions={expressions}
            allowableTypes={[MultiTypeInputType.FIXED]}
            tags={amiFilters}
            label={getString('pipeline.amiFilters')}
            initialTags={initialValues?.filters}
            errorMessage={get(tagsError, 'data.message', '')}
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
    </FormikForm>
  )
}

export function AmazonMachineImage(
  props: StepProps<ConnectorConfigDTO> & ImagePathProps<AMIRegistrySpec>
): React.ReactElement {
  const { getString } = useStrings()
  const { handleSubmit, initialValues, prevStepData } = props

  const submitFormData = (formData: AMIRegistrySpec, connectorId?: string): void => {
    handleSubmit({
      identifier: formData.identifier,
      connectorRef: connectorId,
      region: formData.region,
      tags: formData.tags,
      filters: formData.filters
    })
  }

  const schemaObject = {
    region: Yup.string().required(getString('validation.regionRequired'))
  }

  const primarySchema = Yup.object().shape(schemaObject)

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>
      <Formik
        initialValues={initialValues}
        formName="ami"
        validationSchema={primarySchema}
        onSubmit={formData => {
          submitFormData?.(
            {
              ...formData
            },
            getConnectorIdValue(prevStepData)
          )
        }}
      >
        {formik => {
          return <FormComponent {...props} formik={formik} />
        }}
      </Formik>
    </Layout.Vertical>
  )
}
