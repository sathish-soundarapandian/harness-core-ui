import { Color } from '@harness/design-system'
import { Text } from '@harness/uicore'
import React from 'react'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

type SectionHeaderProps = {
  text: keyof StringsMap
}
const SectionHeader = (props: SectionHeaderProps) => {
  const { getString } = useStrings()
  const { text } = props

  return (
    <Text
      style={{ marginBottom: 'var(--spacing-small)' }}
      className={stepCss.inpLabel}
      color={Color.BLACK}
      font={{ size: 'small', weight: 'semi-bold' }}
    >
      {getString(text)}
    </Text>
  )
}

export default SectionHeader
