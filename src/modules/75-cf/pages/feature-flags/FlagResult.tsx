/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Classes } from '@blueprintjs/core'
import cx from 'classnames'
import { Container, Heading, Layout, Text, Utils } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { ContainerProps } from '@harness/uicore/dist/components/Container/Container'
import { useStrings } from 'framework/strings'
import type { Feature } from 'services/cf'
import { VariationWithIcon } from '@cf/components/VariationWithIcon/VariationWithIcon'
import { formatNumber } from '@cf/utils/CFUtils'
import css from './FeatureFlagsPage.module.scss'

export interface FlagResultProps extends ContainerProps {
  feature: Feature
}

export const FlagResult: React.FC<FlagResultProps> = ({ feature, style, ...props }) => {
  const { getString } = useStrings()
  const results = feature.results
  const metricsCount = results?.map(({ count }) => count).reduce((sum = 0, count = 0) => sum + count, 0) || 0
  const singleVariationDistribution = results?.length === 1
  const tooltip = metricsCount ? <FlagResultTooltip feature={feature} /> : undefined
  const hasMoreThanTwoResults = (results?.length as number) > 2

  return (
    <Container style={{ display: 'inline-block', ...style }} {...props}>
      <Text tooltip={tooltip} tooltipProps={{ isDark: true }} style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            width: 94,
            height: 12,
            display: 'inline-block',
            backgroundColor: !metricsCount
              ? 'rgb(237 237 246)'
              : singleVariationDistribution
              ? '#6739B7'
              : 'transparent',
            borderRadius: '3px'
          }}
        >
          {metricsCount > 0 && !singleVariationDistribution && (
            <>
              <span
                style={{
                  width: hasMoreThanTwoResults ? 54 : 71,
                  height: 12,
                  display: 'inline-block',
                  backgroundColor: '#6739B7',
                  borderRadius: '3px'
                }}
              />
              <span
                style={{
                  width: 21,
                  height: 12,
                  display: 'inline-block',
                  backgroundColor: '#C239F2',
                  borderRadius: '3px',
                  margin: '0 1px'
                }}
              />
              {hasMoreThanTwoResults && (
                <span
                  style={{
                    width: 17,
                    height: 12,
                    display: 'inline-block',
                    backgroundColor: '#D1C3E9',
                    borderRadius: '3px'
                  }}
                />
              )}
            </>
          )}
        </span>
        <Text
          style={{
            fontSize: '10px',
            fontWeight: 400,
            color: metricsCount > 0 ? '#6B6D85' : '#9293abad',
            paddingTop: '8px',
            textAlign: 'center'
          }}
        >
          {getString(metricsCount > 0 ? 'cf.featureFlags.metrics.evaluations' : 'cf.featureFlags.metrics.noMetrics', {
            count: formatNumber(metricsCount)
          }).toLocaleUpperCase()}
        </Text>
      </Text>
    </Container>
  )
}

const FlagResultTooltip: React.FC<FlagResultProps> = ({ feature }) => {
  const { getString } = useStrings()
  const results = feature.results
  const len = results?.length || 1
  const metricsCount = results?.map(({ count }) => count).reduce((sum = 0, count = 0) => sum + count, 0) || 0
  const height = len > 2 ? 204 : 126 + len * 26

  return (
    <Container padding="xlarge" style={{ overflow: 'auto', width: 325, height }} onClick={Utils.stopEvent}>
      <Heading
        level={3}
        color={Color.WHITE}
        style={{ fontSize: '14px', fontWeight: 600 }}
        margin={{ bottom: 'medium' }}
      >
        {getString('cf.featureFlags.metrics.evaluationStatistics')}
        <Text
          style={{ fontSize: '11px', opacity: 0.5, fontWeight: 600 }}
          inline
          margin={{ left: 'xsmall' }}
          color={Color.WHITE}
        >
          ({new Intl.NumberFormat().format(metricsCount)})
        </Text>
      </Heading>
      <Container>
        <table className={cx(Classes.HTML_TABLE, Classes.HTML_TABLE_CONDENSED, Classes.SMALL, css.tooltipTable)}>
          <thead>
            <tr>
              <th>
                <Text color={Color.WHITE} style={{ fontSize: '8px', fontWeight: 600, opacity: 0.7 }}>
                  {getString('cf.shared.variation').toLocaleUpperCase()}
                </Text>
              </th>
              <th>
                <Text color={Color.WHITE} style={{ fontSize: '8px', fontWeight: 600, opacity: 0.7 }}>
                  {getString('cf.shared.evaluations').toLocaleUpperCase()}
                </Text>
              </th>
            </tr>
          </thead>
          <tbody>
            {results?.map(result => {
              const index = feature.variations.findIndex(
                variation => variation.identifier === result.variationIdentifier
              )

              return (
                <tr key={result.variationIdentifier}>
                  <td>
                    {index === -1 ? (
                      <Text color={Color.WHITE} style={{ fontSize: '11px' }}>
                        {result.variationName}
                      </Text>
                    ) : (
                      <Layout.Horizontal spacing="xsmall" style={{ alignItems: 'center' }}>
                        <VariationWithIcon
                          variation={feature.variations[index]}
                          index={index}
                          textStyle={{ color: Color.WHITE, fontSize: '11px' }}
                        />
                      </Layout.Horizontal>
                    )}
                  </td>
                  <td>
                    <Text color={Color.WHITE} style={{ fontSize: '11px' }}>
                      {new Intl.NumberFormat().format(result.count as number)}
                    </Text>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Container>
    </Container>
  )
}
