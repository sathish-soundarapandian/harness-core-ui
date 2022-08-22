/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Button,
  ButtonVariation,
  Card,
  ConfirmationDialog,
  Container,
  Formik,
  Layout,
  Text,
  useToggleOpen
} from '@harness/uicore'
import { clone, defaultTo, isEqual, noop } from 'lodash-es'
import type { FormikProps } from 'formik'
import { Color, FontVariation } from '@harness/design-system'
import cx from 'classnames'
import { parse } from '@common/utils/YamlHelperMethods'
import type { StrategyConfig } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import {
  getAvailableStrategies,
  LoopingStrategyEnum,
  LoopingStrategy as Strategy
} from '@pipeline/components/PipelineStudio/LoopingStrategy/LoopingStrategyUtils'
import { YamlBuilderMemo } from '@common/components/YAMLBuilder/YamlBuilder'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import type { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { usePipelineSchema } from '../PipelineSchema/PipelineSchemaContext'

import css from './LoopingStrategy.module.scss'

export interface LoopingStrategyProps {
  strategy?: StrategyConfig
  isReadonly?: boolean
  onUpdateStrategy?: (strategy: StrategyConfig) => void
  stepType?: StepType
}

const DOCUMENT_URL = 'https://docs.harness.io/article/i36ibenkq2-step-skip-condition-settings'

const yamlSanityConfig = {
  removeEmptyObject: false,
  removeEmptyString: false,
  removeEmptyArray: false
}
const renderCustomHeader = (): null => null

export function LoopingStrategy({
  strategy = {},
  isReadonly,
  onUpdateStrategy = noop,
  stepType
}: LoopingStrategyProps): React.ReactElement {
  const { getString } = useStrings()
  const { loopingStrategySchema } = usePipelineSchema()
  const [yamlHandler, setYamlHandler] = useState<YamlBuilderHandlerBinding | undefined>()
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
  const timerRef = React.useRef<null | number>(null)
  const onUpdateStrategyRef = React.useRef(onUpdateStrategy)
  const initialSelectedStrategy = Object.keys(defaultTo(strategy, {}))[0] as LoopingStrategyEnum
  const strategyEntries = Object.entries(getAvailableStrategies(stepType)) as [LoopingStrategyEnum, Strategy][]

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
          if (!isEqual(newValues, strategy)) {
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
  }, [yamlHandler, strategy])

  const onChangeStrategy = (newStrategy: LoopingStrategyEnum, formikProps: FormikProps<StrategyConfig>): void => {
    const callback = (): void => {
      const newValues: StrategyConfig = { [newStrategy]: clone(getAvailableStrategies()[newStrategy].defaultValue) }
      formikProps.setValues(newValues)
      onUpdateStrategy(newValues)
      callbackRef.current = null
    }

    if (initialSelectedStrategy) {
      callbackRef.current = callback
      openToggleTypeConfirmation()
    } else {
      callback()
    }
  }

  const onDelete = (formikProps: FormikProps<StrategyConfig>): void => {
    const callback = (): void => {
      formikProps.setValues({})
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

  return (
    <React.Fragment>
      <Formik initialValues={strategy} formName="loopingStrategy" onSubmit={noop}>
        {(formikProps: FormikProps<StrategyConfig>) => {
          const values = defaultTo(formikProps.values, {})
          const selectedStrategy = Object.keys(values)[0] as LoopingStrategyEnum
          const selectedStrategyMetaData = getAvailableStrategies()[selectedStrategy]

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
                        onClick={isReadonly || item.disabled ? noop : () => onChangeStrategy(key, formikProps)}
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
                              onClick={() => onDelete(formikProps)}
                            />
                          </Container>
                        </Layout.Horizontal>
                      </Container>
                      <Container>
                        <YamlBuilderMemo
                          showSnippetSection={false}
                          fileName={''}
                          key={selectedStrategy}
                          entityType={'Pipelines'}
                          bind={setYamlHandler}
                          height="200px"
                          width="100%"
                          schema={/* istanbul ignore next */ loopingStrategySchema?.data?.schema}
                          existingJSON={formikProps.values}
                          renderCustomHeader={renderCustomHeader}
                          yamlSanityConfig={yamlSanityConfig}
                        />
                      </Container>
                    </Layout.Vertical>
                  </Container>
                )}
              </Layout.Vertical>
            </Container>
          )
        }}
      </Formik>
      <ConfirmationDialog
        intent="danger"
        titleText={getString('pipeline.loopingStrategy.deleteModal.title')}
        contentText={getString('pipeline.loopingStrategy.deleteModal.content')}
        confirmButtonText={getString('applyChanges')}
        cancelButtonText={getString('cancel')}
        isOpen={isDeleteConfirmationOpen}
        onClose={handleCloseDeleteConfirmation}
      />
      <ConfirmationDialog
        intent="danger"
        titleText={getString('pipeline.loopingStrategy.toggleTypeModal.title')}
        contentText={getString('pipeline.loopingStrategy.toggleTypeModal.content')}
        confirmButtonText={getString('applyChanges')}
        cancelButtonText={getString('cancel')}
        isOpen={isToggleTypeConfirmationOpen}
        onClose={handleCloseToggleTypeConfirmation}
      />
    </React.Fragment>
  )
}
