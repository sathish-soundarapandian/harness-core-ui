import React from 'react'
import cx from 'classnames'
import {
  Button,
  ButtonVariation,
  Card,
  ConfirmationDialog,
  Container,
  Formik,
  FormInput,
  Layout,
  RUNTIME_INPUT_VALUE,
  Text,
  useToggleOpen
} from '@harness/uicore'
import { clone, defaultTo, get, isEqual, noop, set, unset } from 'lodash-es'
import { useFormikContext } from 'formik'
import produce from 'immer'
import { Color, FontVariation } from '@harness/design-system'

import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import { useStrings } from 'framework/strings'
import type { StepOrStepGroupOrTemplateStepData } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import type { StrategyConfig } from 'services/pipeline-ng'
import { parse } from '@common/utils/YamlHelperMethods'
import { isValueRuntimeInput } from '@common/utils/utils'
import { YamlBuilderMemo } from '@common/components/YAMLBuilder/YamlBuilder'

import { usePipelineSchema } from '../PipelineSchema/PipelineSchemaContext'
import type { LoopingStrategy, LoopingStrategyEnum } from './LoopingStrategyUtils';
import { getAvailableStrategies } from './LoopingStrategyUtils'

import css from './LoopingStrategy.module.scss'

const yamlSanityConfig = {
  removeEmptyObject: false,
  removeEmptyString: false,
  removeEmptyArray: false
}
const renderCustomHeader = (): null => null

const DOCUMENT_URL = 'https://docs.harness.io/article/eh4azj73m4'

export interface LoopingStrategyPanelProps {
  isReadonly?: boolean
  onUpdateStrategy?: (strategy: StrategyConfig) => void
  step?: StepOrStepGroupOrTemplateStepData
  path: string
}

export function LoopingStrategyPanel(props: LoopingStrategyPanelProps): React.ReactElement {
  const { isReadonly, onUpdateStrategy = noop, step, path } = props
  const { loopingStrategySchema } = usePipelineSchema()
  const { getString } = useStrings()
  const formik = useFormikContext()

  const [yamlHandler, setYamlHandler] = React.useState<YamlBuilderHandlerBinding | undefined>()
  const callbackRef = React.useRef<(() => void) | null>(null)
  const {
    isOpen: isDeleteConfirmationOpen,
    open: openDeleteConfirmation,
    close: closeDeleteConfirmation
  } = useToggleOpen()
  const {
    isOpen: isToggleTypeConfirmationOpen,
    open: openToggleTypeConfirmation,
    close: closeToggleTypeConfirmation
  } = useToggleOpen()
  const availableStrategies = React.useMemo(() => {
    return getAvailableStrategies(step)
  }, [step])
  const strategyEntries = React.useMemo(
    () => Object.entries(availableStrategies) as [LoopingStrategyEnum, LoopingStrategy][],
    [availableStrategies]
  )
  const onUpdateStrategyRef = React.useRef(onUpdateStrategy)
  const timerRef = React.useRef<null | number>(null)
  const values = get(formik.values, path, {})
  const selectedStrategy = Object.keys(values)[0] as LoopingStrategyEnum
  const selectedStrategyMetaData = availableStrategies[selectedStrategy]

  React.useEffect(() => {
    onUpdateStrategyRef.current = onUpdateStrategy
  }, [onUpdateStrategy])

  React.useEffect(() => {
    if (yamlHandler) {
      timerRef.current = window.setInterval(() => {
        try {
          const newValues: StrategyConfig = parse(
            defaultTo(/* istanbul ignore next */ yamlHandler?.getLatestYaml(), '')
          )
          // only update when not equal to avoid frequent re-renders
          if (!isEqual(newValues, values)) {
            onUpdateStrategyRef.current(newValues)
          }
        } catch (_e) {
          // this catch intentionally left empty
        }
      }, 1000)
    }

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [yamlHandler, values])

  const onChangeStrategy = (newStrategy: LoopingStrategyEnum): void => {
    const callback = (): void => {
      const newValues: StrategyConfig = { [newStrategy]: clone(availableStrategies[newStrategy].defaultValue) }
      formik.setValues(
        produce(formik.values, (draft: any) => {
          set(draft, path, newValues)
        })
      )
      onUpdateStrategy(newValues)
      callbackRef.current = null
    }

    if (selectedStrategy) {
      callbackRef.current = callback
      openToggleTypeConfirmation()
    } else {
      callback()
    }
  }

  const onDelete = (): void => {
    const callback = (): void => {
      formik.setValues(
        produce(formik.values, (draft: any) => {
          unset(draft, path)
        })
      )
      onUpdateStrategy({})
    }
    callbackRef.current = callback
    openDeleteConfirmation()
  }

  const handleCloseDeleteConfirmation = (confirm: boolean): void => {
    if (confirm) {
      /* istanbul ignore next */
      callbackRef.current?.()
    } else {
      callbackRef.current = null
    }
    closeDeleteConfirmation()
  }

  const handleCloseToggleTypeConfirmation = (confirm: boolean): void => {
    if (confirm) {
      /* istanbul ignore next */
      callbackRef.current?.()
    } else {
      callbackRef.current = null
    }
    closeToggleTypeConfirmation()
  }

  if (isValueRuntimeInput(values as any)) {
    return (
      <Container className={css.mainContainer}>
        <Formik initialValues={{ strategy: RUNTIME_INPUT_VALUE }} formName="loopingStrategy" onSubmit={noop}>
          <Text color={Color.GREY_700} font={{ size: 'small' }}>
            {getString('pipeline.loopingStrategy.subTitle', { maxCount: strategyEntries.length })}{' '}
            <a rel="noreferrer" target="_blank" href={DOCUMENT_URL}>
              {getString('pipeline.loopingStrategy.learnMore')}
            </a>
          </Text>
          <FormInput.Text name="strategy" className={css.runtimeInput} disabled />
        </Formik>
      </Container>
    )
  }

  return (
    <Container className={css.mainContainer}>
      <Layout.Vertical spacing={'medium'}>
        <Text color={Color.GREY_700} font={{ size: 'small' }}>
          {getString('pipeline.loopingStrategy.subTitle', { maxCount: strategyEntries.length })}{' '}
          <a rel="noreferrer" target="_blank" href={DOCUMENT_URL}>
            {getString('pipeline.loopingStrategy.learnMore')}
          </a>
        </Text>
        <Container>
          <Layout.Horizontal
            padding={{ top: 'large' }}
            border={{ top: true, color: Color.GREY_200 }}
            spacing={'medium'}
          >
            {strategyEntries.map(([key, item]) => (
              <Card
                key={key}
                interactive={!isReadonly && !item.disabled}
                className={cx(css.strategyAnchor, {
                  [css.disabled]: defaultTo(isReadonly, item.disabled),
                  [css.selected]: selectedStrategy === key
                })}
                selected={selectedStrategy === key}
                cornerSelected={selectedStrategy === key}
                onClick={isReadonly || item.disabled ? noop : () => onChangeStrategy(key)}
                data-testid={key}
              >
                <Text font={{ variation: FontVariation.BODY }} color={Color.PRIMARY_7}>
                  {getString(item.label)}
                </Text>
              </Card>
            ))}
          </Layout.Horizontal>
        </Container>
        {selectedStrategyMetaData && (
          <Container border={{ radius: 4 }} padding={'medium'}>
            <Layout.Vertical spacing={'medium'}>
              <Container>
                <Layout.Horizontal flex={{ alignItems: 'center' }}>
                  <Container style={{ flexGrow: 1 }}>
                    <Layout.Vertical>
                      <Text font={{ variation: FontVariation.BODY, weight: 'semi-bold' }}>
                        {getString(selectedStrategyMetaData.label)}
                      </Text>
                      <Text color={Color.GREY_700} font={{ size: 'small' }}>
                        {getString(selectedStrategyMetaData.helperText)}{' '}
                        <a rel="noreferrer" target="_blank" href={selectedStrategyMetaData.helperLink}>
                          {getString('learnMore')}
                        </a>
                      </Text>
                    </Layout.Vertical>
                  </Container>
                  <Container>
                    <Button
                      variation={ButtonVariation.ICON}
                      icon={'main-trash'}
                      data-testid="delete"
                      disabled={isReadonly}
                      onClick={onDelete}
                    />
                  </Container>
                </Layout.Horizontal>
              </Container>
              <Container>
                <YamlBuilderMemo
                  fileName={''}
                  key={selectedStrategy}
                  entityType={'Pipelines'}
                  bind={setYamlHandler}
                  isReadOnlyMode={isReadonly}
                  height="200px"
                  width="100%"
                  schema={loopingStrategySchema?.data?.schema}
                  existingJSON={values}
                  renderCustomHeader={renderCustomHeader}
                  yamlSanityConfig={yamlSanityConfig}
                />
              </Container>
            </Layout.Vertical>
          </Container>
        )}
      </Layout.Vertical>
      <ConfirmationDialog
        intent="danger"
        titleText={getString('pipeline.loopingStrategy.deleteModal.title')}
        contentText={getString('pipeline.loopingStrategy.deleteModal.content')}
        confirmButtonText={getString('common.remove')}
        cancelButtonText={getString('cancel')}
        isOpen={isDeleteConfirmationOpen}
        onClose={handleCloseDeleteConfirmation}
      />
      <ConfirmationDialog
        intent="danger"
        titleText={getString('pipeline.loopingStrategy.toggleTypeModal.title')}
        contentText={getString('pipeline.loopingStrategy.toggleTypeModal.content')}
        confirmButtonText={getString('pipeline.loopingStrategy.toggleTypeModal.switch')}
        cancelButtonText={getString('cancel')}
        isOpen={isToggleTypeConfirmationOpen}
        onClose={handleCloseToggleTypeConfirmation}
      />
    </Container>
  )
}
