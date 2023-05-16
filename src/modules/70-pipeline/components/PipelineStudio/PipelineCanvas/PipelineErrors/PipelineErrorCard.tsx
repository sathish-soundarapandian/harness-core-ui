/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IconName} from '@harness/uicore';
import { Popover, Button, ButtonSize, ButtonVariation, Card, Icon, Layout, Text } from '@harness/uicore'
import { Classes, Position, PopoverInteractionKind } from '@blueprintjs/core'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import css from './PipelineErrors.module.scss'

interface PipelineErrorCardProps {
  icon: IconName
  title?: string
  errors: string[]
  onClick: () => void
  buttonText: string
}

export default function PipelineErrorCard(props: PipelineErrorCardProps): React.ReactElement {
  const [firstError, ...restErrors] = props.errors

  return (
    <Layout.Horizontal margin={{ bottom: 'xlarge' }}>
      <Card className={css.cardWithIcon}>
        <Icon name={props.icon} size={30} />
      </Card>
      <Layout.Vertical padding={{ left: 'medium' }} className={css.cardContent}>
        {props.title ? (
          <Text color={Color.BLACK} margin={{ bottom: 'small' }} font={{ size: 'normal', weight: 'bold' }}>
            {props.title}
          </Text>
        ) : null}
        <ErrorMessage errorText={firstError} />
        <ErrorMessageList errors={restErrors} />
        <Button
          className={css.fixButton}
          onClick={props.onClick}
          size={ButtonSize.SMALL}
          variation={ButtonVariation.PRIMARY}
          text={props.buttonText}
        />
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

function ErrorMessage({
  errorText,
  dark,
  shouldAddBottomMargin = true,
  lineClamp = 4
}: {
  errorText: string
  dark?: boolean
  shouldAddBottomMargin?: boolean
  lineClamp?: number
}): React.ReactElement {
  return (
    <Text
      color={dark ? Color.WHITE : Color.GREY_600}
      font={{ size: 'small', weight: 'semi-bold' }}
      lineClamp={lineClamp}
      margin={shouldAddBottomMargin ? { bottom: 'small' } : {}}
      tooltipProps={{ isDark: true }}
    >
      {errorText}
    </Text>
  )
}

function ErrorMessageList({ errors }: { errors: string[] }): React.ReactElement | null {
  const { getString } = useStrings()
  const errorsLength = errors.length
  if (errorsLength === 0) {
    return null
  }
  return (
    <Popover
      content={
        <div className={css.list}>
          {errors.map((error: string, index: number) => (
            <ErrorMessage
              key={`${error}_${index}`}
              dark
              errorText={error}
              shouldAddBottomMargin={index !== errorsLength - 1}
              lineClamp={10}
            />
          ))}
        </div>
      }
      interactionKind={PopoverInteractionKind.HOVER}
      popoverClassName={Classes.DARK}
      position={Position.RIGHT}
    >
      <Text
        color={Color.PRIMARY_7}
        font={{ size: 'small', weight: 'semi-bold' }}
        margin={{ bottom: 'small' }}
        width={100}
        className={css.moreText}
      >
        {`${getString(errorsLength > 1 ? 'cd.moreIssues' : 'cd.moreIssue', { count: errorsLength })} `}
      </Text>
    </Popover>
  )
}
