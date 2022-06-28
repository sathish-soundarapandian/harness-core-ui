import React, { useState } from 'react'
import cx from 'classnames'
import {
  Layout,
  Text,
  Container,
  Color,
  FontVariation,
  Icon,
  FlexExpander,
  Button,
  ButtonSize,
  ButtonVariation
} from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { useGetExpensiveQueries, useGetTimeSeries } from 'services/ce'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import BigQueryChart from './Chart'
import SlotUsageChart from './SlotUsageChart'
import BigQueryTable from './BigQueryTable'
import css from './BigQuery.module.scss'

const BigQueryChartContainer = () => {
  const [selectedTab, setSelectedTab] = useState(0)
  const [isEditing, setIsEditing] = useState(false)

  const { accountId } = useParams<AccountPathProps>()

  const { data } = useGetTimeSeries({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { data: gridData } = useGetExpensiveQueries({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const chartData = data?.data

  if (!chartData) {
    return <Icon name="spinner" />
  }

  const renderButtons = () => {
    const toggleEditing = () => {
      setIsEditing(val => !val)
    }
    if (selectedTab !== 1) {
      return null
    }
    if (isEditing) {
      return null
    }
    return (
      <Button text="Optimize" variation={ButtonVariation.PRIMARY} size={ButtonSize.SMALL} onClick={toggleEditing} />
    )
  }

  return (
    <Container margin="large" background={Color.WHITE} padding="small">
      <Layout.Horizontal
        className={css.container}
        margin={{
          top: 'xsmall',
          left: 'xsmall'
        }}
      >
        {isEditing ? (
          <Text font={{ variation: FontVariation.SMALL }}>Edit Slot Usage </Text>
        ) : (
          <>
            <Text font={{ variation: FontVariation.SMALL }}>Showing</Text>
            <Text
              onClick={() => {
                setSelectedTab(0)
              }}
              font={{ variation: FontVariation.SMALL }}
              className={cx(css.toggle, { [css.active]: selectedTab === 0 })}
            >
              Query vs Cost
            </Text>
            <Text
              font={{ variation: FontVariation.SMALL }}
              className={cx(css.toggle, { [css.active]: selectedTab === 1 })}
              onClick={() => {
                setSelectedTab(1)
              }}
            >
              Slot Usage
            </Text>
          </>
        )}
        <FlexExpander />
        {renderButtons()}
      </Layout.Horizontal>
      {selectedTab === 0 ? (
        <>
          <BigQueryChart data={chartData} />
          <BigQueryTable gridData={gridData} />
        </>
      ) : (
        <SlotUsageChart data={chartData} setIsEditing={setIsEditing} isEditing={isEditing} />
      )}
    </Container>
  )
}

export default BigQueryChartContainer
