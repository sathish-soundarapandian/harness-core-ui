/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isEqual } from 'lodash-es'
// eslint-disable-next-line
import { ConfigurationsWithRef } from '@cv/pages/monitored-service/components/Configurations/Configurations'
// eslint-disable-next-line
import type { MonitoredServiceForm } from '@cv/pages/monitored-service/components/Configurations/components/Service/Service.types'
import type { JsonNode } from 'services/template-ng'
import { TemplateContext } from '../TemplateContext/TemplateContext'
import type { TemplateFormRef } from '../TemplateStudio'

const MonitoredServiceTemplateCanvas = (_props: unknown, formikRef: TemplateFormRef) => {
  const { state, updateTemplate } = React.useContext(TemplateContext)
  const onUpdate = (formikValue: MonitoredServiceForm) => {
    if (
      !isEqual(state.template.spec, {
        serviceRef: formikValue?.serviceRef,
        environmentRef: formikValue?.environmentRef
      })
    ) {
      updateTemplate({
        ...state.template,
        spec: {
          serviceRef: formikValue?.serviceRef,
          environmentRef: formikValue?.environmentRef,
          type: 'MonitoredService',
          sources: formikValue?.sources
        } as JsonNode
      })
    }
  }

  return (
    <ConfigurationsWithRef templateValue={state.template} isTemplate={true} ref={formikRef} updateTemplate={onUpdate} />
  )
}

export const MonitoredTemplateCanvasWithRef = React.forwardRef(MonitoredServiceTemplateCanvas)
