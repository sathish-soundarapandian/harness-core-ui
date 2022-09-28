/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Color, Container, FontVariation, Layout, Text } from '@harness/uicore'
import RangeSlider from '@ce/common/RangeSlider/RangeSlider'
import { useStrings } from 'framework/strings'
import { useSetupContext } from './SetupContext'
import css from './Setup.module.scss'

const RECOMMENDED_COVERAGE = 70

const Step1: React.FC = () => {
  const { getString } = useStrings()
  const { setSetupData, setupData } = useSetupContext()
  const [coverage, setCoverage] = useState(setupData?.overallCoverage || RECOMMENDED_COVERAGE)

  useEffect(() => {
    setSetupData?.({ ...setupData, overallCoverage: coverage })
  }, [])

  return (
    <Layout.Vertical spacing={'medium'} className={css.step1Cont}>
      <Text font={{ variation: FontVariation.H4 }}>{getString('ce.commitmentOrchestration.setup.step1.heading')}</Text>
      <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600} className={css.desc}>
        {getString('ce.commitmentOrchestration.setup.step1.description') + ' '}
        <span>{getString('ce.commitmentOrchestration.setup.step1.awsPayerAcs')}</span>
      </Text>
      <Container>
        <div>
          <Text inline font={{ variation: FontVariation.BODY }}>
            {getString('ce.commitmentOrchestration.coverage') + ' '}
          </Text>
          <Text inline>{coverage === RECOMMENDED_COVERAGE ? `(${getString('common.recommended')})` : ''}</Text>
        </div>
        <Text className={css.coverageValue}>{coverage + '%'}</Text>
        <Container className={css.rangeSection}>
          <RangeSlider
            onChange={setCoverage}
            rangeProps={{ value: coverage }}
            onMouseUp={
              /* istanbul ignore next */ val => {
                setSetupData?.({ ...setupData, overallCoverage: val })
              }
            }
          />
        </Container>
        {coverage !== RECOMMENDED_COVERAGE && (
          <Text
            icon="refresh"
            iconProps={{ size: 12, color: Color.PRIMARY_7 }}
            color={Color.PRIMARY_7}
            onClick={() => {
              setCoverage(RECOMMENDED_COVERAGE)
            }}
            className={css.resetText}
          >
            {getString('ce.commitmentOrchestration.setup.step1.resetLabel')}
          </Text>
        )}
      </Container>
    </Layout.Vertical>
  )
}

export default Step1
