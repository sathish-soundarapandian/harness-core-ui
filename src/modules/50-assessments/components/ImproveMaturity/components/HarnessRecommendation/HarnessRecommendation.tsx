import { Icon, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import React, { ReactElement } from 'react'
import type { Row } from 'react-table'
import type { QuestionMaturity } from 'services/assessments'
import { StringKeys, useStrings } from 'framework/strings'
import { Module, moduleToModuleNameMapping } from 'framework/types/ModuleName'
import { getModuleIcon } from '@common/utils/utils'
import { ComponentSyle, getRecommendationImage } from './HarnessRecommendation.utils'
import css from './HarnessRecommendation.module.scss'

const HarnessRecommendation = ({ row }: { row: Row<QuestionMaturity> }): ReactElement => {
  const { recommendation } = row.original
  const module = (recommendation?.harnessModule || 'CI').toLocaleLowerCase()
  const { getString } = useStrings()
  return (
    <Layout.Horizontal className={ComponentSyle[module]}>
      <img src={getRecommendationImage(module)} width="20" height="20" alt="" className={css.alignCenter} />
      <Text margin="medium" className={css.text}>
        {getString('assessments.recommendedModule')}
      </Text>
      <Icon name={getModuleIcon(moduleToModuleNameMapping[module as Module])} className={css.alignCenter} size={20} />
      <Text margin="medium" className={css.alignCenter} color={Color.GREY_1000} font={{ weight: 'semi-bold' }}>
        {getString(`assessments.modules.${module}` as StringKeys)}
      </Text>
    </Layout.Horizontal>
  )
}

export default HarnessRecommendation
