/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'
import { FormInput, Layout, Text } from '@wings-software/uicore'
import type { ServiceNowFieldValueNG } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import css from './ServiceNowCreate.module.scss'

export interface ServiceNowTemplateFieldsRendererProps {
  templateFields?: ServiceNowFieldValueNG[]
}
interface ServiceNowTemplateFieldInterface {
  templateField: ServiceNowFieldValueNG
  index: number
}

function GetServiceNowTemplateFieldComponent({ templateField, index }: ServiceNowTemplateFieldInterface) {
  return (
    <FormInput.Text
      label={templateField.displayValue}
      name={`${templateField.displayValue}_${index}`}
      placeholder={templateField.value}
      disabled={true}
      className={css.deploymentViewMedium}
    />
  )
}

export function ServiceNowTemplateFieldsRenderer(props: ServiceNowTemplateFieldsRendererProps) {
  const { templateFields } = props
  const { getString } = useStrings()
  return templateFields && templateFields.length > 0 ? (
    <>
      {templateFields?.map((selectedField: ServiceNowFieldValueNG, index: number) => (
        <Layout.Horizontal className={css.alignCenter} key={selectedField.displayValue}>
          <GetServiceNowTemplateFieldComponent templateField={selectedField} index={index} />
        </Layout.Horizontal>
      ))}
    </>
  ) : (
    <Layout.Horizontal className={css.alignCenter}>
      <Text>{getString('pipeline.serviceNowCreateStep.noSuchTemplateFound')}</Text>
    </Layout.Horizontal>
  )
}
