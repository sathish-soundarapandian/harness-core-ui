/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { SetStateAction, Dispatch } from 'react'
import { Heading, VisualYamlSelectedView as SelectedView, VisualYamlToggle } from '@harness/uicore'
import cx from 'classnames'
import { parse } from 'yaml'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import { useStrings } from 'framework/strings'
import css from './Wizard.module.scss'

interface WizardHeaderProps {
  yamlHandler?: YamlBuilderHandlerBinding
  showError: (str: string) => void
  leftNav?: ({ selectedView }: { selectedView: SelectedView }) => JSX.Element
  selectedView: SelectedView
  rightNav?: JSX.Element
  showVisualYaml: boolean
  handleModeSwitch?: (mode: SelectedView, yamlHandler?: YamlBuilderHandlerBinding) => void
  setSelectedView: Dispatch<SetStateAction<SelectedView>>
  positionInHeader?: boolean
  wizardLabel?: string
}

export const WizardHeader = ({
  yamlHandler,
  showError,
  leftNav,
  selectedView,
  rightNav,
  showVisualYaml,
  handleModeSwitch,
  setSelectedView,
  positionInHeader,
  wizardLabel
}: WizardHeaderProps): JSX.Element => {
  const { getString } = useStrings()

  if (leftNav || showVisualYaml || rightNav) {
    const title = leftNav ? (
      <div className={css.sideItems}>{leftNav({ selectedView })}</div>
    ) : (
      <Heading className={css.sideItems} padding="small" level={2}>
        {wizardLabel}
      </Heading>
    )

    return (
      <section className={css.extendedNav}>
        {title}
        {showVisualYaml ? (
          <VisualYamlToggle
            className={cx(positionInHeader && css.positionInHeader)}
            selectedView={selectedView}
            onChange={mode => {
              try {
                const latestYaml = yamlHandler?.getLatestYaml() || /* istanbul ignore next */ ''
                parse(latestYaml)
                const errorsYaml =
                  (yamlHandler?.getYAMLValidationErrorMap() as unknown as Map<number, string>) ||
                  /* istanbul ignore next */ ''
                if (errorsYaml?.size > 0) {
                  return
                }
                handleModeSwitch?.(mode, yamlHandler)
                setSelectedView(mode)
              } catch (e) {
                /* istanbul ignore next */
                showError(getString('common.validation.invalidYamlText'))
                return
              }
            }}
          />
        ) : null}
        <div className={css.sideItems}>{rightNav ? rightNav : null}</div>
      </section>
    )
  } else {
    return (
      <Heading
        style={{ position: 'fixed', top: '35px', paddingLeft: 'var(--spacing-large)', zIndex: 2 }}
        padding="small"
        level={2}
      >
        {wizardLabel}
      </Heading>
    )
  }
}
