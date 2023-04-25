/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { Container, Icon, Layout, Text, useConfirmationDialog, useToaster } from '@harness/uicore'
import { Color } from '@harness/design-system'
import moment from 'moment'
import { Intent, Popover, PopoverInteractionKind, PopoverPosition } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { useDeleteAccountLevelAnnotation, useDeleteAnnotation, useGetSecondaryEventDetails } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { getIsAccountLevel } from '@cv/pages/slos/SLOCard/components/AnnotationDetails/AnnotationDetails.utils'
import type { TimelineDataPoint } from '../../TimelineRow.types'
import { getWidgetsGroupedByType } from './WidgetsWithSameStartTime.utils'
import { DATE_FORMAT, INITIAL_MESSAGE_DETAILS, SLO_WIDGETS } from '../../TimelineRow.constants'
import type { AnnotationMessage } from '../Annotation/Annotation.types'
import { getInitialPositionOfWidget } from '../../TimelineRow.utils'
import type { AnnotationMessageInfo } from './WidgetsWithSameStartTime.types'
import css from './WidgetsWithSameStartTimeProps.module.scss'

export interface WidgetsWithSameStartTimeProps {
  widgets: TimelineDataPoint[]
  index: number
  addAnnotation?: (annotationMessage?: AnnotationMessage) => void
  fetchSecondaryEvents?: () => Promise<void>
  startTimeForWidgets: number
}

export default function WidgetsWithSameStartTime(props: WidgetsWithSameStartTimeProps): JSX.Element {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { widgets, index, addAnnotation, startTimeForWidgets, fetchSecondaryEvents } = props
  const [messages, setMessages] = useState<AnnotationMessageInfo[] | null>(null)
  const [messageDetailsInfo, setMessageDetailsInfo] = useState<{ message: string; id: string }>(INITIAL_MESSAGE_DETAILS)
  const { showError, showSuccess } = useToaster()

  const { widgetsWithDownTimeType, widgetsWithAnnotationType } = useMemo(() => {
    return getWidgetsGroupedByType(widgets)
  }, [widgets])

  const widgetWithDownTimeType = widgetsWithDownTimeType[0]
  const widgetWithAnnotationType = widgetsWithAnnotationType[0]
  const { icon, leftOffset: position } = widgetWithDownTimeType || {}
  const {
    startTime: startTimeForAnnotation,
    endTime: endTimeForAnnotation,
    identifiers
  } = widgetWithAnnotationType || {}
  const { height, width } = icon
  const initialPosition = getInitialPositionOfWidget(position, height, width)
  const isAccountLevel = getIsAccountLevel(orgIdentifier, projectIdentifier, accountId)

  const {
    data: secEventDetailsData,
    loading: secEventDetailsLoading,
    error: getSecEventDetailsError,
    refetch: fetchEventDetails
  } = useGetSecondaryEventDetails({
    queryParams: {
      secondaryEventType: SLO_WIDGETS.ANNOTATION,
      identifiers: identifiers as string[],
      accountId
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    },
    lazy: true
  })

  const { mutate: deleteAnnotations, loading: deleteAnnotationsMessageLoading } = useDeleteAnnotation({
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier
  })

  const { mutate: accountLevelDeleteAnnotation, loading: accountLevelDeleteAnnotationMessageLoading } =
    useDeleteAccountLevelAnnotation({
      accountIdentifier: accountId
    })

  const { openDialog } = useConfirmationDialog({
    titleText: getString('cv.slos.sloDetailsChart.deleteMessageConfirmation'),
    contentText: messageDetailsInfo.message,
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: function (shouldDelete: boolean) {
      if (shouldDelete) {
        handleDeleteNestedAnnotationMessage(messageDetailsInfo.id)
      }
    },
    className: css.confirmationPopup
  })

  useEffect(() => {
    if (Array.isArray(identifiers) && identifiers.length) {
      fetchEventDetails?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identifiers])

  useEffect(() => {
    if (secEventDetailsData) {
      const messagesData = secEventDetailsData?.data?.details?.annotations
      setMessages(messagesData)
    }
  }, [secEventDetailsData])

  useEffect(() => {
    if (getSecEventDetailsError) {
      showError(getErrorMessage(getSecEventDetailsError))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getSecEventDetailsError])

  const handleDeleteNestedAnnotationMessage = async (identifier: string): Promise<void> => {
    try {
      if (isAccountLevel) {
        await accountLevelDeleteAnnotation(identifier)
      } else {
        await deleteAnnotations(identifier)
      }
      await fetchSecondaryEvents?.()
      showSuccess(getString('cv.slos.sloDetailsChart.annotationMessageDeleted'))
    } catch (error) {
      showError(getErrorMessage(error))
    }
  }

  const loading =
    deleteAnnotationsMessageLoading || accountLevelDeleteAnnotationMessageLoading || secEventDetailsLoading

  return (
    <Container key={`${startTimeForWidgets}-${position}-${index}`} className={css.event} style={initialPosition}>
      <Popover
        interactionKind={PopoverInteractionKind.CLICK}
        popoverClassName={css.downTimeWidgetsPopover}
        position={PopoverPosition.LEFT}
        content={
          <Container className={css.downTimeContainer} padding={'small'}>
            <Layout.Vertical>
              <Text padding={{ bottom: 'small' }} className={css.annotationTextElements}>
                {moment(new Date(startTimeForWidgets)).format(DATE_FORMAT)}
              </Text>
              <hr className={css.division} />
              {widgetWithAnnotationType ? (
                <Container className={css.annotationContainer}>
                  {loading ? (
                    <Container
                      flex={{ justifyContent: 'center', alignItems: 'center' }}
                      height={124}
                      data-testid="loading"
                    >
                      <Icon name="spinner" color={Color.GREY_400} size={30} />
                    </Container>
                  ) : (
                    <>
                      <Text
                        onClick={() => {
                          addAnnotation?.({
                            message: '',
                            startTime: startTimeForAnnotation,
                            endTime: endTimeForAnnotation,
                            id: ''
                          })
                        }}
                        className={css.addAnnotationText}
                        padding={{ bottom: 'small' }}
                      >
                        {getString('cv.slos.sloDetailsChart.addAnnotation')}
                      </Text>
                      <Container flex={{ justifyContent: 'flex-start' }} padding={{ bottom: 'small' }}>
                        <Text font={{ weight: 'bold' }} className={css.annotationTextElements}>
                          {`${getString('cv.slos.sloDetailsChart.period')}: `}
                        </Text>
                        <Text className={css.annotationTextElements}>
                          {moment(new Date(startTimeForAnnotation)).format(DATE_FORMAT)}
                        </Text>
                        <Text className={css.annotationTextElements}>{' - '}</Text>
                        <Text className={css.annotationTextElements}>{`${moment(new Date(endTimeForAnnotation)).format(
                          DATE_FORMAT
                        )}`}</Text>
                      </Container>
                      {Array.isArray(messages) && messages.length
                        ? messages.map(messageData => {
                            const { message = '', createdAt, uuid } = messageData || {}
                            return (
                              <Layout.Vertical key={message}>
                                <Container flex={{ justifyContent: 'space-between' }}>
                                  <Text
                                    className={css.annotationMessageStartTime}
                                    padding={{ top: 'small', bottom: 'small' }}
                                  >
                                    {`${moment(new Date(createdAt)).format(DATE_FORMAT)}`}
                                  </Text>
                                  <Container flex={{ justifyContent: 'flex-start' }}>
                                    <Icon
                                      className={css.annotationActionIcons}
                                      data-testid="editAnnotations"
                                      padding={'xsmall'}
                                      name="Edit"
                                      title={getString('edit')}
                                      size={16}
                                      onClick={e => {
                                        e.stopPropagation()
                                        addAnnotation?.({
                                          message,
                                          startTime: startTimeForAnnotation,
                                          endTime: endTimeForAnnotation,
                                          id: uuid
                                        })
                                      }}
                                    />
                                    <Icon
                                      className={css.annotationActionIcons}
                                      data-testid="deleteAnnotations"
                                      padding={'xsmall'}
                                      name="main-trash"
                                      title={getString('delete')}
                                      size={16}
                                      onClick={e => {
                                        e.stopPropagation()
                                        setMessageDetailsInfo({
                                          message,
                                          id: uuid
                                        })
                                        openDialog()
                                      }}
                                    />
                                  </Container>
                                </Container>
                                <Text className={css.annotationTextElements} padding={{ bottom: 'small' }}>
                                  {message}
                                </Text>
                                <hr className={css.division} />
                              </Layout.Vertical>
                            )
                          })
                        : null}
                    </>
                  )}
                </Container>
              ) : null}
            </Layout.Vertical>

            <Text className={css.downTimeTextElements} padding={{ bottom: 'small' }}>
              {getString('cv.sloDowntime.label')}
            </Text>
            <Layout.Vertical>
              {Array.isArray(widgetsWithDownTimeType) && widgetsWithDownTimeType.length
                ? widgetsWithDownTimeType.map((widgetInfo: TimelineDataPoint, widgetIndex: number) => {
                    const { startTime, endTime } = widgetInfo
                    return (
                      <>
                        <Layout.Horizontal
                          key={`${startTime}-${position}-${widgetIndex}`}
                          padding={{ bottom: 'small' }}
                        >
                          <Text className={css.downTimeTextElements}>
                            {moment(new Date(startTime)).format(DATE_FORMAT)} -{' '}
                            {moment(new Date(endTime)).format(DATE_FORMAT)}
                          </Text>
                        </Layout.Horizontal>
                        <hr className={css.division} />
                      </>
                    )
                  })
                : null}
            </Layout.Vertical>
          </Container>
        }
      >
        <Container className={css.multiWidget} data-testid="multiWidgetsIcon">
          <Text className={css.multiWidgetCount}>{widgets.length}</Text>
        </Container>
      </Popover>
    </Container>
  )
}
