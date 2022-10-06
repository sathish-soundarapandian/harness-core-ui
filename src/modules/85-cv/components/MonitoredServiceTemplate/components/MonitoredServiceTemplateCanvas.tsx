/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import { isEqual } from 'lodash-es'
import { ConfigurationsWithRef } from '@cv/pages/monitored-service/components/Configurations/Configurations'
import type { MonitoredServiceForm } from '@cv/pages/monitored-service/components/Configurations/components/Service/Service.types'
import type { JsonNode, NGTemplateInfoConfig } from 'services/template-ng'
import { MonitoredServiceProvider } from '@cv/pages/monitored-service/MonitoredServiceContext'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudio'
import { createdInitTemplateValue } from './MonitoredServiceTemplateCanvas.utils'

const MonitoredServiceTemplateCanvas = (_props: unknown, formikRef: TemplateFormRef<unknown>) => {
  const {
    state: { template },
    updateTemplate
  } = React.useContext(TemplateContext)

  const onUpdate = useCallback(
    (formikValue: MonitoredServiceForm) => {
      if (
        !isEqual(template.spec, {
          serviceRef: formikValue?.serviceRef,
          environmentRef: formikValue?.environmentRef
        })
      ) {
        updateTemplate({
          ...template,
          notificationRuleRefs: formikValue?.notificationRuleRefs,
          spec: {
            serviceRef: formikValue?.serviceRef,
            environmentRef: formikValue?.environmentRef,
            type: formikValue?.type,
            sources: formikValue?.sources || {},
            variables: template?.spec?.variables
          } as JsonNode
        } as NGTemplateInfoConfig)
      }
    },
    [template]
  )

  const initialTemplate = createdInitTemplateValue(template)

  return (
    <MonitoredServiceProvider isTemplate>
      <ConfigurationsWithRef templateValue={initialTemplate} ref={formikRef} updateTemplate={onUpdate} />
    </MonitoredServiceProvider>
  )
}

export const MonitoredTemplateCanvasWithRef = React.forwardRef(MonitoredServiceTemplateCanvas)
