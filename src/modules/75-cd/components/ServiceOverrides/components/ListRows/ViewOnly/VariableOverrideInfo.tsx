import React from 'react'
import { Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { labelStringMap } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableUtils'
import type { AllNGVariables } from '@pipeline/utils/types'
import type { RequiredField } from '@common/interfaces/RouteInterfaces'

export default function VariableOverrideInfo({
  name,
  type,
  value
}: RequiredField<AllNGVariables, 'name' | 'type'>): React.ReactElement {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal spacing={'medium'}>
      <Layout.Vertical width={180} height={40} flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('variableNameLabel').toUpperCase()}</Text>
        <Text color={Color.GREY_450}>{name}</Text>
      </Layout.Vertical>
      <Layout.Vertical width={180} height={40} flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('common.variableType').toUpperCase()}</Text>
        <Text color={Color.GREY_450}>{getString(labelStringMap[type])}</Text>
      </Layout.Vertical>
      <Layout.Vertical width={180} height={40} flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('cd.overrideValue').toUpperCase()}</Text>
        <Text color={Color.GREY_450}>{value}</Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}
