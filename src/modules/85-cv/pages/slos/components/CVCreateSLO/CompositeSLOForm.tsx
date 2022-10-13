import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Page, Text } from '@harness/uicore'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { CVStepper } from '@cv/components/CVStepper/CVStepper'
import { CreateCompositeSLOSteps } from './CVCreateSLO.types'
import { SloPeriodLength } from './components/CreateSLOForm/components/SLOTargetAndBudgetPolicy/SLOTargetAndBudgetPolicy'
import { isFormDataValid, handleStepChange } from './CompositeSLOForm.utils'
import SLOName from './components/CreateSLOForm/components/SLOName/SLOName'

interface CompositeSLOFormInterface {
  formikProps: any
  loading: boolean
  error: any
  retryOnError: () => void
}

export const CreatePreview = ({ id, data }): JSX.Element => {
  switch (id) {
    case CreateCompositeSLOSteps.Define_SLO_Identification:
      return (
        <>
          <Text>Name : {data.name}</Text>
        </>
      )
      break
    default:
      break
  }
  return <></>
}

export const CompositeSLOForm = ({ formikProps, loading, error, retryOnError }: CompositeSLOFormInterface) => {
  const { identifier } = useParams<ProjectPathProps & { identifier: string }>()

  const [selectedStepId, setSelectedStepId] = useState(CreateCompositeSLOSteps.Define_SLO_Identification)
  const { periodType, periodLengthType } = formikProps.values
  return (
    <Page.Body loading={loading} error={error} retryOnError={() => retryOnError()}>
      <CVStepper
        id="createSLOTabs"
        selectedStepId={selectedStepId}
        isStepValid={identifier ? stepId => isFormDataValid(formikProps, stepId) : undefined}
        onChange={stepId => handleStepChange(stepId, formikProps, setSelectedStepId)}
        stepList={[
          {
            id: CreateCompositeSLOSteps.Define_SLO_Identification,
            title: 'Define SLO Identification',
            panel: <SLOName formikProps={formikProps} identifier={identifier} />,
            preview: <CreatePreview id={CreateCompositeSLOSteps.Define_SLO_Identification} data={formikProps.values} />
          },
          {
            id: CreateCompositeSLOSteps.Set_SLO_Time_Window,
            title: 'Set SLO Time Window',
            panel: <SloPeriodLength periodType={periodType} periodLengthType={periodLengthType} />
          },
          {
            id: CreateCompositeSLOSteps.Add_SLOs,
            title: 'Add SLOs',
            panel: <></>
          },
          {
            id: CreateCompositeSLOSteps.Set_SLO_Target,
            title: 'Set SLO Target',
            panel: <></>
          },
          {
            id: CreateCompositeSLOSteps.Error_Budget_Policy,
            title: 'Error Budget Policy',
            panel: <></>
          }
        ]}
      />
    </Page.Body>
  )
}
