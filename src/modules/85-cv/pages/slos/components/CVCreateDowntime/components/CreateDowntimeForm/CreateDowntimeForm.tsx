/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Page, Button, ButtonVariation } from '@harness/uicore'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { CVStepper } from '@cv/components/CVStepper/CVStepper'
import { useGetDowntimeAssociatedMonitoredServices } from 'services/cv'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { CreateDowntimeFormInterface, CreateDowntimeSteps } from './CreateDowntimeForm.types'
import { DowntimeForm, DowntimeFormFields } from '../../CVCreateDowntime.types'
import DowntimeName from './components/DowntimeName/DowntimeName'
import DowntimeWindow from './components/DowntimeWindow/DowntimeWindow'
import AddMonitoredServices from './components/AddMonitoredServices/AddMonitoredServices'
import { getErrorMessageByTabId, isFormDataValid } from './CreateDowntimeForm.utils'
import { CreateDowntimePreview } from './components/CreateDowntimePreview/CreateDowntimePreview'
import css from './CreateDowntimeForm.module.scss'

export const CreateDowntimeForm = ({
  handleRedirect,
  loadingSaveButton,
  runValidationOnMount
}: CreateDowntimeFormInterface): JSX.Element => {
  const { accountId, orgIdentifier, projectIdentifier, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()
  const { getString } = useStrings()
  const formikProps = useFormikContext<DowntimeForm>()
  const isStepValid = useCallback(
    (stepId: string) => isFormDataValid(formikProps, stepId as CreateDowntimeSteps),
    [formikProps.values, formikProps.errors]
  )

  const [validateAllSteps, setValidateAllSteps] = useState<boolean | undefined>(runValidationOnMount)
  const [isCreateFlow, setIsCreateFlow] = useState(false)

  const queryParams = { accountIdentifier: accountId, orgIdentifier, projectIdentifier, identifier }

  const {
    data: msListData,
    loading: msListLoading,
    error: msListError,
    refetch: refetchMsList
  } = useGetDowntimeAssociatedMonitoredServices({ ...queryParams, lazy: true })

  useEffect(() => {
    if (identifier) {
      refetchMsList()
    } else {
      setIsCreateFlow(true)
    }
  }, [identifier])

  useEffect(() => {
    if (msListData) {
      const { resource } = msListData
      formikProps.setFieldValue(DowntimeFormFields.MS_LIST, resource || [])
    }
  }, [msListData])

  return (
    <>
      <CVStepper
        id="createDowntimeTabs"
        isStepValid={isStepValid}
        runValidationOnMount={validateAllSteps}
        stepList={[
          {
            id: CreateDowntimeSteps.DEFINE_DOWNTIME,
            title: getString('cv.sloDowntime.steps.identification'),
            panel: <DowntimeName identifier={identifier} />,
            errorMessage: getErrorMessageByTabId(formikProps, CreateDowntimeSteps.DEFINE_DOWNTIME),
            preview: <CreateDowntimePreview id={CreateDowntimeSteps.DEFINE_DOWNTIME} data={formikProps.values} />
          },
          {
            id: CreateDowntimeSteps.SELECT_DOWNTIME_WINDOW,
            title: getString('cv.sloDowntime.steps.downtimeWindow'),
            panel: <DowntimeWindow />,
            errorMessage: getErrorMessageByTabId(formikProps, CreateDowntimeSteps.SELECT_DOWNTIME_WINDOW),
            preview: <CreateDowntimePreview id={CreateDowntimeSteps.SELECT_DOWNTIME_WINDOW} data={formikProps.values} />
          },
          {
            id: CreateDowntimeSteps.SELECT_MONITORED_SERVICES,
            title: getString('cv.sloDowntime.steps.monitoredServices'),
            panel: (
              <AddMonitoredServices
                msListData={msListData}
                msListLoading={msListLoading}
                refetchMsList={refetchMsList}
                msListError={getErrorMessage(msListError)}
                isCreateFlow={isCreateFlow}
              />
            ),
            errorMessage: getErrorMessageByTabId(formikProps, CreateDowntimeSteps.SELECT_MONITORED_SERVICES)
          }
        ]}
      />
      <Page.Header
        className={css.footer}
        title={
          <Layout.Horizontal spacing="medium">
            <Button text={getString('cancel')} variation={ButtonVariation.SECONDARY} onClick={handleRedirect} />
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
    </>
  )
}
