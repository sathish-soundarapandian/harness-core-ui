/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import {
  Text,
  Layout,
  Page,
  Button,
  ButtonVariation,
  Color,
  Container,
  Dialog,
  FontVariation,
  Heading
} from '@harness/uicore'
import { useFormikContext } from 'formik'
import { useModalHook } from '@harness/use-modal'
import { useStrings } from 'framework/strings'
import sloReviewChange from '@cv/assets/sloReviewChange.svg'
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

  const compositeSloPayloadRef = useRef<CompositeSLOFormInterface | null>(null)

  const [openModal, closeModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        usePortal={true}
        autoFocus={true}
        canEscapeKeyClose={true}
        canOutsideClickClose={true}
        enforceFocus={false}
        style={{
          width: 600,
          borderLeft: 0,
          paddingBottom: 0,
          paddingTop: 'large',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClose={closeModal}
      >
        <Layout.Vertical>
          <Layout.Horizontal>
            <Container width="70%" padding={{ right: 'large' }}>
              <Heading level={2} font={{ variation: FontVariation.H3 }} margin={{ bottom: 'xxlarge' }}>
                {getString('cv.slos.reviewChanges')}
              </Heading>
              <Text color={Color.GREY_600} font={{ weight: 'light' }} style={{ lineHeight: 'var(--spacing-xlarge)' }}>
                {getString('triggers.triggerCouldNotBeSavedContent')}
              </Text>
            </Container>
            <Container margin={{ top: 'small' }}>
              <img width="170" src={sloReviewChange} />
            </Container>
          </Layout.Horizontal>

          <Layout.Horizontal spacing="medium" margin={{ top: 'large', bottom: 'xlarge' }}>
            <Button text={getString('common.ok')} onClick={() => closeModal()} intent="primary" />
            <Button
              text={getString('cancel')}
              onClick={() => {
                formikProps.setValues({ ...compositeSloPayloadRef?.current } as CompositeSLOFormInterface)
                closeModal()
              }}
            />
          </Layout.Horizontal>
        </Layout.Vertical>
      </Dialog>
    ),
    []
  )

  useEffect(() => {
    if (
      Boolean(formikProps.values.periodType) &&
      Boolean(compositeSloPayloadRef?.current?.periodType) &&
      formikProps.values.periodType !== compositeSloPayloadRef?.current?.periodType
    ) {
      openModal()
    }
  }, [openModal, formikProps.values.periodType])

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
            handleStepChange(stepId, formikProps, setSelectedStepId, skipValidation, compositeSloPayloadRef)
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
