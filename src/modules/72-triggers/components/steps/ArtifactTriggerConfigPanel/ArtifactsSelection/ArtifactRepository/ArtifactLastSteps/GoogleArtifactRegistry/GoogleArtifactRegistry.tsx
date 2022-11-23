/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import {
  Formik,
  Layout,
  Button,
  StepProps,
  Text,
  ButtonVariation,
  SelectOption,
  FormInput,
  FormikForm,
  MultiTypeInputType
} from '@harness/uicore'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { ConnectorConfigDTO, RegionGar, useGetRegionsForGoogleArtifactRegistry } from 'services/cd-ng'
import type { GarSpec } from 'services/pipeline-ng'
import type { ImagePathProps } from '../../../ArtifactInterface'
import css from '../../ArtifactConnector.module.scss'

export const repositoryType: SelectOption[] = [
  { label: 'npm', value: 'npm' },
  { label: 'maven', value: 'maven' },
  { label: 'docker', value: 'docker' },
  { label: 'apt', value: 'apt' },
  { label: 'yum', value: 'yum' },
  { label: 'python', value: 'python' },
  { label: 'kubeflow-pipelines', value: 'kubeflow-pipelines' }
]

function FormComponent(
  props: StepProps<ConnectorConfigDTO> & ImagePathProps<GarSpec> & { formik: FormikProps<GarSpec> }
): React.ReactElement {
  const { prevStepData, previousStep } = props
  const { getString } = useStrings()
  const [regions, setRegions] = useState<SelectOption[]>([])
  const { data: regionsData } = useGetRegionsForGoogleArtifactRegistry({})

  useEffect(() => {
    if (regionsData?.data) {
      setRegions(
        regionsData?.data?.map((item: RegionGar) => {
          return { label: item.name, value: item.value } as SelectOption
        })
      )
    }
  }, [regionsData])

  return (
    <FormikForm>
      <div className={cx(css.artifactForm)}>
        <div className={css.jenkinsFieldContainer}>
          <FormInput.MultiTextInput
            name="project"
            label={getString('projectLabel')}
            placeholder={getString('pipeline.artifactsSelection.projectPlaceholder')}
            multiTextInputProps={{
              allowableTypes: [MultiTypeInputType.FIXED]
            }}
          />
        </div>
        <div className={css.jenkinsFieldContainer}>
          <FormInput.MultiTypeInput
            label={getString('regionLabel')}
            name="region"
            useValue
            placeholder={getString('pipeline.regionPlaceholder')}
            multiTypeInputProps={{
              width: 500,
              allowableTypes: [MultiTypeInputType.FIXED],
              selectProps: {
                allowCreatingNewItems: true,
                items: regions
              }
            }}
            selectItems={regions}
          />
        </div>
        <div className={css.jenkinsFieldContainer}>
          <FormInput.MultiTextInput
            name="repositoryName"
            label={getString('common.repositoryName')}
            placeholder={getString('pipeline.manifestType.repoNamePlaceholder')}
            multiTextInputProps={{
              allowableTypes: [MultiTypeInputType.FIXED]
            }}
          />
        </div>
        <div className={css.jenkinsFieldContainer}>
          <FormInput.MultiTextInput
            name="pkg"
            label={getString('pipeline.testsReports.callgraphField.package')}
            placeholder={getString('pipeline.manifestType.packagePlaceholder')}
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
    </FormikForm>
  )
}

export function GoogleArtifactRegistry(
  props: StepProps<ConnectorConfigDTO> & ImagePathProps<GarSpec>
): React.ReactElement {
  const { getString } = useStrings()
  const { handleSubmit, initialValues, prevStepData } = props

  const schemaObject = {
    project: Yup.string().required(getString('common.validation.projectIsRequired')),
    region: Yup.string().required(getString('validation.regionRequired')),
    repositoryName: Yup.string().required(getString('common.validation.repositoryName')),
    pkg: Yup.string().required(getString('common.validation.package'))
  }

  const primarySchema = Yup.object().shape(schemaObject)
  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>
      <Formik
        initialValues={initialValues}
        formName="imagePath"
        validationSchema={primarySchema}
        onSubmit={formData => {
          handleSubmit({
            ...formData,
            connectorRef: prevStepData?.connectorId?.value
          })
        }}
      >
        {formik => {
          return <FormComponent {...props} formik={formik} />
        }}
      </Formik>
    </Layout.Vertical>
  )
}
