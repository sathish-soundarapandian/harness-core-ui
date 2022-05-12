/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, IconName, Card, Container, Text, Button } from '@wings-software/uicore'
import cx from 'classnames'
import type { Module } from '@common/interfaces/RouteInterfaces'
import css from './WelcomePage.module.scss'

interface ModuleProps {
  enabled: boolean
  titleIcon: IconName
  bodyIcon: IconName
  module: Module
  description: string
  className?: string
}

interface ModuleCardProps {
  option: ModuleProps
  onClick?: (module: Module) => void
  selected?: boolean
  className?: string
  cornerSelected?: boolean
  buttonText: string
  handleButtonClick?: () => void
  buttonDisabled?: boolean
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  option,
  onClick,
  selected,
  className,
  cornerSelected,
  handleButtonClick,
  buttonText,
  buttonDisabled
}) => {
  return (
    <div className={cx(css.cardContainer)}>
      <Card
        data-testid={option.module}
        className={cx(css.card, className)}
        onClick={() => {
          onClick?.(option.module)
        }}
        selected={selected}
        cornerSelected={cornerSelected}
      >
        <Container className={css.iconContainer}>
          <Icon name={option.titleIcon} size={120} className={cx(css.titleIcon, option.className)} />
          <Icon name={option.bodyIcon} size={80} className={css.bodyIcon} />
          <Text font={{ align: 'center' }} className={css.iconDescription}>
            {option.description}
          </Text>
        </Container>
      </Card>
      {selected && (
        <Button intent="primary" onClick={handleButtonClick} width="100%" disabled={buttonDisabled}>
          {buttonText}
        </Button>
      )}
    </div>
  )
}

export default ModuleCard
