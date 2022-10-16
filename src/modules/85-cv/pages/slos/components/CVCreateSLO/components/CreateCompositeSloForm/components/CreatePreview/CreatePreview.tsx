/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text } from '@harness/uicore'
import { CompositeSLOFormInterface, CreateCompositeSLOSteps } from '../../CreateCompositeSloForm.types'

export const LabelAndValue = ({ label, value }: { label: string; value: string }) => {
  return (
    <Layout.Horizontal spacing="medium">
      <Text>{label}</Text>
      <Text>{value}</Text>
    </Layout.Horizontal>
  )
}

export const CreatePreview = ({
  id,
  data
}: {
  id: CreateCompositeSLOSteps
  data: CompositeSLOFormInterface
}): JSX.Element => {
  switch (id) {
    case CreateCompositeSLOSteps.Define_SLO_Identification:
      return (
        <>
          <LabelAndValue label={'SLO Name'} value={data.name} />
        </>
      )
    default:
      break
  }
  return <></>
}
