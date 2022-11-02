/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Page, Button, ButtonVariation } from '@harness/uicore'
import { isEmpty, isEqual } from 'lodash-es'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { CVStepper } from '@cv/components/CVStepper/CVStepper'
import { isFormDataValid } from './CreateCompositeSloForm.utils'
import { AddSLOs } from './components/AddSlos/AddSLOs'
import { CreateCompositeSLOSteps, CreateCompositeSloFormInterface } from './CreateCompositeSloForm.types'
import type { SLOV2Form } from '../../CVCreateSLOV2.types'
import { CreatePreview } from './components/CreatePreview/CreatePreview'
import SLOName from '../../../CVCreateSLO/components/CreateSLOForm/components/SLOName/SLOName'
import SLOTargetNotificationsContainer from '../../../CVCreateSLO/components/CreateSLOForm/components/SLOTargetAndBudgetPolicy/components/SLOTargetNotificationsContainer/SLOTargetNotificationsContainer'
import SLOTarget from './components/SLOTarget/SLOTarget'
import useCreateCompositeSloWarningModal from './useCreateCompositeSloWarningModal'
import PeriodLength from './components/PeriodLength/PeriodLength'
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
    [formikProps.values, formikProps.errors]
  )

  const [validateAllSteps, setValidateAllSteps] = useState<boolean | undefined>(runValidationOnMount)
  const compositeSloPayloadRef = useRef<SLOV2Form | null>()
  const periodTypesRef = useRef<SLOV2Form['periodType']>()
  const prevStepData = useRef<SLOV2Form | null>()

  const [openSaveCancelModal, openPeriodUpdateModal] = useCreateCompositeSloWarningModal({
    handleRedirect,
    onChange: formikProps.setValues,
    prevStepData
  })

  useEffect(() => {
    compositeSloPayloadRef.current = formikProps.values
    prevStepData.current = formikProps.values
  }, [])

  useEffect(() => {
    if (
      Boolean(formikProps.values.periodType) &&
      Boolean(periodTypesRef?.current) &&
      !isEmpty(formikProps.values.serviceLevelObjectivesDetails) &&
      formikProps.values.periodType !== periodTypesRef?.current
    ) {
      openPeriodUpdateModal()
    }
  }, [openPeriodUpdateModal, formikProps.values.periodType])

  const onStepChange = (): void => {
    prevStepData.current = formikProps.values
    periodTypesRef.current = formikProps.values.periodType
  }

  const onCancel = (): void => {
    if (isEqual(compositeSloPayloadRef.current, formikProps.values)) {
      handleRedirect()
    } else {
      openSaveCancelModal()
    }
  }

  const { periodType, periodLengthType } = formikProps.values
  return (
    <>
      <Page.Body loading={loading} error={error} retryOnError={() => retryOnError()}>
        <CVStepper
          id="createSLOTabs"
          isStepValid={isStepValid}
          runValidationOnMount={validateAllSteps}
          onStepChange={onStepChange}
          stepList={[
            {
              id: CreateCompositeSLOSteps.Define_SLO_Identification,
              title: getString('cv.CompositeSLO.DefineSLO'),
              panel: <SLOName<SLOV2Form> formikProps={formikProps} identifier={identifier} isMultiSelect />,
              preview: (
                <CreatePreview id={CreateCompositeSLOSteps.Define_SLO_Identification} data={formikProps.values} />
              )
            },
            {
              id: CreateCompositeSLOSteps.Set_SLO_Time_Window,
              title: getString('cv.CompositeSLO.SetTimeWindow'),
              panel: <PeriodLength periodType={periodType} periodLengthType={periodLengthType} />,
              preview: <CreatePreview id={CreateCompositeSLOSteps.Set_SLO_Time_Window} data={formikProps.values} />
            },
            {
              id: CreateCompositeSLOSteps.Add_SLOs,
              title: getString('cv.CompositeSLO.AddSLO'),
              panel: <AddSLOs />,
              preview: <CreatePreview id={CreateCompositeSLOSteps.Add_SLOs} data={formikProps.values} />
            },
            {
              id: CreateCompositeSLOSteps.Set_SLO_Target,
              title: getString('cv.CompositeSLO.SetTarget'),
              panel: <SLOTarget formikProps={formikProps} />,
              preview: <CreatePreview id={CreateCompositeSLOSteps.Set_SLO_Target} data={formikProps.values} />
            },
            {
              id: CreateCompositeSLOSteps.Error_Budget_Policy,
              title: getString('cv.CompositeSLO.ErrorBudgetPolicy'),
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
              <Button text={getString('cancel')} variation={ButtonVariation.SECONDARY} onClick={onCancel} />
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
