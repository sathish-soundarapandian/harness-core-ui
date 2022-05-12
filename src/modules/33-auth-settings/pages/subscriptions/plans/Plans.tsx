/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { Color } from '@harness/design-system'
import { Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { FetchPlansQuery } from 'services/common/services'
import type { ModuleName } from 'framework/types/ModuleName'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import PlansPanel from './PlansPanel'
import FeatureComparison from './FeatureComparison'
import css from './Plans.module.scss'

type plansType = 'ciSaasPlans' | 'ffPlans' | 'cdPlans' | 'ccPlans'
type captionType = 'ciSaasFeatureCaption' | 'ffFeatureCaption' | 'cdFeatureCaption' | 'ccFeatureCaption'
type groupType = 'ciSaasFeatureGroup' | 'ffFeatureGroup' | 'cdFeatureGroup' | 'ccFeatureGroup'
interface PlansProps {
  module: ModuleName
  plans?: NonNullable<FetchPlansQuery['pricing']>[plansType]
  featureCaption?: NonNullable<FetchPlansQuery['pricing']>[captionType]
  featureGroup?: NonNullable<FetchPlansQuery['pricing']>[groupType]
}

const Plans: React.FC<PlansProps> = ({ plans, featureCaption, featureGroup, module }) => {
  const moduleNameMap: Record<string, string> = {
    cd: 'cd',
    ce: 'cc',
    cf: 'ff',
    ci: 'ci'
  }
  const { trackPage } = useTelemetry()
  useEffect(() => {
    trackPage(PAGE_NAME.PlanPage, { module })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const moduleParam = moduleNameMap[module.toLowerCase()]
  const { getString } = useStrings()
  return (
    <Layout.Vertical className={css.plans} spacing="large">
      <PlansPanel plans={plans} module={module} />
      <FeatureComparison featureCaption={featureCaption} featureGroup={featureGroup} module={module.toLowerCase()} />
      <a target="_blank" href={`https://next.harness.io/pricing?module=${moduleParam}`} rel="noreferrer">
        <Text
          color={Color.PRIMARY_6}
          rightIcon="main-share"
          rightIconProps={{ color: Color.PRIMARY_6 }}
          flex={{ align: 'center-center' }}
        >
          {getString('common.plans.faq')}
        </Text>
      </a>
    </Layout.Vertical>
  )
}

export default Plans
