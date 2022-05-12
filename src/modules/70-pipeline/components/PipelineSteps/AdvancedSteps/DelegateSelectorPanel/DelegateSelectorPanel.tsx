/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import type { MultiTypeInputType } from '@wings-software/uicore'
import MultiTypeDelegateSelector from '@common/components/MultiTypeDelegateSelector/MultiTypeDelegateSelector'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

export interface DelegatePanelProps {
  formikProps?: FormikProps<{
    delegateSelectors?: string[]
  }>
  isReadonly: boolean
  allowableTypes?: MultiTypeInputType[]
  inputProps?: { onTagInputChange: (tags: string[]) => void }
  name?: string
}

export default function DelegateSelectorPanel(props: DelegatePanelProps): React.ReactElement {
  const { isReadonly, allowableTypes } = props
  const { projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { expressions } = useVariablesExpression()
  return (
    <MultiTypeDelegateSelector
      name={props.name || 'delegateSelectors'}
      disabled={isReadonly}
      inputProps={{ projectIdentifier, orgIdentifier }}
      expressions={expressions}
      allowableTypes={allowableTypes}
    />
  )
}
