import React from 'react'
import { Container } from '@harness/uicore'

interface PipelineConfigPanelInterface {
  height?: React.CSSProperties['height']
}

export function PipelineConfigPanel(props: PipelineConfigPanelInterface): React.ReactElement {
  const { height } = props
  return <Container style={{ height }}></Container>
}
