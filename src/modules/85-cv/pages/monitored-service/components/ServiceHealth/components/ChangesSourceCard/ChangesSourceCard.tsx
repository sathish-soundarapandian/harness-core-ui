/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Ticker, TickerVerticalAlignment } from '@common/components/Ticker/Ticker'
import { useToaster } from '@common/components'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useGetMonitoredServiceChangeEventSummary } from 'services/cv'
import { numberFormatter } from '@common/utils/utils'
import type { ChangeSourceCardData, ChangeSourceCardInterface } from './ChangesSourceCard.types'
import TickerValue from './components/TickerValue/TickerValue'
import { calculateChangePercentage, getTickerColor } from './ChangesSourceCard.utils'
import ChangeSourceFetchingError from './components/ChangesSourceFetchingError/ChangesSourceFetchingError'
import ChangesSourceLoading from './components/ChangesSourceLoading/ChangesSourceLoading'
import css from './ChangesSourceCard.module.scss'

export default function ChangeSourceCard(props: ChangeSourceCardInterface): JSX.Element {
  const { startTime, endTime, monitoredServiceIdentifiers, monitoredServiceIdentifier } = props
  const { getString } = useStrings()
  const { showError, clear } = useToaster()
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps>()
  const isAccountLevel = !orgIdentifier && !projectIdentifier && !!accountId

  const monitoredServiceParams = monitoredServiceIdentifier
    ? { monitoredServiceIdentifier: monitoredServiceIdentifier }
    : { monitoredServiceIdentifiers }

  const { data, loading, error, refetch } = useGetMonitoredServiceChangeEventSummary({ lazy: true })

  useEffect(() => {
    if (monitoredServiceIdentifiers?.length || monitoredServiceIdentifier) {
      refetch({
        queryParams: {
          accountId,
          orgIdentifier,
          projectIdentifier,
          ...monitoredServiceParams,
          startTime,
          endTime,
          isMonitoredServiceIdentifierScoped: isAccountLevel
        },
        queryParamStringifyOptions: {
          arrayFormat: 'repeat'
        }
      })
    }
  }, [monitoredServiceIdentifier, monitoredServiceIdentifiers, startTime, endTime])

  const changeSummaryList = useMemo(
    () => calculateChangePercentage(getString, data?.resource),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data?.resource]
  )

  if (error) {
    clear()
    showError(getErrorMessage(error))
  }

  const renderContent = (): JSX.Element | JSX.Element[] => {
    if (loading) {
      return (
        <Container padding={{ left: 'medium', top: 'medium' }}>
          <ChangesSourceLoading />
        </Container>
      )
    } else if (error) {
      return <ChangeSourceFetchingError errorMessage={getString('cv.monitoredServices.failedToFetchSummaryData')} />
    } else {
      return changeSummaryList.map((ticker: ChangeSourceCardData) => {
        const tickerColor =
          ticker.label === getString('cv.changeSource.tooltip.incidents')
            ? getTickerColor(ticker.percentage)
            : Color.PRIMARY_4
        return (
          <Container key={ticker.id} className={css.ticker}>
            <Ticker
              value={<TickerValue value={ticker.percentage} label={ticker.label} color={tickerColor} />}
              decreaseMode={ticker.percentage < 0}
              color={tickerColor}
              verticalAlign={TickerVerticalAlignment.TOP}
            >
              <Text
                className={css.tickerCount}
                color={Color.BLACK}
                font={{ weight: 'bold', size: 'large' }}
                margin={{ right: 'small' }}
                data-testid={ticker.id}
              >
                {numberFormatter(Math.abs(ticker.count), {
                  truncate: true
                })}
              </Text>
            </Ticker>
          </Container>
        )
      })
    }
  }

  return <Container className={css.tickersRow}>{renderContent()}</Container>
}
