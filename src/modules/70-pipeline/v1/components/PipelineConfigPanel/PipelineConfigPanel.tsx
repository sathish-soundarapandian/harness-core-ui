import React, { useCallback, useState } from 'react'
import { capitalize } from 'lodash-es'
import { Button, ButtonVariation, Container, FontVariation, Icon, Layout, Text } from '@harness/uicore'
import {
  ConfigOptionsMapWithAdditionalOptions,
  MainConfigOptionsMap,
  PipelineConfigOptionInterface,
  StudioEntity
} from './PipelineConfigOptions'
import css from './PipelineConfigPanel.module.scss'

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
  const [selectedConfigOption, setSelectedConfigOption] =
    useState<{ entity: StudioEntity; entityDetails: PipelineConfigOptionInterface }>()
  const [pipelineConfigPanelView, setPipelineConfigPanelView] = useState<PipelineConfigPanelView>(
    PipelineConfigPanelView.Options
  )

  const onSelectConfigOption = useCallback(
    (entity: StudioEntity, selectedConfigOption: PipelineConfigOptionInterface): void => {
      setSelectedConfigOption({ entity, entityDetails: selectedConfigOption })
      setPipelineConfigPanelView(PipelineConfigPanelView.ConfigureOption)
    },
    []
  )

  const renderPipelineConfigOption = useCallback(
    (entity: StudioEntity, configOption: PipelineConfigOptionInterface): React.ReactElement => {
      const { label, iconProps, description } = configOption
      return (
        <Layout.Horizontal
          key={label}
          padding={{ top: 'medium', bottom: 'medium' }}
          flex={{ justifyContent: 'space-between' }}
          className={css.configOption}
          onClick={() => onSelectConfigOption(entity, configOption)}
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
    },
    []
  )

  const renderPipelineConfigOptions = useCallback((): React.ReactElement => {
    const configOptionsMap = showMoreOptions ? ConfigOptionsMapWithAdditionalOptions : MainConfigOptionsMap
    const renderElms: React.ReactElement[] = []
    configOptionsMap.forEach((value: PipelineConfigOptionInterface, key: StudioEntity) => {
      renderElms.push(renderPipelineConfigOption(key, value))
    })
    return (
      <>
        <Layout.Vertical padding={{ left: 'xxlarge', right: 'xxlarge', top: 'xxxlarge' }}>{renderElms}</Layout.Vertical>
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
    return <>{selectedConfigOption?.entity}</>
  }, [selectedConfigOption])

  const renderPipelineConfigPanelHeader = useCallback((): React.ReactElement => {
    return (
      <Text font={{ variation: FontVariation.H4 }}>
        {selectedConfigOption ? `Select ${capitalize(selectedConfigOption.entity)} Type` : 'Pipeline Configuration'}
      </Text>
    )
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
      <Container padding={{ left: 'xlarge', top: 'medium', bottom: 'medium', right: 'xlarge' }} className={css.header}>
        {renderPipelineConfigPanelHeader()}
      </Container>
      {renderPipelineConfigPanel()}
    </Layout.Vertical>
  )
}
