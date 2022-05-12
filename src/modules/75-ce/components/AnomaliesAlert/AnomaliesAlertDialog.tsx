/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { StepWizard, Formik, FormikForm, useToaster, getErrorInfoFromErrorObject, Color } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import { QlceView, useFetchPerspectiveListQuery } from 'services/ce/services'
import { channelNameUrlMapping, channels } from '@ce/constants'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import {
  CCMNotificationChannel,
  CCMPerspectiveNotificationChannelsDTO,
  useCreateNotificationSetting,
  useUpdateNotificationSetting
} from 'services/ce'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { USER_JOURNEY_EVENTS } from '@ce/TrackingEventsConstants'
import PerspectiveSelection from './PerspectiveSelection'
import NotificationMethod, { NotificationValues } from './NotificationMethod'
import css from './AnomaliesAlertDialog.module.scss'

const modalPropsLight: IDialogProps = {
  isOpen: true,
  enforceFocus: false,
  style: {
    width: 1100,
    position: 'relative',
    minHeight: 600,
    borderLeft: 0,
    paddingBottom: 0,
    overflow: 'hidden'
  }
}

interface AlertDialogProps {
  hideAnomaliesAlertModal: () => void
  handleSubmit: (data: FormValues) => void
  notificationData: CCMPerspectiveNotificationChannelsDTO
  source?: string
  isEditFlow: boolean
}
interface AnomalyAlertDialogProps {
  setRefetchingState: React.Dispatch<React.SetStateAction<boolean>>
  selectedAlert: CCMPerspectiveNotificationChannelsDTO
  source?: string
}

interface AlertsData {
  channelName?: channels
  channelUrl?: string | string[]
}
interface FormValues {
  perspective: string
  alertList: AlertsData[]
}

export const AnomalyAlertDialog: React.FC<AlertDialogProps> = ({
  hideAnomaliesAlertModal,
  handleSubmit,
  notificationData,
  source,
  isEditFlow
}) => {
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()

  const [{ data: perspectiveData }] = useFetchPerspectiveListQuery()

  /* istanbul ignore next */
  const perspectiveList = (perspectiveData?.perspectives?.customerViews || []) as QlceView[]

  const items = perspectiveList.map(pName => ({
    label: pName.name as string,
    value: pName.id as string
  }))

  const channelsData =
    notificationData?.channels?.map((item: CCMNotificationChannel) => {
      return {
        channelName: item.notificationChannelType,
        channelUrl: item.channelUrls?.[0]
      }
    }) || /* istanbul ignore next */ []

  const validationSchema = Yup.object().shape({
    perspective: Yup.string().required(),
    alertList: Yup.array(
      Yup.object({
        channelName: Yup.string().required(
          getString('ce.anomalyDetection.notificationAlerts.channelSelectionRequiredMsg')
        ),
        channelUrl: Yup.string().required(getString('ce.anomalyDetection.notificationAlerts.channelUrlRequiredMsg'))
      })
    )
  })

  useEffect(() => {
    trackEvent(USER_JOURNEY_EVENTS.ANOMALY_ALERTS_OVERVIEW, {
      pageName: source,
      isEditFlow: isEditFlow
    })
  }, [])

  return (
    <Dialog onClose={hideAnomaliesAlertModal} {...modalPropsLight} canOutsideClickClose={true}>
      <Formik<NotificationValues>
        onSubmit={data => handleSubmit(data)}
        formName={'createNotificationAlert'}
        initialValues={{
          perspective: notificationData?.perspectiveId || '',
          alertList: channelsData || /* istanbul ignore next */ []
        }}
        validationSchema={validationSchema}
      >
        {formikProps => {
          return (
            <FormikForm>
              <StepWizard
                icon="right-bar-notification"
                iconProps={{
                  size: 34,
                  color: Color.WHITE
                }}
                className={css.stepWizard}
                title={getString('ce.anomalyDetection.notificationAlerts.heading')}
              >
                <PerspectiveSelection
                  name={getString('ce.anomalyDetection.notificationAlerts.overviewStep')}
                  onClose={hideAnomaliesAlertModal}
                  items={items}
                  formikProps={formikProps}
                />
                <NotificationMethod
                  name={getString('ce.anomalyDetection.notificationAlerts.notificationStep')}
                  onClose={hideAnomaliesAlertModal}
                  formikProps={formikProps}
                />
              </StepWizard>
            </FormikForm>
          )
        }}
      </Formik>
    </Dialog>
  )
}

const useAnomaliesAlertDialog = (props: AnomalyAlertDialogProps) => {
  const { accountId } = useParams<AccountPathProps>()
  const { showError, showSuccess } = useToaster()
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()

  const { mutate: createNotificationAlert } = useCreateNotificationSetting({
    queryParams: {
      accountIdentifier: accountId,
      perspectiveId: ''
    }
  })

  const { mutate: updateNotificationAlert } = useUpdateNotificationSetting({
    queryParams: {
      accountIdentifier: accountId,
      perspectiveId: ''
    }
  })

  const isEditFlow = Boolean(props.selectedAlert && props.selectedAlert.channels?.length) || false

  /* istanbul ignore next */
  const handleSubmit = async (data: FormValues) => {
    const payload = data.alertList.map((item: AlertsData) => {
      const channel = item.channelName

      if (channel === 'EMAIL' && typeof item.channelUrl === 'string') {
        const emailList = item.channelUrl.split(',')
        return {
          type: channel,
          [channelNameUrlMapping[channel as keyof typeof channelNameUrlMapping]]: emailList
        }
      }
      return {
        type: channel,
        [channelNameUrlMapping[channel as keyof typeof channelNameUrlMapping]]: item.channelUrl
      }
    })

    trackEvent(USER_JOURNEY_EVENTS.SAVE_ANOMALY_ALERTS, {
      pageName: props.source,
      isEditFlow: isEditFlow,
      channelsCount: payload.length
    })

    const queryParams = {
      perspectiveId: data.perspective,
      accountIdentifier: accountId
    }

    try {
      let response
      if (isEditFlow) {
        response = await updateNotificationAlert({ channels: payload as CCMNotificationChannel[] }, { queryParams })
      } else {
        response = await createNotificationAlert({ channels: payload as CCMNotificationChannel[] }, { queryParams })
      }

      hideAnomaliesAlertModal()
      props.setRefetchingState(true)
      if (response) {
        if (isEditFlow) {
          showSuccess(getString('ce.anomalyDetection.notificationAlerts.updateAlertSuccessMsg'))
        } else {
          showSuccess(getString('ce.anomalyDetection.notificationAlerts.addAlertSuccessMsg'))
        }
      }
    } catch (error) {
      showError(getErrorInfoFromErrorObject(error))
    }
  }

  const [createAnomaliesAlertModal, hideAnomaliesAlertModal] = useModalHook(
    () => (
      <AnomalyAlertDialog
        hideAnomaliesAlertModal={hideAnomaliesAlertModal}
        handleSubmit={handleSubmit}
        notificationData={props.selectedAlert}
        source={props.source}
        isEditFlow={isEditFlow}
      />
    ),
    [props.selectedAlert]
  )
  return {
    openAnomaliesAlertModal: createAnomaliesAlertModal
  }
}

export default useAnomaliesAlertDialog
