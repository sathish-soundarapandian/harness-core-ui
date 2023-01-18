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
  getMultiTypeFromValue,
  FormInput,
  FormikForm
} from '@harness/uicore'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { defaultTo, get } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import { ConnectorConfigDTO, useTags } from 'services/cd-ng'
import { getConnectorIdValue, amiFilters } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { useListAwsRegions } from 'services/portal'
import MultiTypeTagSelector from '@common/components/MultiTypeTagSelector/MultiTypeTagSelector'
import type { AMIRegistrySpec } from 'services/pipeline-ng'
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
  const [regions, setRegions] = React.useState<SelectOption[]>([])
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [tags, setTags] = useState<SelectOption[]>([])

  const { data: regionData } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })

  const connectorRefValue = getConnectorIdValue(prevStepData)

  const {
    data: tagsData,
    loading: isTagsLoading,
    refetch: refetchTags,
    error: tagsError
  } = useTags({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      region: get(formik, 'values.region'),
      awsConnectorRef: connectorRefValue || ''
    },
    lazy: true
  })

  useEffect(() => {
    const tagOption = get(tagsData, 'data', []).map((tagItem: string) => ({
      value: tagItem,
      label: tagItem
    }))
    setTags(tagOption)
  }, [tagsData])

  useEffect(() => {
    if (
      getMultiTypeFromValue(get(formik, 'values.region')) === MultiTypeInputType.FIXED &&
      get(formik, 'values.region')
    ) {
      refetchTags()
    }
  }, [formik.values?.region])

  useEffect(() => {
    const regionValues = defaultTo(regionData?.resource, []).map(region => ({
      value: region.value,
      label: region.name
    }))
    setRegions(regionValues as SelectOption[])
  }, [regionData?.resource])

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
                items: regions
              }
            }}
            label={getString('regionLabel')}
            placeholder={getString('select')}
          />
        </div>
        <div className={css.jenkinsFieldContainer}>
          <MultiTypeTagSelector
            name="tags"
            className="tags-select"
            expressions={expressions}
            allowableTypes={[MultiTypeInputType.FIXED]}
            tags={tags}
            label={getString('pipeline.amiTags')}
            isLoadingTags={isTagsLoading}
            initialTags={initialValues?.tags}
            errorMessage={get(tagsError, 'data.message', '')}
          />
        </div>
        <div className={css.jenkinsFieldContainer}>
          <MultiTypeTagSelector
            name="filters"
            className="tags-select"
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
