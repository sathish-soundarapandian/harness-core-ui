/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon } from '@harness/icons'
import { Container, Layout, Text, FontVariation, Color, Carousel } from '@harness/uicore'
import useNavModuleInfo, { NavModuleName } from '@common/hooks/useNavModuleInfo'
import { MassagedModuleData, ModuleContentType } from '../useGetContentfulModules'
import CarouselImageAndDescription from '../CarousellmageAndDescription/CarousellmageAndDescription'
import LottieComponent from '../LottieComponent/LottieComponent'
import css from './ModuleDetailsSection.module.scss'

interface ModuleDetailsSectionProps {
  module: NavModuleName
  data?: MassagedModuleData
}

const getComponentBasedOnType = (type: ModuleContentType): React.ComponentType<any> => {
  const componentMap: Record<ModuleContentType, React.ComponentType<any>> = {
    [ModuleContentType.CENTER_ALIGNED_IMAGE_DESC]: CarouselImageAndDescription,
    [ModuleContentType.LOTTIE]: LottieComponent
  }
  return componentMap[type]
}

const ModuleDetailsSection: React.FC<ModuleDetailsSectionProps> = ({
  module: selectedModule,
  data: massagedModuleData
}) => {
  const { icon } = useNavModuleInfo(selectedModule)

  const { label, data = [] } = massagedModuleData || {}

  return (
    <Container className={css.container} height="100%">
      <Layout.Horizontal className={css.heading}>
        {icon && <Icon name={icon} size={40} margin={{ right: 'xsmall' }} />}
        <Text font={{ variation: FontVariation.H5 }} color={Color.WHITE}>
          {label}
        </Text>
      </Layout.Horizontal>
      <Container className={css.main}>
        <Carousel className={css.carousel} autoPlay autoPlayInterval={3000} hideIndicators={data.length <= 1}>
          {data.map((item, index) => {
            const Component = getComponentBasedOnType(item.type)
            return <Component key={index} {...item} />
          })}
        </Carousel>
      </Container>
    </Container>
  )
}

export default ModuleDetailsSection
