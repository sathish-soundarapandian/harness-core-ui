import React, { useCallback, useState } from 'react'
import { capitalize, isEmpty } from 'lodash-es'
import { Breadcrumbs, IBreadcrumbProps } from '@blueprintjs/core'
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
  const [breadCrumbs, setBreadCrumbs] = useState<IBreadcrumbProps[]>([
    {
      text: capitalize(StudioEntity.Pipeline),
      onClick: () => {
        setSelectedConfigOption(undefined)
        setPipelineConfigPanelView(PipelineConfigPanelView.Options)
      }
    }
  ])

  const updateBreadCrumbs = useCallback(
    ({
      entity: selectedEntity,
      entityDetails: selectedEntityDetails
    }: {
      entity: StudioEntity
      entityDetails: PipelineConfigOptionInterface
    }): void => {
      const { label, drillDown } = selectedEntityDetails || {}
      const { hasSubTypes } = drillDown || {}
      const breadCrumbLabel = hasSubTypes ? label : ''
      setBreadCrumbs((existingBreadCrumbs: IBreadcrumbProps[]) => {
        if (!existingBreadCrumbs.map((item: IBreadcrumbProps) => item.text).includes(breadCrumbLabel)) {
          return [
            ...existingBreadCrumbs,
            {
              text: breadCrumbLabel,
              onClick: () => {
                setSelectedConfigOption({
                  entity: selectedEntity,
                  entityDetails: selectedEntityDetails
                })
                setPipelineConfigPanelView(
                  selectedEntity === StudioEntity.Pipeline
                    ? PipelineConfigPanelView.Options
                    : PipelineConfigPanelView.ConfigureOption
                )
              }
            }
          ]
        }
        return existingBreadCrumbs
      })
    },
    [breadCrumbs]
  )

  const onSelectConfigOption = useCallback(
    (entity: StudioEntity, selectedConfigOption: PipelineConfigOptionInterface): void => {
      setSelectedConfigOption({ entity, entityDetails: selectedConfigOption })
      setPipelineConfigPanelView(PipelineConfigPanelView.ConfigureOption)
      updateBreadCrumbs({ entity, entityDetails: selectedConfigOption })
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
          <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} width="90%">
            <Icon {...iconProps} />
            <Layout.Vertical spacing="xsmall" padding={{ left: 'large', right: 'large' }} width="100%">
              <Text font={{ variation: FontVariation.BODY1 }}>{label}</Text>
              <Text lineClamp={1}>{description}</Text>
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
        <Layout.Vertical padding={{ left: 'xxlarge', right: 'xxlarge', top: 'xlarge' }}>{renderElms}</Layout.Vertical>
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
    const { hasSubTypes, subTypes, nodeView } = selectedConfigOption?.entityDetails?.drillDown || {}
    return hasSubTypes && subTypes && !isEmpty(subTypes) ? (
      <Layout.Vertical padding={{ left: 'xxlarge', right: 'xxlarge', top: 'xlarge' }}>
        {subTypes.map((subOption: PipelineConfigOptionInterface) =>
          renderPipelineConfigOption(StudioEntity.Stage, subOption)
        )}
      </Layout.Vertical>
    ) : (
      <Layout.Vertical spacing="xsmall">
        {nodeView}
        <Layout.Horizontal padding={{ left: 'xxlarge', right: 'xxlarge' }} spacing="medium">
          <Button text="Add" variation={ButtonVariation.PRIMARY} />
          <Button text="Cancel" variation={ButtonVariation.SECONDARY} />
        </Layout.Horizontal>
      </Layout.Vertical>
    )
  }, [selectedConfigOption])

  const renderPipelineConfigPanelHeader = useCallback((): React.ReactElement => {
    const { entity, entityDetails } = selectedConfigOption || {}
    const { label, drillDown } = entityDetails || {}
    const { hasSubTypes } = drillDown || {}
    return selectedConfigOption ? (
      <Layout.Vertical>
        <Breadcrumbs items={[...breadCrumbs]} />
        {hasSubTypes ? (
          <Text font={{ variation: FontVariation.H4 }}>{`Select ${capitalize(entity)} Type`}</Text>
        ) : (
          <Text font={{ variation: FontVariation.H4 }}>{label}</Text>
        )}
      </Layout.Vertical>
    ) : (
      <Text font={{ variation: FontVariation.H4 }}>Pipeline Configuration</Text>
    )
  }, [selectedConfigOption, breadCrumbs])

  const renderPipelineConfigPanel = useCallback((): React.ReactElement => {
    switch (pipelineConfigPanelView) {
      case PipelineConfigPanelView.Options:
        return renderPipelineConfigOptions()
      case PipelineConfigPanelView.ConfigureOption:
        return renderPipelineConfigOptionDetails()
      default:
        return <></>
    }
  }, [showMoreOptions, pipelineConfigPanelView, selectedConfigOption])

  return (
    <Layout.Vertical style={{ height }} width="100%">
      <Container padding={{ left: 'xlarge', top: 'medium', bottom: 'medium', right: 'xlarge' }} className={css.header}>
        {renderPipelineConfigPanelHeader()}
      </Container>
      {renderPipelineConfigPanel()}
    </Layout.Vertical>
  )
}
