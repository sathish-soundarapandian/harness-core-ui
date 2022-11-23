/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Collapse } from '@blueprintjs/core'
import { Container, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import type { SharedCost, CostTarget, ViewIdCondition } from 'services/ce'
import { useStrings } from 'framework/strings'
import css from './RuleViewer.module.scss'

interface RuleViewProps {
  condition: ViewIdCondition
  showAndOperatior: boolean
}

const RuleView: (props: RuleViewProps) => React.ReactElement | null = ({ condition, showAndOperatior }) => {
  const { getString } = useStrings()
  const pillProps = {
    border: { radius: 10 },
    background: Color.GREY_200,
    className: css.pillRadius,
    padding: {
      left: 'small',
      right: 'small',
      top: 'xsmall',
      bottom: 'xsmall'
    },
    font: { variation: FontVariation.TINY }
  }
  const values = condition.values || []
  const valuesToDisplay = values.slice(0, 2)

  const identifierName = condition.viewField?.identifierName
  const fieldName = condition.viewField?.fieldName

  return fieldName && identifierName ? (
    <Layout.Horizontal
      spacing="small"
      className={css.ruleViewContainer}
      padding={{
        top: 'small',
        bottom: 'small'
      }}
    >
      <Text font={{ variation: FontVariation.SMALL_SEMI }}>{`${identifierName} > ${fieldName}`}</Text>
      <Text font={{ variation: FontVariation.SMALL_SEMI }}>{`${condition.viewOperator}`}</Text>
      {valuesToDisplay.map(val => (
        <Text {...pillProps} key={val}>
          {val}
        </Text>
      ))}
      {values.length > 2 ? <Text {...pillProps}>{`+${values.length - 2}`}</Text> : null}
      {showAndOperatior ? (
        <Text font={{ variation: FontVariation.SMALL_SEMI }}>{getString('ce.common.and')}</Text>
      ) : null}
    </Layout.Horizontal>
  ) : null
}

interface RuleViewerProps {
  isOpen: boolean
  value: SharedCost | CostTarget
}
const RuleViewer: (props: RuleViewerProps) => React.ReactElement | null = ({ isOpen, value }) => {
  const { getString } = useStrings()

  if (!value.rules?.length) {
    return null
  }

  const rulesLength = value.rules.length
  return (
    <Collapse keepChildrenMounted isOpen={isOpen}>
      <Container background={Color.GREY_100}>
        {value.rules.map((rule, index) => {
          const showOrOperator = index < rulesLength - 1
          const viewConditions = rule.viewConditions as ViewIdCondition[]
          return (
            <Container
              className={css.ruleViewerContainer}
              key={`viewRule-${index}`}
              border={{
                top: true
              }}
              padding={{ top: 'small', bottom: 'small' }}
              margin={{
                left: 'large',
                right: 'large'
              }}
            >
              {(viewConditions as ViewIdCondition[]).map((condition, index1) => {
                return (
                  <RuleView
                    key={`viewRule-${index}-${index1}`}
                    condition={condition}
                    showAndOperatior={index1 < viewConditions?.length - 1}
                  />
                )
              })}
              {showOrOperator ? (
                <Text
                  background={Color.GREY_100}
                  font={{ variation: FontVariation.SMALL_SEMI }}
                  padding="small"
                  className={css.orOperator}
                >
                  {getString('ce.common.or')}
                </Text>
              ) : null}
            </Container>
          )
        })}
      </Container>
    </Collapse>
  )
}

export default RuleViewer
