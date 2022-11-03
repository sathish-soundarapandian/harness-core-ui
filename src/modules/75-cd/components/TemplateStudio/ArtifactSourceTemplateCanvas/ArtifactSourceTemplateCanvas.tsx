/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { debounce, isEqual, set, get, isString, omit } from 'lodash-es'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudioInternal'
import { ArtifactSourceConfigFormWithRef } from '@cd/components/TemplateStudio/ArtifactSourceTemplateCanvas/ArtifactSourceConfigForm/ArtifactSourceConfigForm'
import { sanitize } from '@common/utils/JSONUtils'
import type {
  ArtifactSourceConfigDetails,
  ArtifactSourceConfigFormData
} from '@cd/components/TemplateStudio/ArtifactSourceTemplateCanvas/types'
import { getConnectorIdValue } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'

function getProcessedTemplate(formikValues: ArtifactSourceConfigFormData) {
  const { artifactType, connectorId } = formikValues || {}
  return {
    type: artifactType,
    spec: {
      ...omit(get(formikValues, 'artifactConfig.spec', {}), 'connectorRef'),
      connectorRef:
        connectorId && isString(connectorId)
          ? connectorId
          : getConnectorIdValue({ connectorId: formikValues.connectorId })
    }
  }
}

function ArtifactSourceTemplateCanvas(_props: unknown, formikRef: TemplateFormRef<unknown>) {
  const {
    state: { template },
    updateTemplate
  } = React.useContext(TemplateContext)

  const onUpdate = async (formikValue: ArtifactSourceConfigFormData): Promise<void> => {
    const processNode = getProcessedTemplate(formikValue)
    sanitize(processNode, {
      removeEmptyArray: false,
      removeEmptyObject: false,
      removeEmptyString: false
    })
    if (!isEqual(template.spec, processNode)) {
      set(template, 'spec', processNode)
      updateTemplate(template)
    }
  }
  const debouncedUpdate = debounce((formikValue: ArtifactSourceConfigFormData): void => {
    onUpdate(formikValue)
  }, 500)

  return (
    <ArtifactSourceConfigFormWithRef
      ref={formikRef}
      artifactSourceConfigInitialValues={template.spec as ArtifactSourceConfigDetails}
      updateTemplate={debouncedUpdate}
    />
  )
}

export const ArtifactSourceTemplateCanvasWithRef = React.forwardRef(ArtifactSourceTemplateCanvas)
