/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Layout,
  Heading,
  Text,
  Container,
  Button,
  Tag,
  Icon,
  CardSelect,
  CardSelectType,
  ButtonVariation
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Experiences } from '@common/constants/Utils'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import css from '../DefaultExperience.module.scss'

interface Props {
  onSubmit?: () => void
  currentExperience: Experiences
  setCurrentExperience: (currentExperience: Experiences) => void
  loading: boolean
}

enum Modules {
  CD = 'cd-main',
  CI = 'ci-main',
  CF = 'cf-main',
  CE = 'ce-main',
  CV = 'cv-main'
}

interface Data {
  type: Experiences
  title: string
  description: string
  modules: {
    name: Modules
    size: number
  }[]
}

const data: Data[] = [
  {
    type: Experiences.CG,
    title: 'common.harnessFirstGeneration',
    description: 'common.harnessFirstGenerationDescription',
    modules: [
      {
        name: Modules.CD,
        size: 25
      },
      {
        name: Modules.CE,
        size: 30
      }
    ]
  },
  {
    type: Experiences.NG,
    title: 'common.harnessNextGeneration',
    description: 'common.harnessNextGenerationDescription',
    modules: [
      {
        name: Modules.CD,
        size: 25
      },
      {
        name: Modules.CI,
        size: 25
      },
      {
        name: Modules.CF,
        size: 25
      },
      {
        name: Modules.CE,
        size: 30
      }
    ]
  }
]

const DefaultExperienceForm: React.FC<Props> = ({ onSubmit, currentExperience, setCurrentExperience, loading }) => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical padding={{ left: 'huge', right: 'huge' }}>
      <Text color={Color.GREY_900} font={{ size: 'medium', weight: 'semi-bold' }} margin={{ bottom: 'medium' }}>
        {getString('common.defaultExperience')}
      </Text>
      <Text color={Color.GREY_700} font={{ size: 'normal' }} margin={{ bottom: 'xxxlarge' }}>
        {getString('common.selectDefaultExperience')}
      </Text>
      <CardSelect
        data={data}
        className={css.cardContainer}
        type={CardSelectType.CardView}
        renderItem={item => (
          <Container>
            <Layout.Horizontal spacing="small">
              <Heading level={2} color={Color.GREY_900} font={{ weight: 'semi-bold' }} margin={{ bottom: 'medium' }}>
                {getString(item.title as keyof StringsMap)}
              </Heading>
              {item.type === Experiences.NG && (
                <Tag round className={css.tag}>
                  {getString('common.new')}
                </Tag>
              )}
            </Layout.Horizontal>
            <Text color={Color.GREY_900} font={{ size: 'small' }} className={css.cardText} margin={{ bottom: 'large' }}>
              {getString(item.description as keyof StringsMap)}
            </Text>
            <Text color={Color.GREY_700} font={{ size: 'small', weight: 'bold' }} margin={{ bottom: 'medium' }}>
              {getString('common.supportedModals')}
            </Text>
            <Layout.Horizontal spacing="xlarge" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
              {item.modules.map(module => (
                <Icon name={module.name} size={module.size} key={module.name} />
              ))}
            </Layout.Horizontal>
          </Container>
        )}
        onChange={card => setCurrentExperience(card.type)}
        selected={data.find(item => item.type === currentExperience)}
      />
      <Container padding={{ top: 'huge', bottom: 'xxlarge' }}>
        <Button text={getString('save')} variation={ButtonVariation.PRIMARY} onClick={onSubmit} disabled={loading} />
      </Container>
    </Layout.Vertical>
  )
}

export default DefaultExperienceForm
