import React, { useCallback, useEffect, useState } from 'react'
import { capitalize, get, isEmpty } from 'lodash-es'
import { Breadcrumbs, IBreadcrumbProps } from '@blueprintjs/core'
import { Button, ButtonVariation, Container, FontVariation, Icon, Layout, Text, Formik } from '@harness/uicore'
import type { EntitySelectionFromYAML } from '@common/interfaces/YAMLBuilderProps'
import { PipelineAtomicEntity, PipelineEntityGroupings } from '@common/components/YAMLBuilder/YAMLBuilderConstants'
import {
  ConfigOptionsMapWithAdditionalOptions,
  MainConfigOptionsMap,
  PipelineConfigOptionInterface,
  Step,
  PipelineEntitySubType
} from './PipelineConfigOptions'
import css from './PipelineConfigPanel.module.scss'

interface PipelineConfigPanelInterface {
  height?: React.CSSProperties['height']
  entitySelectedFromYAML?: EntitySelectionFromYAML
  onAddUpdateEntity?: (values: Record<string, any>) => void
}

enum PipelineConfigPanelView {
  Options = 'OPTIONS',
  ConfigureOption = 'CONFIGURE_OPTION'
}

export function PipelineConfigPanel(props: PipelineConfigPanelInterface): React.ReactElement {
  const { height, entitySelectedFromYAML } = props
  const { entityType, entityAsObj } = entitySelectedFromYAML || {}
  const [showMoreOptions, setShowMoreOptions] = useState<boolean>(false)
  const [pipelineEntity, setPipelineEntity] = useState<PipelineAtomicEntity | PipelineEntityGroupings>()
  const [pipelineEntitySubType, setPipelineEntitySubType] = useState<PipelineEntitySubType | PipelineAtomicEntity>()
  const [pipelineConfigOption, setPipelineConfigOption] = useState<PipelineConfigOptionInterface>()
  const [pipelineConfigPanelView, setPipelineConfigPanelView] = useState<PipelineConfigPanelView>(
    PipelineConfigPanelView.Options
  )
  const initialBreadCrumbs = [
    {
      text: capitalize(PipelineAtomicEntity.Pipeline),
      onClick: () => {
        resetPipelineConfigPanel()
      }
    }
  ]
  const [breadCrumbs, setBreadCrumbs] = useState<IBreadcrumbProps[]>(initialBreadCrumbs)

  useEffect(() => {
    if (entityType) {
      const configOptionForEntityType = ConfigOptionsMapWithAdditionalOptions.get(entityType)
      if (configOptionForEntityType) {
        setPipelineEntity(entityType)
        setPipelineConfigPanelView(PipelineConfigPanelView.ConfigureOption)
        if (configOptionForEntityType.drillDown.hasSubTypes) {
          const matchingSubTypeConfigOption = configOptionForEntityType.drillDown.subTypes?.find(
            (
              option: PipelineConfigOptionInterface & {
                type: PipelineEntitySubType | PipelineAtomicEntity
              }
            ) => option.type.toLowerCase() === get(entityAsObj, 'type')?.toLowerCase()
          )
          setPipelineConfigOption(matchingSubTypeConfigOption)
          setPipelineEntitySubType(matchingSubTypeConfigOption?.type)
        } else {
          setPipelineConfigOption(configOptionForEntityType)
        }
        updateBreadCrumbs(entityType, configOptionForEntityType)
      }
    }
  }, [entityType, entityAsObj])

  const resetPipelineConfigPanel = useCallback(() => {
    setPipelineEntity(undefined)
    setPipelineEntitySubType(undefined)
    setPipelineConfigOption(undefined)
    setPipelineConfigPanelView(PipelineConfigPanelView.Options)
    resetBreadCrumbs()
  }, [])

  const resetBreadCrumbs = useCallback((): void => {
    setBreadCrumbs(initialBreadCrumbs)
  }, [])

  const updateBreadCrumbs = useCallback(
    (
      selectedEntity: PipelineAtomicEntity | PipelineEntityGroupings,
      selectedConfigOption: PipelineConfigOptionInterface
    ): void => {
      const { label, drillDown } = selectedConfigOption || {}
      const { hasSubTypes } = drillDown || {}
      const breadCrumbLabel = hasSubTypes ? label : ''
      setBreadCrumbs((existingBreadCrumbs: IBreadcrumbProps[]) => {
        if (!existingBreadCrumbs.map((item: IBreadcrumbProps) => item.text).includes(breadCrumbLabel)) {
          return [
            ...existingBreadCrumbs,
            {
              text: breadCrumbLabel,
              onClick: () => {
                setPipelineEntity(selectedEntity)
                setPipelineConfigOption(selectedConfigOption)
                if (selectedEntity === PipelineAtomicEntity.Pipeline) {
                  resetBreadCrumbs()
                  setPipelineConfigPanelView(PipelineConfigPanelView.Options)
                } else {
                  setPipelineConfigPanelView(PipelineConfigPanelView.ConfigureOption)
                }
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
    (
      selectedEntity: PipelineAtomicEntity | PipelineEntityGroupings,
      selectedConfigOption: PipelineConfigOptionInterface
    ): void => {
      setPipelineEntity(selectedEntity)
      setPipelineConfigOption(selectedConfigOption)
      setPipelineConfigPanelView(PipelineConfigPanelView.ConfigureOption)
      updateBreadCrumbs(selectedEntity, selectedConfigOption)
    },
    []
  )

  const renderPipelineConfigOption = useCallback(
    (
      entity: PipelineAtomicEntity | PipelineEntityGroupings,
      configOption: PipelineConfigOptionInterface
    ): React.ReactElement => {
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
    configOptionsMap.forEach(
      (value: PipelineConfigOptionInterface, key: PipelineAtomicEntity | PipelineEntityGroupings) => {
        renderElms.push(renderPipelineConfigOption(key, value))
      }
    )
    return (
      <>
        <Layout.Vertical padding={{ left: 'xxlarge', right: 'xxlarge', top: 'medium', bottom: 'small' }}>
          {renderElms}
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

  const getFormikInitialValues = useCallback((): Record<string, any> => {
    switch (pipelineEntity) {
      case PipelineAtomicEntity.Stage:
        return {}
      case PipelineAtomicEntity.Step: {
        switch (pipelineEntitySubType) {
          case Step.Run:
            return get(entityAsObj, 'spec')
          case Step.Plugin:
            return { uses: get(entityAsObj, 'spec.uses'), ...get(entityAsObj, 'spec.with') }
        }
      }
    }
    return {}
  }, [pipelineEntity, pipelineEntitySubType, entityAsObj])

  const renderPipelineConfigOptionDetails = useCallback((): React.ReactElement => {
    const { hasSubTypes, subTypes, nodeView } = pipelineConfigOption?.drillDown || {}
    const formInitialValues = getFormikInitialValues()
    return pipelineEntity && hasSubTypes && subTypes && !isEmpty(subTypes) ? (
      <Layout.Vertical padding={{ left: 'xxlarge', right: 'xxlarge', top: 'xlarge' }}>
        {subTypes.map((subOption: PipelineConfigOptionInterface) =>
          renderPipelineConfigOption(pipelineEntity, subOption)
        )}
      </Layout.Vertical>
    ) : (
      <Formik<any>
        initialValues={formInitialValues}
        formName="config-details-form"
        onSubmit={() => {}}
        enableReinitialize={true}
      >
        <Layout.Vertical spacing="xsmall">
          {nodeView}
          <Layout.Horizontal padding={{ left: 'xxlarge', right: 'xxlarge' }} spacing="medium">
            <Button
              text={isEmpty(formInitialValues) ? 'Add' : 'Update'}
              variation={ButtonVariation.PRIMARY}
              type="submit"
            />
            <Button text="Cancel" variation={ButtonVariation.SECONDARY} onClick={() => resetPipelineConfigPanel()} />
          </Layout.Horizontal>
        </Layout.Vertical>
      </Formik>
    )
  }, [pipelineConfigOption, pipelineEntity, pipelineEntitySubType, entityAsObj])

  const renderPipelineConfigPanelHeader = useCallback((): React.ReactElement => {
    const { label, drillDown } = pipelineConfigOption || {}
    const { hasSubTypes } = drillDown || {}
    return pipelineConfigOption ? (
      <Layout.Vertical>
        <Breadcrumbs items={[...breadCrumbs]} />
        {hasSubTypes ? (
          <Text font={{ variation: FontVariation.H4 }}>{`Select ${capitalize(pipelineEntity)} Type`}</Text>
        ) : (
          <Text font={{ variation: FontVariation.H4 }}>{label}</Text>
        )}
      </Layout.Vertical>
    ) : (
      <Text font={{ variation: FontVariation.H4 }}>Pipeline Configuration</Text>
    )
  }, [pipelineEntity, pipelineConfigOption, breadCrumbs])

  const renderPipelineConfigPanel = useCallback((): React.ReactElement => {
    switch (pipelineConfigPanelView) {
      case PipelineConfigPanelView.Options:
        return renderPipelineConfigOptions()
      case PipelineConfigPanelView.ConfigureOption:
        return renderPipelineConfigOptionDetails()
      default:
        return <></>
    }
  }, [showMoreOptions, pipelineConfigPanelView, pipelineConfigOption])

  return (
    <Layout.Vertical style={{ height }} width="100%">
      <Container padding={{ left: 'xlarge', top: 'medium', bottom: 'medium', right: 'xlarge' }} className={css.header}>
        {renderPipelineConfigPanelHeader()}
      </Container>
      {renderPipelineConfigPanel()}
    </Layout.Vertical>
  )
}
