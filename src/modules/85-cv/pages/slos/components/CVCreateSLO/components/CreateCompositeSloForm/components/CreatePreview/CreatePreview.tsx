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
      break
    default:
      break
  }
  return <></>
}
