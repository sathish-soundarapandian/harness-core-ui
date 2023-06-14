import { Container, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import React, { useMemo } from 'react'
import { useFormikContext } from 'formik'
import type { AssessmentsForm, SectionDetails } from '@assessments/interfaces/Assessments'
import { getSectionImage } from '../../../utils'
import HorizontalSteps from '../HorizontalSteps/HorizontalSteps'
import css from './QuestionTopNav.module.scss'

interface QuestionTopNavProps {
  section: SectionDetails | undefined
  currentId: string
}

const QuestionTopNav = (props: QuestionTopNavProps): JSX.Element => {
  const { section, currentId } = props
  const { values } = useFormikContext<AssessmentsForm>()

  const completedIndexes = useMemo(() => {
    const sectionResonse = values.userResponse[section?.id || 0]
    return (
      section?.questionIds.reduce((acc: number[], questId: string, index: number) => {
        if (sectionResonse[questId].length) {
          return [...acc, index]
        }
        return acc
      }, []) || []
    )
  }, [values.userResponse, section?.id, section?.questionIds])

  const currentIndex = useMemo(
    () => Object.keys(values.userResponse[section?.id || 0]).findIndex(key => key === currentId) || 0,
    [values.userResponse, section?.id, currentId]
  )

  return (
    <Container className={css.questionTopNav} padding="medium" margin={{ bottom: 'huge' }}>
      <Layout.Horizontal padding={{ top: 'small' }}>
        <img src={getSectionImage(section?.name || '')} width="24" height="24" alt="" />
        <Text
          className={css.section}
          font={{ size: 'medium', weight: 'semi-bold' }}
          color={Color.GREY_600}
          padding={{ left: 'small' }}
        >
          {section?.name || ''}
        </Text>
      </Layout.Horizontal>
      <HorizontalSteps
        totalSteps={section?.questionIds.length || 1}
        completedIndexes={completedIndexes}
        inProgress={currentIndex}
      />
    </Container>
  )
}

export default QuestionTopNav
