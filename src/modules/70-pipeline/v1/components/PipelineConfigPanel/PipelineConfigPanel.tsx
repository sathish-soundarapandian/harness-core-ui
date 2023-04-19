import React, { useCallback } from 'react'
import { Container, FontVariation, Icon, Layout, Text } from '@harness/uicore'
import css from './PipelineConfigPanel.module.scss'
import { MainConfigOptions, PipelineConfigOptionInterface } from './PipelineConfigOptions'

interface PipelineConfigPanelInterface {
  height?: React.CSSProperties['height']
}

export function PipelineConfigPanel(props: PipelineConfigPanelInterface): React.ReactElement {
  const { height } = props

  const renderPipelineConfigOption = useCallback((configOption: PipelineConfigOptionInterface): React.ReactElement => {
    const { name, iconProps, description } = configOption
    return (
      <Layout.Horizontal
        key={name}
        padding={{ top: 'medium', bottom: 'medium' }}
        flex={{ justifyContent: 'space-between' }}
        className={css.configOption}
      >
        <Layout.Horizontal flex>
          <Icon {...iconProps} />
          <Layout.Vertical spacing="xsmall" padding={{ left: 'large', right: 'large' }}>
            <Text font={{ variation: FontVariation.BODY1 }}>{name}</Text>
            <Text>{description}</Text>
          </Layout.Vertical>
        </Layout.Horizontal>
        <Icon name="chevron-right" />
      </Layout.Horizontal>
    )
  }, [])

  return (
    <Layout.Vertical style={{ height }} width="100%">
      <Container padding={{ left: 'xlarge', top: 'medium', bottom: 'medium', right: 'xlarge' }} className={css.header}>
        <Text font={{ variation: FontVariation.H4 }}>Pipeline Configuration</Text>
      </Container>
      <Layout.Vertical padding={{ left: 'xxlarge', right: 'xxlarge', top: 'xxxlarge' }}>
        {MainConfigOptions.map((option: PipelineConfigOptionInterface) => renderPipelineConfigOption(option))}
      </Layout.Vertical>
    </Layout.Vertical>
  )
}
