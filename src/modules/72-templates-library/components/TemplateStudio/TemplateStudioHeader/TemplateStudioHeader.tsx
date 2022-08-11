/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { LegacyRef, useRef } from 'react'
import styled from '@emotion/styled'
import { Container, Layout, Text } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import type { TemplateType } from '@templates-library/utils/templatesUtils'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import routes from '@common/RouteDefinitions'
import templateFactory from '@templates-library/components/Templates/TemplatesFactory'
import type { ProjectPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { templateStudioColorStyleMap } from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import css from './TemplateStudioHeader.module.scss'

interface StyledTemplateStudioTitleInterface {
  stroke?: string
  fill?: string
  width: number
}

export const StyledTemplateStudioTitle = styled.div`
  position: relative;
  padding: 0px 18px;
  ${(props: StyledTemplateStudioTitleInterface) =>
    props.width
      ? `
  -webkit-perspective: ${props.width}px;
  -moz-perspective: ${props.width}px;
  -ms-perspective: ${props.width}px;
  -o-perspective: ${props.width}px;
  `
      : ``}
  &::before {
    content: '';
    position: absolute;
    top: -10px;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40px;
    border: 1px solid ${(props: StyledTemplateStudioTitleInterface) => props?.stroke};
    background: ${(props: StyledTemplateStudioTitleInterface) => (props.width > 0 ? props?.fill : 'transparent')};
    border-radius: 0 0 5px 5px;
    -webkit-transform: perspective(${(props: StyledTemplateStudioTitleInterface) => props.width}) rotateX(-45deg);
    -webkit-transform: rotateX(-45deg);
    -moz-transform: rotateX(-45deg);
    -webkit-transform: rotateX(-45deg);
    -webkit-transform-origin: center bottom;
    -moz-transform-origin: center bottom;
    -ms-transform-origin: center bottom;
    -o-transform-origin: center bottom;
  }
  p {
    position: relative;
  }
`

export interface TemplateStudioHeaderProps {
  templateType: TemplateType
}

export const TemplateStudioHeader: React.FC<TemplateStudioHeaderProps> = props => {
  const { templateType } = props
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()

  const studioTitle = `${defaultTo(templateFactory.getTemplateLabel(templateType), '')} Template`
  const style = templateStudioColorStyleMap[templateType || 'Step']
  const titleContainerRef: LegacyRef<HTMLDivElement> = useRef(null)
  const titleWidth = parseInt(defaultTo(titleContainerRef.current?.getClientRects()?.[0]?.width, 0).toFixed(0))

  return (
    <Container>
      <Layout.Horizontal>
        <NGBreadcrumbs
          links={[
            {
              url: routes.toTemplates({ orgIdentifier, projectIdentifier, accountId, module }),
              label: getString('common.templates')
            }
          ]}
        />
      </Layout.Horizontal>
      <Container className={css.templateStudioTitle}>
        <Container>
          <StyledTemplateStudioTitle fill={style?.fill} stroke={style?.stroke} width={titleWidth}>
            <div ref={titleContainerRef}>
              <Text font={{ size: 'xsmall', weight: 'bold' }} style={{ color: style?.color }} className={css.title}>
                {studioTitle}
              </Text>
            </div>
          </StyledTemplateStudioTitle>
        </Container>
      </Container>
    </Container>
  )
}
