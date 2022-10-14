import React, { useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Page, Text, Button, ButtonVariation } from '@harness/uicore'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { CVStepper } from '@cv/components/CVStepper/CVStepper'
import { CreateCompositeSLOSteps, SLOForm } from '../../CVCreateSLO.types'
import { SloPeriodLength } from '../CreateSLOForm/components/SLOTargetAndBudgetPolicy/SLOTargetAndBudgetPolicy'
import { isFormDataValid, handleStepChange } from './CompositeSLOForm.utils'
import SLOName from '../CreateSLOForm/components/SLOName/SLOName'
import { AddSLOs } from './components/AddSLOs'
import css from './CompositeSLOForm.module.scss'

interface CompositeSLOFormInterface {
  loading: boolean
  error: any
  retryOnError: () => void
  handleRedirect: () => void
}

export const LabelAndValue = ({ label, value }: { label: string; value: string }) => {
  return (
    <Layout.Horizontal spacing="medium">
      <Text>{label}</Text>
      <Text>{value}</Text>
    </Layout.Horizontal>
  )
}

export const CreatePreview = ({ id, data }: { id: CreateCompositeSLOSteps; data: SLOForm }): JSX.Element => {
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

export const CompositeSLOForm = ({ loading, error, retryOnError, handleRedirect }: CompositeSLOFormInterface) => {
  const { identifier } = useParams<ProjectPathProps & { identifier: string }>()
  const { getString } = useStrings()
  const formikProps = useFormikContext<SLOForm>()
  const [selectedStepId, setSelectedStepId] = useState(CreateCompositeSLOSteps.Define_SLO_Identification)
  const isStepValid = useCallback(
    (stepId: string) => isFormDataValid(formikProps, stepId as CreateCompositeSLOSteps),
    [formikProps]
  )

  const { periodType, periodLengthType } = formikProps.values
  return (
    <>
      <Page.Body loading={loading} error={error} retryOnError={() => retryOnError()}>
        <CVStepper
          id="createSLOTabs"
          selectedStepId={selectedStepId}
          isStepValid={isStepValid}
          onChange={stepId => handleStepChange(stepId, formikProps, setSelectedStepId)}
          stepList={[
            {
              id: CreateCompositeSLOSteps.Define_SLO_Identification,
              title: 'Define SLO Identification',
              panel: <SLOName formikProps={formikProps} identifier={identifier} />,
              preview: (
                <CreatePreview id={CreateCompositeSLOSteps.Define_SLO_Identification} data={formikProps.values} />
              )
            },
            {
              id: CreateCompositeSLOSteps.Set_SLO_Time_Window,
              title: 'Set SLO Time Window',
              panel: <SloPeriodLength periodType={periodType} periodLengthType={periodLengthType} />
            },
            {
              id: CreateCompositeSLOSteps.Add_SLOs,
              title: 'Add SLOs',
              panel: (
                <>
                  <AddSLOs />
                </>
              )
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
      <Page.Header
        className={css.footer}
        title={
          <Layout.Horizontal spacing="medium">
            <Button text={getString('cancel')} variation={ButtonVariation.SECONDARY} onClick={() => handleRedirect()} />
            <Button
              text={getString('save')}
              variation={ButtonVariation.PRIMARY}
              onClick={() => formikProps.submitForm()}
            />
          </Layout.Horizontal>
        }
      />
    </>
  )
}
