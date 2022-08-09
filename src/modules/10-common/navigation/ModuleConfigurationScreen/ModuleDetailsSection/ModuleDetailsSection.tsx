/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Icon } from '@harness/icons'
import React from 'react'
import { Container, Layout, Text, FontVariation, Color, Carousel } from '@harness/uicore'
import type { ModuleName } from 'framework/types/ModuleName'
import { getModuleInfo } from '../util'
import css from './ModuleDetailsSection.module.scss'

interface ModuleDetailsSectionProps {
  module: ModuleName
}

const ModuleDetailsSection: React.FC<ModuleDetailsSectionProps> = ({ module: selectedModule }) => {
  const moduleInfo = getModuleInfo(selectedModule)

  if (!moduleInfo) {
    // TODO: Check if we can get rid of this condition
    return null
  }

  const {
    details: { title, carousel },
    icon
  } = moduleInfo

  return (
    <Container padding="xxlarge" className={css.container} height="100%">
      <Layout.Vertical>
        <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
          {icon && <Icon name={icon} size={40} />}
          <Text margin={{ left: 'small' }} font={{ variation: FontVariation.H5 }} color={Color.WHITE}>
            {title}
          </Text>
        </Layout.Horizontal>
        {carousel && carousel.length > 0 && (
          <Carousel>
            {carousel.map((item, index) => {
              return (
                <Layout.Vertical key={index} flex={{ alignItems: 'center' }} margin={{ top: 'xlarge' }}>
                  <Container margin={{ bottom: 'xlarge' }}>
                    <img src={item.imageUrl} height={349} width={654} />
                  </Container>
                  <Text font={{ variation: FontVariation.H2 }} color={Color.PRIMARY_5} margin={{ top: 'xxlarge' }}>
                    {item.primaryText}
                  </Text>
                  <Text
                    font={{ variation: FontVariation.H5 }}
                    color={Color.WHITE}
                    margin={{ top: 'large' }}
                    padding={{ bottom: 'xxlarge' }}
                  >
                    {item.secondoryText}
                  </Text>
                </Layout.Vertical>
              )
            })}
          </Carousel>
        )}
      </Layout.Vertical>
      {icon && (
        <Icon
          name={icon}
          style={{ position: 'absolute', right: '-120px', bottom: '-120px', opacity: 0.14 }}
          size={540}
        />
      )}
    </Container>
  )
}

export default ModuleDetailsSection
