/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Formik,
  FormInput,
  Layout,
  MultiTypeInputType,
  Button,
  StepProps,
  Text,
  SelectOption,
  ButtonVariation
} from '@wings-software/uicore'
import { Menu } from '@blueprintjs/core'
import { FontVariation } from '@harness/design-system'
import { Form } from 'formik'
import * as Yup from 'yup'
import { memoize } from 'lodash-es'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { RegistryHostNames } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import type { GcrSpec } from 'services/pipeline-ng'
import ArtifactImagePath from '../ArtifactImagePath/ArtifactImagePath'
import type { ImagePathProps } from '../../../ArtifactInterface'
import css from '../../ArtifactConnector.module.scss'

export const gcrUrlList: SelectOption[] = Object.values(RegistryHostNames).map(item => ({ label: item, value: item }))
export function GCRImagePath({
  handleSubmit,
  prevStepData,
  initialValues,
  previousStep
}: StepProps<ConnectorConfigDTO> & ImagePathProps<GcrSpec>): React.ReactElement {
  const { getString } = useStrings()
  const validationSchema = Yup.object().shape({
    imagePath: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.imagePath')),
    registryHostname: Yup.string().trim().required('GCR Registry URL is required')
  })

  const registryHostNameRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        onClick={handleClick}
      />
    </div>
  ))

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        formName="gcrImagePath"
        onSubmit={formData => {
          handleSubmit({
            ...formData,
            connectorRef: prevStepData?.connectorId?.value
          })
        }}
      >
        <Form>
          <div className={css.connectorForm}>
            <div className={css.imagePathContainer}>
              <FormInput.MultiTypeInput
                label={getString('connectors.GCR.registryHostname')}
                placeholder={getString('common.validation.urlIsRequired')}
                name="registryHostname"
                selectItems={gcrUrlList}
                useValue
                multiTypeInputProps={{
                  allowableTypes: [MultiTypeInputType.FIXED],
                  selectProps: {
                    allowCreatingNewItems: true,
                    addClearBtn: true,
                    items: gcrUrlList,
                    itemRenderer: registryHostNameRenderer
                  }
                }}
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
      </Formik>
    </Layout.Vertical>
  )
}
