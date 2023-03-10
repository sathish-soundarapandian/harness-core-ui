/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useRef, useState } from 'react'
import { debounce, isEqual, set, get, isString, omit, mapValues } from 'lodash-es'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudioInternal'
import { ArtifactToConnectorMap } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { ArtifactSourceConfigFormWithRef } from '@cd/components/TemplateStudio/ArtifactSourceTemplateCanvas/ArtifactSourceConfigForm/ArtifactSourceConfigForm'
import { sanitize } from '@common/utils/JSONUtils'
import type {
  ArtifactSourceConfigDetails,
  ArtifactSourceConfigFormData
} from '@cd/components/TemplateStudio/ArtifactSourceTemplateCanvas/types'
import { getConnectorIdValue } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

const usePrevious = (value: any) => {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

export const getConnectorValue = (connectorId: any, formikValues: any) => {
  return connectorId && isString(connectorId)
    ? connectorId
    : getConnectorIdValue({ connectorId: formikValues.connectorId })
}
function getProcessedTemplate(formikValues: ArtifactSourceConfigFormData) {
  const { artifactType, connectorId } = formikValues || {}
  const isConnectorRefApplicable = Boolean(ArtifactToConnectorMap[artifactType])
  const ret = {
    type: artifactType,
    spec: {
      ...omit(get(formikValues, 'artifactConfig.spec', {}), 'connectorRef'),
      ...(isConnectorRefApplicable
        ? {
            connectorRef: getConnectorValue(connectorId, formikValues)
          }
        : {})
    }
  }
  console.log('ret', ret)
  return ret
}

function ArtifactSourceTemplateCanvas(_props: unknown, formikRef: TemplateFormRef<unknown>) {
  const {
    state: { template },
    updateTemplate
  } = React.useContext(TemplateContext)
  const currentConnectorRef = template?.spec?.spec?.connectorRef
  console.log('debouncedCalled', currentConnectorRef)
  const previousConnectorRef = usePrevious(currentConnectorRef) ?? currentConnectorRef
  // React.useEffect(() => {
  //   if (previousConnectorRef !== currentConnectorRef) {
  //     const ctt = get(template.spec, 'spec')
  //     const connectorVal = get(ctt, 'connectorRef')
  //     const rtt = mapValues(ctt, () => RUNTIME_INPUT_VALUE)
  //     set(rtt, 'connectorRef', connectorVal)
  //     set(template, 'spec.spec', rtt)
  //     //formikRef.current
  //     updateTemplate(template)

  //     console.log('debouncedCalled2', formikRef, ctt, rtt, connectorVal)
  //   }
  // }, [currentConnectorRef, previousConnectorRef])
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
    // console.log('debouncedCalled', currentConnectorRef)
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
