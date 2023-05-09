/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { defaultTo, isEmpty } from 'lodash-es'
import { Button, ButtonVariation, Container, Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import type { GetDataError } from 'restful-react'
import { useStrings } from 'framework/strings'
import type { Failure, Error } from 'services/pipeline-ng'
import { ErrorHandler } from '@common/components/ErrorHandler/ErrorHandler'
import css from './RunPipelineForm.module.scss'

interface PipelineInvalidRequestContentProps {
  onClose?: () => void
  getTemplateError: GetDataError<Failure | Error> | null
  branch?: string
  repoName?: string
}

interface GetErrorTitleAndTextOption {
  title: string
  message: string
}

export function PipelineInvalidRequestContent({
  getTemplateError,
  onClose,
  branch,
  repoName
}: PipelineInvalidRequestContentProps): React.ReactElement {
  const { getString } = useStrings()
  const getErrorMessageTitleAndText = (): GetErrorTitleAndTextOption => {
    const errorMessage: string[] = defaultTo((getTemplateError?.data as Error)?.message, '').split(':')
    return errorMessage.length > 1
      ? {
          title: errorMessage[0],
          message: errorMessage[1]
        }
      : {
          title:
            branch && repoName
              ? getString('pipeline.pipelineRunFailedForRepoBranch', { repoName, branch })
              : getString('pipeline.pipelineRunFailed'),
          message: errorMessage[0]
        }
  }

  return (
    <Layout.Vertical margin={{ top: 'xxlarge', bottom: 'xxlarge', right: 'xxlarge', left: 'xxlarge' }}>
      <Layout.Horizontal margin={{ top: 'large' }}>
        <Icon name="warning-sign" size={25} color={Color.RED_600}></Icon>
        <Text
          padding={{ left: 'medium' }}
          font={{ variation: FontVariation.H4 }}
          style={{ textTransform: 'capitalize' }}
        >
          {getErrorMessageTitleAndText().title}
        </Text>
      </Layout.Horizontal>

      {!isEmpty((getTemplateError?.data as Error)?.responseMessages) ? (
        <Container padding={{ top: 'xlarge', bottom: 'xlarge' }}>
          <ErrorHandler responseMessages={defaultTo((getTemplateError?.data as Error).responseMessages, [])} />
        </Container>
      ) : (
        <Text padding={{ top: 'xlarge', bottom: 'xlarge' }} color={Color.BLACK}>
          {getErrorMessageTitleAndText().message}
        </Text>
      )}
      <Layout.Horizontal className={cx(css.actionButtons)}>
        <Button
          data-testid="deletion-pipeline"
          variation={ButtonVariation.PRIMARY}
          id="cancel-runpipeline"
          text={getString('close')}
          background={Color.PRIMARY_7}
          onClick={() => {
            if (onClose) {
              onClose()
            }
          }}
        />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
