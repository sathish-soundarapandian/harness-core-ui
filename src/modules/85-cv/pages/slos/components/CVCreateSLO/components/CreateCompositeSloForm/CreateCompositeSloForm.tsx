import React, { useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Page, Button, ButtonVariation } from '@harness/uicore'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { CVStepper } from '@cv/components/CVStepper/CVStepper'
import { SloPeriodLength } from '../CreateSLOForm/components/SLOTargetAndBudgetPolicy/SLOTargetAndBudgetPolicy'
import { isFormDataValid, handleStepChange } from './CreateCompositeSloForm.utils'
import SLOName from '../CreateSLOForm/components/SLOName/SLOName'
import { AddSLOs } from './components/AddSlos/AddSLOs'
import {
  CreateCompositeSLOSteps,
  CompositeSLOFormInterface,
  CreateCompositeSloFormInterface
} from './CreateCompositeSloForm.types'
import { CreatePreview } from './components/CreatePreview/CreatePreview'
import css from './CreateCompositeSloForm.module.scss'

export const CreateCompositeSloForm = ({
  loading,
  error,
  retryOnError,
  handleRedirect,
  runValidationOnMount
}: CreateCompositeSloFormInterface) => {
  const { identifier } = useParams<ProjectPathProps & { identifier: string }>()
  const { getString } = useStrings()
  const formikProps = useFormikContext<CompositeSLOFormInterface>()
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
          runValidationOnMount={runValidationOnMount}
          onChange={(stepId, skipValidation) =>
            handleStepChange(stepId, formikProps, setSelectedStepId, skipValidation)
          }
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
