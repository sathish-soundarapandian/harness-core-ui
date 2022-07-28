/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React from 'react'
import { Button } from '@wings-software/uicore'
import { FieldArray, FormikProps } from 'formik'
import { v4 as uuid } from 'uuid'
import { defaultTo, flatMap, get, isEmpty, uniq } from 'lodash-es'
import cx from 'classnames'

import { Color } from '@harness/design-system'
import { Text } from '@harness/uicore'
import { String, useStrings } from 'framework/strings'
import { StageType } from '@pipeline/utils/stageHelpers'
import type { StepMode as Modes } from '@pipeline/utils/stepUtils'

import FailureTypeMultiSelect from './FailureTypeMultiSelect'
import { allowedStrategiesAsPerStep, errorTypesForStages } from './StrategySelection/StrategyConfig'
import StrategySelection from './StrategySelection/StrategySelection'
import { findTabWithErrors, hasItems, handleChangeInStrategies, getTabIntent } from './utils'
import type { AllFailureStrategyConfig } from './utils'
import css from './FailureStrategyPanel.module.scss'

/**
 * https://harness.atlassian.net/wiki/spaces/CDNG/pages/865403111/Failure+Strategy+-+CD+Next+Gen
 *
 * https://harness.atlassian.net/wiki/spaces/CDNG/pages/1046806671/NG+Failure+Strategies+Backend
 */

export interface FailureStrategyPanelProps {
  formikProps: FormikProps<{
    failureStrategies?: AllFailureStrategyConfig[]
  }>
  mode: Modes
  isReadonly: boolean
  stageType?: StageType
}

export default function FailureStrategyPanel(props: FailureStrategyPanelProps): React.ReactElement {
  const {
    formikProps: { values: formValues, submitForm, errors, isSubmitting, setFormikState },
    mode,
    isReadonly,
    stageType = StageType.DEPLOY
  } = props
  const [selectedStrategyNum, setSelectedStrategyNum] = React.useState(Math.max(findTabWithErrors(errors), 0))
  const hasFailureStrategies = hasItems(formValues.failureStrategies)
  const { getString } = useStrings()
  const uids = React.useRef<string[]>([])
  const filterTypes = uniq(
    flatMap(defaultTo(formValues.failureStrategies, []), e => defaultTo(e.onFailure?.errors, []))
  )
  const currentTabHasErrors = !isEmpty(get(errors, `failureStrategies[${selectedStrategyNum}]`))
  const addedAllStratgies = filterTypes.length === errorTypesForStages[stageType].length
  const isAddBtnDisabled = addedAllStratgies || isReadonly || currentTabHasErrors

  async function handleTabChange(n: number): Promise<void> {
    await submitForm()

    // only change tab if current tab has no errors
    /* istanbul ignore else */
    if (isEmpty(get(errors, `failureStrategies[${selectedStrategyNum}]`))) {
      setSelectedStrategyNum(n)
    }
  }

  function handleAdd(push: (obj: any) => void, strategies: AllFailureStrategyConfig[]) {
    return async (): Promise<void> => {
      /* istanbul ignore else */
      if (strategies.length > 0) {
        await submitForm()
      }

      // only allow add if current tab has no errors
      /* istanbul ignore else */
      if (isEmpty(get(errors, `failureStrategies[${selectedStrategyNum}]`))) {
        uids.current.push(uuid())
        push({ onFailure: { errors: [], action: {} } })
        setSelectedStrategyNum(strategies.length)
      }
    }
  }

  function handleRemove(remove: (obj: number) => void) {
    return (): void => {
      uids.current.splice(selectedStrategyNum, 1)
      remove(selectedStrategyNum)
    }
  }

  React.useEffect(() => {
    handleChangeInStrategies({
      formValues,
      selectedStrategyNum,
      setFormikState,
      setSelectedStrategyNum
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues.failureStrategies, selectedStrategyNum])

  // open errored tab
  React.useEffect(() => {
    if (isSubmitting) {
      const tabNum = findTabWithErrors(errors)

      if (tabNum > -1) {
        setSelectedStrategyNum(tabNum)
      }
    }
  }, [isSubmitting, errors])

  return (
    <div data-testid="failure-strategy-panel" className={css.main}>
      <Text color={Color.GREY_700} font={{ size: 'small' }}>
        <String stringID="pipeline.failureStrategies.helpText" />
        <a rel="noreferrer" target="_blank" href={getString('pipeline.failureStrategies.learnMoreLink')}>
          {getString('pipeline.createPipeline.learnMore')}
        </a>
      </Text>
      <div className={css.header}>
        <FieldArray name="failureStrategies">
          {({ push, remove }) => {
            const strategies = defaultTo(formValues.failureStrategies, [])

            return (
              <React.Fragment>
                <div className={css.tabs}>
                  {hasFailureStrategies ? (
                    <ul className={css.stepList}>
                      {strategies.map((_, i) => {
                        // generated uuid if they are not present
                        if (!uids.current[i]) {
                          uids.current[i] = uuid()
                        }

                        const key = uids.current[i]

                        return (
                          <li key={key} className={css.stepListItem}>
                            <Button
                              intent={getTabIntent(i, selectedStrategyNum)}
                              data-selected={i === selectedStrategyNum}
                              onClick={() => handleTabChange(i)}
                              className={css.stepListBtn}
                              data-testid={`failure-strategy-step-${i}`}
                            >
                              {i + 1}
                            </Button>
                          </li>
                        )
                      })}
                    </ul>
                  ) : null}
                  <Button
                    intent="primary"
                    minimal
                    small
                    icon="plus"
                    iconProps={{ size: 12 }}
                    data-testid="add-failure-strategy"
                    onClick={handleAdd(push, strategies)}
                    disabled={isAddBtnDisabled}
                    tooltip={cx({
                      [getString('pipeline.failureStrategies.tabHasErrors')]: currentTabHasErrors,
                      [getString('pipeline.failureStrategies.addedAllStrategies')]:
                        !currentTabHasErrors && addedAllStratgies
                    })}
                  >
                    <String stringID="add" />
                  </Button>
                </div>
                {hasFailureStrategies ? (
                  <Button
                    icon="main-trash"
                    minimal
                    small
                    disabled={isReadonly}
                    onClick={handleRemove(remove)}
                    iconProps={{ size: 12 }}
                    data-testid="remove-failure-strategy"
                  />
                ) : null}
              </React.Fragment>
            )
          }}
        </FieldArray>
      </div>
      {hasFailureStrategies ? (
        <React.Fragment>
          <FailureTypeMultiSelect
            name={`failureStrategies[${selectedStrategyNum}].onFailure.errors`}
            label={getString('pipeline.failureStrategies.onFailureOfType')}
            filterTypes={filterTypes}
            stageType={stageType}
            disabled={isReadonly}
          />
          <StrategySelection
            name={`failureStrategies[${selectedStrategyNum}].onFailure.action`}
            label={getString('pipeline.failureStrategies.performAction')}
            allowedStrategies={allowedStrategiesAsPerStep(stageType)[mode]}
            disabled={isReadonly}
          />
        </React.Fragment>
      ) : null}
    </div>
  )
}
