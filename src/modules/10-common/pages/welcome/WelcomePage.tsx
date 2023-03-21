/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { HarnessIcons, Container, Text, Layout, Heading, IconName } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { PageNames } from '@common/constants/TrackingConstants'
import type { Module } from '@common/interfaces/RouteInterfaces'

import SelectModuleList from './SelectModuleList'
import ribbon from './images/ribbon.svg'
import ribbon_ff from './images/ribbon_ff.svg'
import ribbon_ci from './images/ribbon_ci.svg'
import ribbon_ccm from './images/ribbon_ccm.svg'
import ribbon_cd from './images/ribbon_cd.svg'
import ribbon_chaos from './images/ribbon_chaos.svg'
import css from './WelcomePage.module.scss'

interface ModuleProps {
  enabled: boolean
  titleIcon: IconName
  bodyIcon: IconName
  module: Module
  description: string
  className?: string
}

const WelcomePage: React.FC = () => {
  const HarnessLogo = HarnessIcons['harness-logo-black']
  const { getString } = useStrings()
  const [ribbonImg, setRibbonImg] = useState<string>(ribbon_ci)

  const { CVNG_ENABLED, CING_ENABLED, CFNG_ENABLED, CENG_ENABLED, CHAOS_ENABLED } = useFeatureFlags()
  const CDNG_OPTIONS: ModuleProps = {
    enabled: true, // Continous delivery is enabled in CG
    titleIcon: 'cd-with-text',
    bodyIcon: 'cd-sketch',
    module: 'cd',
    description: getString('common.purpose.cd.description')
  }
  const CVNG_OPTIONS: ModuleProps = {
    enabled: !!CVNG_ENABLED,
    titleIcon: 'cv-with-text',
    bodyIcon: 'cv-sketch',
    module: 'cv',
    description: getString('common.purpose.cv.description'),
    className: css.cvIconText
  }

  const CING_OPTIONS: ModuleProps = {
    enabled: !!CING_ENABLED,
    titleIcon: 'ci-with-text',
    bodyIcon: 'ci-sketch',
    module: 'ci',
    description: getString('common.purpose.ci.descriptionOnly')
  }

  const CENG_OPTIONS: ModuleProps = {
    enabled: !!CENG_ENABLED, // Continous efficiency is enabled in CG
    titleIcon: 'ccm-with-text',
    bodyIcon: 'ccm-sketch',
    module: 'ce',
    description: getString('common.purpose.ce.descriptionOnly')
  }

  const CFNG_OPTIONS: ModuleProps = {
    enabled: !!CFNG_ENABLED,
    titleIcon: 'ff-with-text',
    bodyIcon: 'ff-sketch',
    module: 'cf',
    description: getString('common.purpose.cf.descriptionOnly')
  }

  const CHAOS_OPTIONS: ModuleProps = {
    enabled: !!CHAOS_ENABLED,
    titleIcon: 'chaos-with-text',
    bodyIcon: 'chaos-sketch',
    module: 'chaos',
    description: getString('common.purpose.chaos.description')
  }

  function getModuleProps(_module: Module): ModuleProps | undefined {
    switch (_module) {
      case 'cd':
        return { ...CDNG_OPTIONS }
      case 'cv':
        return { ...CVNG_OPTIONS }
      case 'ce':
        return { ...CENG_OPTIONS }
      case 'cf':
        return { ...CFNG_OPTIONS }
      case 'ci':
        return { ...CING_OPTIONS }
      case 'chaos':
        return { ...CHAOS_OPTIONS }
    }
  }

  const getOptions = (): ModuleProps[] => {
    const options: ModuleProps[] = []
    ;[CING_OPTIONS, CDNG_OPTIONS, CVNG_OPTIONS, CFNG_OPTIONS, CENG_OPTIONS, CHAOS_OPTIONS].forEach(option => {
      if (option.enabled) {
        const { module: _module } = option
        const moduleProps = getModuleProps(_module)
        if (moduleProps) {
          options.push(moduleProps)
        }
      }
    })

    return options
  }

  useTelemetry({ pageName: PageNames.Purpose })

  const body = (
    <Layout.Vertical width={'80vw'}>
      <Heading color={Color.BLACK} font={{ size: 'large', weight: 'bold' }} padding={{ top: 'xxlarge' }}>
        {getString('common.purpose.welcome')}
      </Heading>
      <Text padding={{ top: 'small', bottom: 'xxxlarge' }} color={Color.BLACK}>
        {getString('common.purpose.selectAModule')}
      </Text>
      <SelectModuleList
        onModuleClick={(_module?: Module) => {
          setRibbonImg(ribbonMap[_module?.toString() || 'default'])
        }}
        moduleList={getOptions()}
      />
    </Layout.Vertical>
  )

  const ribbonMap: Record<string, string> = {
    cd: ribbon_cd,
    ce: ribbon_ccm,
    cf: ribbon_ff,
    ci: ribbon_ci,
    chaos: ribbon_chaos,
    default: ribbon
  }

  return (
    <Container
      padding={{ left: 'xxxlarge', top: 'xxxlarge' }}
      flex={{ alignItems: 'start' }}
      style={{
        backgroundImage: `url(${ribbonImg})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover , cover'
      }}
      className={css.container}
    >
      <Layout.Vertical padding={{ left: 'xxlarge', top: 'xxlarge' }} spacing="large" width="100%">
        <HarnessLogo height={30} style={{ alignSelf: 'start' }} />
        {body}
      </Layout.Vertical>
    </Container>
  )
}

export default WelcomePage
