/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Page, Button, ButtonVariation } from '@harness/uicore'
import { isEqual } from 'lodash-es'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import { useMutateAsGet } from '@common/hooks'
import { SLOTargetFilterDTO, useGetNotificationRuleData, useGetSLOHealthListViewV2 } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { CVStepper } from '@cv/components/CVStepper/CVStepper'
import SLOTargetNotifications from '@cv/pages/slos/components/CVCreateSLO/components/CreateSLOForm/components/SLOTargetAndBudgetPolicy/components/SLOTargetNotificationsContainer/SLOTargetNotifications'
import { isFormDataValid, shouldOpenPeriodUpdateModal } from './CreateCompositeSloForm.utils'
import { AddSLOs } from './components/AddSlos/AddSLOs'
import { CreateCompositeSLOSteps, CreateCompositeSloFormInterface } from './CreateCompositeSloForm.types'
import type { SLOV2Form } from '../../CVCreateSLOV2.types'
import { CreatePreview } from './components/CreatePreview/CreatePreview'
import SLOName from '../../../CVCreateSLO/components/CreateSLOForm/components/SLOName/SLOName'
import SLOTarget from './components/SLOTarget/SLOTarget'
import useCreateCompositeSloWarningModal from './useCreateCompositeSloWarningModal'
import PeriodLength from './components/PeriodLength/PeriodLength'
import { createSloTargetFilterDTO } from './components/AddSlos/AddSLOs.utils'
import { CompositeSLOContext } from './CompositeSLOContext'
import css from './CreateCompositeSloForm.module.scss'

export const CreateCompositeSloForm = ({
  loading,
  error,
  retryOnError,
  handleRedirect,
  loadingSaveButton,
  runValidationOnMount
}: CreateCompositeSloFormInterface): JSX.Element => {
  const { accountId, orgIdentifier, projectIdentifier, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()
  const { getString } = useStrings()
  const formikProps = useFormikContext<SLOV2Form>()
  const [notificationPage, setNotificationPage] = useState(0)
  const isStepValid = useCallback(
    (stepId: string) => isFormDataValid(formikProps, stepId as CreateCompositeSLOSteps),
    [formikProps.values, formikProps.errors]
  )

  const [validateAllSteps, setValidateAllSteps] = useState<boolean | undefined>(runValidationOnMount)
  const compositeSloPayloadRef = useRef<SLOV2Form | null>()
  const periodTypesRef = useRef<SLOTargetFilterDTO>()
  const prevStepDataRef = useRef<SLOV2Form | null>()

  const [openSaveCancelModal, openPeriodUpdateModal] = useCreateCompositeSloWarningModal({
    handleRedirect,
    onChange: formikProps.setValues,
    prevStepData: prevStepDataRef
  })

  const {
    data: dashboardWidgetsResponse,
    loading: dashboardWidgetsLoading,
    refetch: refetchDashboardWidgets,
    error: dashboardWidgetsError
  } = useMutateAsGet(useGetSLOHealthListViewV2, {
    lazy: true,
    queryParams: { accountId, orgIdentifier, projectIdentifier, pageNumber: 0, pageSize: 20 },
    body: { compositeSLOIdentifier: identifier }
  })

  useEffect(() => {
    compositeSloPayloadRef.current = formikProps.values
    prevStepDataRef.current = formikProps.values
  }, [])

  const formikFilterData = useMemo(() => createSloTargetFilterDTO(formikProps.values), [formikProps.values])

  useEffect(() => {
    if (shouldOpenPeriodUpdateModal(formikProps.values, periodTypesRef)) {
      openPeriodUpdateModal()
    }
  }, [openPeriodUpdateModal, formikFilterData])

  useEffect(() => {
    if (identifier) {
      refetchDashboardWidgets()
    }
  }, [identifier])

  const onStepChange = (): void => {
    prevStepDataRef.current = formikProps.values
    periodTypesRef.current = createSloTargetFilterDTO(formikProps.values)
  }

  const onCancel = (): void => {
    if (isEqual(compositeSloPayloadRef.current, formikProps.values)) {
      handleRedirect()
    } else {
      openSaveCancelModal()
    }
  }

  const {
    data: notificationData,
    loading: notificationLoading,
    error: notificationError,
    refetch: getNotifications
  } = useGetNotificationRuleData({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      pageNumber: notificationPage,
      notificationRuleIdentifiers: formikProps.values.notificationRuleRefs?.map(item => item.notificationRuleRef),
      pageSize: 10
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    },
    lazy: true
  })

  useEffect(() => {
    if (formikProps.values.notificationRuleRefs?.length) {
      getNotifications()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formikProps.values.notificationRuleRefs?.length])

  const { periodType, periodLengthType, serviceLevelObjectivesDetails } = formikProps.values
  const totalOfSloWeight = Number(
    serviceLevelObjectivesDetails
      ?.reduce((total, num) => {
        return num.weightagePercentage + total
      }, 0)
      .toFixed(2)
  )
  const isInValid = totalOfSloWeight > 100 || totalOfSloWeight < 100
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
              helpPanelReferenceId: 'defineCompositeSLO',
              panel: <SLOName<SLOV2Form> formikProps={formikProps} identifier={identifier} isMultiSelect />,
              preview: (
                <CreatePreview id={CreateCompositeSLOSteps.Define_SLO_Identification} data={formikProps.values} />
              )
            },
            {
              id: CreateCompositeSLOSteps.Set_SLO_Time_Window,
              title: getString('cv.CompositeSLO.SetTimeWindow'),
              helpPanelReferenceId: 'setCompositeSLOTimeWindow',
              panel: <PeriodLength periodType={periodType} periodLengthType={periodLengthType} />,
              preview: <CreatePreview id={CreateCompositeSLOSteps.Set_SLO_Time_Window} data={formikProps.values} />
            },
            {
              id: CreateCompositeSLOSteps.Add_SLOs,
              title: getString('cv.CompositeSLO.AddSLO'),
              helpPanelReferenceId: 'addSLOsToCompositeSLO',
              panel: (
                <AddSLOs
                  data={dashboardWidgetsResponse}
                  loading={dashboardWidgetsLoading}
                  refetch={refetchDashboardWidgets}
                  error={dashboardWidgetsError}
                />
              ),
              preview: <CreatePreview id={CreateCompositeSLOSteps.Add_SLOs} data={formikProps.values} />
            },
            {
              id: CreateCompositeSLOSteps.Set_SLO_Target,
              title: getString('cv.CompositeSLO.SetTarget'),
              helpPanelReferenceId: 'setCompositeSLOTarget',
              panel: <SLOTarget formikProps={formikProps} />,
              preview: <CreatePreview id={CreateCompositeSLOSteps.Set_SLO_Target} data={formikProps.values} />
            },
            {
              id: CreateCompositeSLOSteps.Error_Budget_Policy,
              title: getString('cv.CompositeSLO.ErrorBudgetPolicy'),
              helpPanelReferenceId: 'setErrorErrorBudgetAndNotification',
              isOptional: true,
              panel: (
                <CompositeSLOContext.Provider value={{ renderInsideCompositeSLO: true }}>
                  <SLOTargetNotifications
                    setFieldValue={formikProps.setFieldValue}
                    initialNotificationsTableData={notificationData?.data?.content || []}
                    setPage={setNotificationPage}
                    page={notificationPage}
                    loading={notificationLoading}
                    error={notificationError}
                    getNotifications={getNotifications}
                  />
                </CompositeSLOContext.Provider>
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
                  // add check to check errors aprt from formik
                  // fields
                  if (!isInValid) {
                    formikProps.submitForm()
                  }
                }}
              />
            </Layout.Horizontal>
          }
        />
      </Page.Body>
    </>
  )
}
