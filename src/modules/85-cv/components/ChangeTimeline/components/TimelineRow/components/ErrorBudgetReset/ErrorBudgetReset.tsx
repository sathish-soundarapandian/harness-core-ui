/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { Container, Icon, Text, useToaster } from '@harness/uicore'
import { Color } from '@harness/design-system'
import moment from 'moment'
import { Popover, PopoverInteractionKind, PopoverPosition } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetSecondaryEventDetails } from 'services/cv'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { TimelineDataPoint } from '../../TimelineRow.types'
import { DATE_FORMAT, SLO_WIDGETS } from '../../TimelineRow.constants'
import { getInitialPositionOfWidget } from '../../TimelineRow.utils'
import css from '../../TimelineRow.module.scss'

export interface ErrorBudgetResetProps {
  widget: TimelineDataPoint
  index: number
}

export default function ErrorBudgetReset(props: ErrorBudgetResetProps): JSX.Element {
  const { accountId } = useParams<ProjectPathProps>()
  const { showError } = useToaster()
  const { widget, index } = props
  const { getString } = useStrings()
  const { icon, leftOffset: position, startTime, identifiers } = widget
  const { height, width, url } = icon
  const initialPosition = getInitialPositionOfWidget(position, height, width)

  const {
    data: secondaryEventDetailsData,
    loading,
    error
  } = useGetSecondaryEventDetails({
    queryParams: {
      secondaryEventType: SLO_WIDGETS.ERROR_BUDGET_RESET,
      identifiers: identifiers as string[],
      accountId
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  })

  useEffect(() => {
    if (error) {
      showError(getErrorMessage(error))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  return (
    <Container key={`${startTime}-${position}-${index}`} className={css.event} style={initialPosition}>
      <Popover
        interactionKind={PopoverInteractionKind.CLICK}
        popoverClassName={css.widgetsPopover}
        position={PopoverPosition.TOP}
        content={
          <Container className={css.widgetContainer} padding={'small'}>
            {loading ? (
              <Container
                flex={{ justifyContent: 'center', alignItems: 'center' }}
                height={124}
                data-testid="loadingIcon"
              >
                <Icon name="spinner" color={Color.GREY_400} size={30} />
              </Container>
            ) : (
              <>
                <Text className={css.widgetTextElements} padding={{ bottom: 'xsmall' }}>
                  {moment(new Date(startTime)).format(DATE_FORMAT)}
                </Text>
                <Text className={css.widgetTextElements}>
                  {getString('cv.errorBudgetIncrease', {
                    minutes: secondaryEventDetailsData?.data?.details?.errorBudgetIncrementMinutes
                  })}
                </Text>
              </>
            )}
          </Container>
        }
      >
        <svg height={height} width={width} className={css.widgetIcon} data-testid="errorBudgetResetIcon">
          <image href={url} height={height} width={width} />
        </svg>
      </Popover>
    </Container>
  )
}
