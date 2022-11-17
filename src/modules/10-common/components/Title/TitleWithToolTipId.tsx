import React from 'react'
import { Text, TextProps } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
interface ToolTipTitleProps {
  title: string
  toolTipId?: string
  textProps?: TextProps
}
export const TitleWithToolTipId: React.FC<ToolTipTitleProps> = ({ title, toolTipId, textProps = {} }) => {
  return (
    <Text font={{ variation: FontVariation.H4 }} tooltipProps={{ dataTooltipId: toolTipId }} {...textProps}>
      {title}
    </Text>
  )
}
