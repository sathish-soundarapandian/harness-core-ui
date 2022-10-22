/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import {
  Formik,
  FormInput,
  Layout,
  MultiTypeInputType,
  Button,
  SelectOption,
  StepProps,
  Text,
  ButtonVariation
} from '@wings-software/uicore'
import { Form } from 'formik'
import { FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import { defaultTo } from 'lodash-es'
import { useListAwsRegions } from 'services/portal'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { EcrSpec } from 'services/pipeline-ng'
import ArtifactImagePath from '../ArtifactImagePath/ArtifactImagePath'
import type { ImagePathProps } from '../../../ArtifactInterface'
import css from '../../ArtifactConnector.module.scss'

export function ECRArtifact({
  handleSubmit,
  prevStepData,
  initialValues,
  previousStep
}: StepProps<ConnectorConfigDTO> & ImagePathProps<EcrSpec>): React.ReactElement {
  const { getString } = useStrings()
  const { accountId } = useParams<ProjectPathProps>()

  const [regions, setRegions] = React.useState<SelectOption[]>([])
  const validationSchema = Yup.object().shape({
    imagePath: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.imagePath')),
    region: Yup.mixed().required(getString('pipeline.artifactsSelection.validation.region'))
  })
  const { data } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })
  useEffect(() => {
    const regionValues = defaultTo(data?.resource, []).map(region => ({
      value: region.value,
      label: region.name
    }))
    setRegions(regionValues as SelectOption[])
  }, [data?.resource])

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        formName="ecrArtifact"
        onSubmit={formData => {
          handleSubmit({
            ...formData,
            connectorRef: prevStepData?.connectorId?.value
          })
        }}
        enableReinitialize={true}
      >
        {({ setFieldValue }) => (
          <Form>
            <div className={css.connectorForm}>
              <div className={css.imagePathContainer}>
                <FormInput.MultiTypeInput
                  name="region"
                  selectItems={regions}
                  multiTypeInputProps={{
                    allowableTypes: [MultiTypeInputType.FIXED],
                    onChange: selectedOption => {
                      setFieldValue('region', (selectedOption as SelectOption).value)
                    }
                  }}
                  useValue
                  label={getString('regionLabel')}
                  placeholder={getString('select')}
                />
              </div>
              <ArtifactImagePath />
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
