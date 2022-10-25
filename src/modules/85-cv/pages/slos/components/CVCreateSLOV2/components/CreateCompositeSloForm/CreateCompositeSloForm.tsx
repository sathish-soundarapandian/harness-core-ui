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
import { isEqual } from 'lodash-es'
import { useFormikContext } from 'formik'
import { useModalHook } from '@harness/use-modal'
import { useStrings } from 'framework/strings'
import sloReviewChange from '@cv/assets/sloReviewChange.svg'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { CVStepper } from '@cv/components/CVStepper/CVStepper'
import { SloPeriodLength } from '../../../CVCreateSLO/components/CreateSLOForm/components/SLOTargetAndBudgetPolicy/SLOTargetAndBudgetPolicy'
import { isFormDataValid } from './CreateCompositeSloForm.utils'
import { AddSLOs } from './components/AddSlos/AddSLOs'
import { CreateCompositeSLOSteps, CreateCompositeSloFormInterface } from './CreateCompositeSloForm.types'
import type { SLOV2Form } from '../../CVCreateSLOV2.types'
import { CreatePreview } from './components/CreatePreview/CreatePreview'
import SLOName from '../../../CVCreateSLO/components/CreateSLOForm/components/SLOName/SLOName'
import SLOTargetNotificationsContainer from '../../../CVCreateSLO/components/CreateSLOForm/components/SLOTargetAndBudgetPolicy/components/SLOTargetNotificationsContainer/SLOTargetNotificationsContainer'
import SLOTarget from './components/SLOTarget/SLOTarget'
import css from './CreateCompositeSloForm.module.scss'

export const CreateCompositeSloForm = ({
  loading,
  error,
  retryOnError,
  handleRedirect,
  loadingSaveButton,
  runValidationOnMount
}: CreateCompositeSloFormInterface): JSX.Element => {
  const { identifier } = useParams<ProjectPathProps & { identifier: string }>()
  const { getString } = useStrings()
  const formikProps = useFormikContext<SLOV2Form>()
  const isStepValid = useCallback(
    (stepId: string) => isFormDataValid(formikProps, stepId as CreateCompositeSLOSteps),
    [formikProps.values]
  )

  const [validateAllSteps, setValidateAllSteps] = useState<boolean | undefined>(runValidationOnMount)
  const compositeSloPayloadRef = useRef<SLOV2Form | null>() // to be changed

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
            <Button
              text={getString('common.ok')}
              onClick={() => {
                closeModal()
              }}
              intent="primary"
            />
            <Button
              text={getString('cancel')}
              onClick={() => {
                // to be fixed
                formikProps.setValues({ ...compositeSloPayloadRef?.current } as SLOV2Form)
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
          isStepValid={isStepValid}
          runValidationOnMount={validateAllSteps}
          stepList={[
            {
              id: CreateCompositeSLOSteps.Define_SLO_Identification,
              title: 'Define SLO Identification',
              panel: <SLOName<SLOV2Form> formikProps={formikProps} identifier={identifier} isMultiSelect />,
              preview: (
                <CreatePreview id={CreateCompositeSLOSteps.Define_SLO_Identification} data={formikProps.values} />
              )
            },
            {
              id: CreateCompositeSLOSteps.Set_SLO_Time_Window,
              title: 'Set SLO Time Window',
              panel: <SloPeriodLength periodType={periodType} periodLengthType={periodLengthType} />,
              preview: <CreatePreview id={CreateCompositeSLOSteps.Set_SLO_Time_Window} data={formikProps.values} />
            },
            {
              id: CreateCompositeSLOSteps.Add_SLOs,
              title: 'Add SLOs',
              panel: <AddSLOs />,
              preview: <CreatePreview id={CreateCompositeSLOSteps.Add_SLOs} data={formikProps.values} />
            },
            {
              id: CreateCompositeSLOSteps.Set_SLO_Target,
              title: 'Set SLO Target',
              panel: <SLOTarget formikProps={formikProps} />,
              preview: <CreatePreview id={CreateCompositeSLOSteps.Set_SLO_Target} data={formikProps.values} />
            },
            {
              id: CreateCompositeSLOSteps.Error_Budget_Policy,
              title: 'Error Budget Policy (Optional)',
              panel: (
                <SLOTargetNotificationsContainer
                  identifier={identifier}
                  setFieldValue={formikProps?.setFieldValue}
                  notificationRuleRefs={formikProps.values?.notificationRuleRefs}
                />
              )
            }
          ]}
        />
        <Page.Header
          className={css.footer}
          title={
            <Layout.Horizontal spacing="medium">
              <Button
                text={getString('cancel')}
                variation={ButtonVariation.SECONDARY}
                onClick={() => {
                  if (isEqual(compositeSloPayloadRef.current, formikProps.values)) {
                    handleRedirect()
                  } else {
                    openModal()
                  }
                }}
              />
              <Button
                text={getString('save')}
                loading={loadingSaveButton}
                variation={ButtonVariation.PRIMARY}
                onClick={() => {
                  setValidateAllSteps(true)
                  formikProps.submitForm()
                }}
              />
            </Layout.Horizontal>
          }
        />
      </Page.Body>
    </>
  )
}
