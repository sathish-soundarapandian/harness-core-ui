import React, { useCallback, useState } from 'react'
import { Button, ButtonVariation, Container, FontVariation, Icon, Layout, Text } from '@harness/uicore'
import css from './PipelineConfigPanel.module.scss'
import { AdditionalConfigOptions, MainConfigOptions, PipelineConfigOptionInterface } from './PipelineConfigOptions'

interface PipelineConfigPanelInterface {
  height?: React.CSSProperties['height']
}

enum PipelineConfigPanelView {
  Options = 'OPTIONS',
  ConfigureOption = 'CONFIGURE_OPTION'
}

export function PipelineConfigPanel(props: PipelineConfigPanelInterface): React.ReactElement {
  const { height } = props
  const [showMoreOptions, setShowMoreOptions] = useState<boolean>(false)
  const [selectedConfigOption, setSelectedConfigOption] = useState<PipelineConfigOptionInterface>()
  const [pipelineConfigPanelView, setPipelineConfigPanelView] = useState<PipelineConfigPanelView>(
    PipelineConfigPanelView.Options
  )

  const onSelectConfigOption = useCallback((selectedConfigOption: PipelineConfigOptionInterface): void => {
    setSelectedConfigOption(selectedConfigOption)
    setPipelineConfigPanelView(PipelineConfigPanelView.ConfigureOption)
  }, [])

  const renderPipelineConfigOption = useCallback((configOption: PipelineConfigOptionInterface): React.ReactElement => {
    const { label, iconProps, description } = configOption
    return (
      <Layout.Horizontal
        key={label}
        padding={{ top: 'medium', bottom: 'medium' }}
        flex={{ justifyContent: 'space-between' }}
        className={css.configOption}
        onClick={() => onSelectConfigOption(configOption)}
      >
        <Layout.Horizontal flex>
          <Icon {...iconProps} />
          <Layout.Vertical spacing="xsmall" padding={{ left: 'large', right: 'large' }}>
            <Text font={{ variation: FontVariation.BODY1 }}>{label}</Text>
            <Text>{description}</Text>
          </Layout.Vertical>
        </Layout.Horizontal>
        <Icon name="chevron-right" />
      </Layout.Horizontal>
    )
  }, [])

  const renderPipelineConfigOptions = useCallback((): React.ReactElement => {
    return (
      <>
        <Container
          padding={{ left: 'xlarge', top: 'medium', bottom: 'medium', right: 'xlarge' }}
          className={css.header}
        >
          <Text font={{ variation: FontVariation.H4 }}>Pipeline Configuration</Text>
        </Container>
        <Layout.Vertical padding={{ left: 'xxlarge', right: 'xxlarge', top: 'xxxlarge' }}>
          {(showMoreOptions ? [...MainConfigOptions, ...AdditionalConfigOptions] : MainConfigOptions).map(
            (option: PipelineConfigOptionInterface) => renderPipelineConfigOption(option)
          )}
        </Layout.Vertical>
        {showMoreOptions ? null : (
          <Container
            padding={{ left: 'xlarge', top: 'small', bottom: 'medium', right: 'xlarge' }}
            flex={{ justifyContent: 'center' }}
          >
            <Button
              text={'SEE MORE OPTIONS'}
              variation={ButtonVariation.LINK}
              onClick={() => setShowMoreOptions(true)}
            />
          </Container>
        )}
      </>
    )
  }, [showMoreOptions])

  const renderPipelineConfigOptionDetails = useCallback((): React.ReactElement => {
    return <>{selectedConfigOption?.label}</>
  }, [selectedConfigOption])

  const renderPipelineConfigPanel = useCallback((): React.ReactElement => {
    switch (pipelineConfigPanelView) {
      case PipelineConfigPanelView.Options:
        return renderPipelineConfigOptions()
      case PipelineConfigPanelView.ConfigureOption:
        return renderPipelineConfigOptionDetails()
      default:
        return <></>
    }
  }, [showMoreOptions, pipelineConfigPanelView])

  return (
    <Layout.Vertical style={{ height }} width="100%">
      {renderPipelineConfigPanel()}
    </Layout.Vertical>
  )
}
