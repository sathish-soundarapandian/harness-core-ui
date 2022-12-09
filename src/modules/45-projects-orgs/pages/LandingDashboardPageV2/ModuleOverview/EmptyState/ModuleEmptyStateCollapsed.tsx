import React from 'react'
import { Color, FontVariation } from '@harness/design-system'
import { Text } from '@harness/uicore'
import type { NavModuleName } from '@common/hooks/useNavModuleInfo'
import { ModuleName } from 'framework/types/ModuleName'
import { StringKeys, useStrings } from 'framework/strings'

interface EmptyStateCollapsedView {
  module: NavModuleName
}

const moduleToViewMap: Record<NavModuleName, StringKeys | JSX.Element> = {
  [ModuleName.CD]: 'common.moduleDetails.cd.collapsed.title',
  [ModuleName.CI]: 'common.moduleDetails.ci.collapsed.title',
  [ModuleName.CF]: 'common.moduleDetails.ff.collapsed.title',
  [ModuleName.CHAOS]: 'common.moduleDetails.chaos.collapsed.title',
  [ModuleName.STO]: 'common.moduleDetails.sto.collapsed.title',
  [ModuleName.CE]: 'common.moduleDetails.ce.collapsed.title',
  [ModuleName.CV]: 'common.moduleDetails.slo.collapsed.title',
  [ModuleName.CODE]: 'common.moduleDetails.cd.collapsed.title' // change this
}

const ModuleEmptyStateCollapsed: React.FC<EmptyStateCollapsedView> = ({ module }) => {
  const { getString } = useStrings()
  const view = moduleToViewMap[module]

  if (typeof view !== 'string') {
    return view
  }

  return (
    <Text margin={{ top: 'small' }} color={Color.GREY_600} font={{ variation: FontVariation.SMALL }}>
      {getString(view)}
    </Text>
  )
}

export default ModuleEmptyStateCollapsed
