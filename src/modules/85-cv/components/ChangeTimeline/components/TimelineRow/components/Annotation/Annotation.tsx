import React, { useEffect, useState } from 'react'
import { Container, Icon, Layout, Text, useConfirmationDialog, useToaster } from '@harness/uicore'
import { Color } from '@harness/design-system'
import moment from 'moment'
import { Intent, Popover, PopoverInteractionKind, PopoverPosition } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { useDeleteAnnotation, useGetSecondaryEventDetails } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { TimelineDataPoint } from '../../TimelineRow.types'
import { DATE_FORMAT, INITIAL_MESSAGE_DETAILS, SLO_WIDGETS } from '../../TimelineRow.constants'
import type { AnnotationMessage } from './Annotation.types'
import { getInitialPositionOfWidget } from '../../TimelineRow.utils'
import css from './Annotation.module.scss'

export interface AnnotationProps {
  widget: TimelineDataPoint
  index: number
  addAnnotation?: (annotationMessage?: AnnotationMessage) => void
  fetchSecondaryEvents?: () => Promise<void>
}

export default function Annotation(props: AnnotationProps): JSX.Element {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { widget, index, addAnnotation, fetchSecondaryEvents } = props
  const [messages, setMessages] = useState<
    | {
        uuid: string
        message: string
        createdBy: string
        createdAt: number
      }[]
    | null
  >(null)

  const [messageDetails, setMessageDetails] = useState<{ message: string; id: string }>(INITIAL_MESSAGE_DETAILS)
  const { icon, leftOffset: position, startTime, endTime, identifiers } = widget
  const { height, width, url } = icon
  const initialPosition = getInitialPositionOfWidget(position, height, width)
  const { showError, showSuccess } = useToaster()

  const {
    data: secondaryEventDetailsData,
    loading: secondaryEventDetailsLoading,
    error: getSecondaryEventDetailsError
  } = useGetSecondaryEventDetails({
    queryParams: {
      secondaryEventType: SLO_WIDGETS.ANNOTATION,
      identifiers: identifiers as string[],
      accountId
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  })

  const { mutate: deleteAnnotation, loading: deleteAnnotationMessageLoading } = useDeleteAnnotation({
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier
  })

  const { openDialog } = useConfirmationDialog({
    titleText: getString('cv.slos.sloDetailsChart.deleteMessageConfirmation'),
    contentText: messageDetails.message,
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: function (shouldDelete: boolean) {
      if (shouldDelete) {
        handleDeleteAnnotationMessage(messageDetails.id)
      }
    },
    className: css.confirmationPopup
  })

  useEffect(() => {
    if (secondaryEventDetailsData) {
      const messagesData = secondaryEventDetailsData?.data?.details?.annotations
      setMessages(messagesData)
    }
  }, [secondaryEventDetailsData])

  useEffect(() => {
    if (getSecondaryEventDetailsError) {
      showError(getErrorMessage(getSecondaryEventDetailsError))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getSecondaryEventDetailsError])

  const handleDeleteAnnotationMessage = async (identifier: string): Promise<void> => {
    try {
      await deleteAnnotation(identifier)
      await fetchSecondaryEvents?.()
      showSuccess(getString('cv.slos.sloDetailsChart.annotationMessageDeleted'))
    } catch (error) {
      showError(getErrorMessage(error))
    }
  }

  const loading = deleteAnnotationMessageLoading || secondaryEventDetailsLoading

  return (
    <Container key={`${startTime}-${position}-${index}`} className={css.event} style={initialPosition}>
      <Popover
        interactionKind={PopoverInteractionKind.CLICK}
        popoverClassName={css.annotationsWidgetPopover}
        position={PopoverPosition.LEFT}
        content={
          <Container className={css.annotationContainer} padding={'small'}>
            {loading ? (
              <Container flex={{ justifyContent: 'center', alignItems: 'center' }} height={124} data-testid="loading">
                <Icon name="spinner" color={Color.GREY_400} size={30} />
              </Container>
            ) : (
              <>
                <Text
                  onClick={() => {
                    addAnnotation?.({
                      message: '',
                      startTime,
                      endTime,
                      id: ''
                    })
                  }}
                  className={css.addAnnotationText}
                  padding={{ bottom: 'small' }}
                >
                  {getString('cv.slos.sloDetailsChart.addAnnotation')}
                </Text>
                <Container flex={{ justifyContent: 'flex-start' }} padding={{ bottom: 'small' }}>
                  <Text className={css.annotationTextElements}>{'Period: '}</Text>
                  <Text className={css.annotationTextElements}>{moment(new Date(startTime)).format(DATE_FORMAT)}</Text>
                  <Text className={css.annotationTextElements}>{' - '}</Text>
                  <Text className={css.annotationTextElements}>{`${moment(new Date(endTime)).format(
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
                                    startTime,
                                    endTime,
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
                                  setMessageDetails({
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
        }
      >
        <svg height={height} width={width} className={css.annotationIcon} data-testid="annotationsIcon">
          <image href={url} height={height} width={width} />
        </svg>
      </Popover>
    </Container>
  )
}
