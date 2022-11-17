/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { defaultTo } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import { useStrings } from 'framework/strings'
import type { NGTemplateInfoConfigWithGitDetails } from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'
import templateFactory from '@templates-library/components/Templates/TemplatesFactory'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import css from './TemplateInputsWrapper.module.scss'

export const TemplateInputsWrapper: React.FC = (): JSX.Element => {
  const { getString } = useStrings()
  const {
    state: { template, gitDetails, storeMetadata }
  } = React.useContext(TemplateContext)
  const params = useParams<ProjectPathProps>()
  const { accountId } = params

  const templateWithGitDetails: NGTemplateInfoConfigWithGitDetails = React.useMemo(
    () => ({
      ...template,
      repo: defaultTo(gitDetails.repoIdentifier, ''),
      branch: defaultTo(gitDetails.branch, '')
    }),
    [template, gitDetails]
  )

  return (
    <Container height={'100%'}>
      <Layout.Vertical height={'100%'}>
        <Container>
          <Layout.Horizontal padding="xlarge" border={{ bottom: true, color: Color.GREY_200 }}>
            <Icon name="template-inputs" size={24} color={Color.PRIMARY_7} margin={{ right: 'small' }} />
            <Text font={{ variation: FontVariation.H4 }}>{getString('pipeline.templateInputs')}</Text>
          </Layout.Horizontal>
        </Container>
        <Container className={css.templateInputsContainer}>
          {templateFactory.getTemplate(templateWithGitDetails.type || '')?.renderTemplateInputsForm({
            template: templateWithGitDetails,
            accountId: accountId,
            storeMetadata
          })}
        </Container>
      </Layout.Vertical>
    </Container>
  )
}
