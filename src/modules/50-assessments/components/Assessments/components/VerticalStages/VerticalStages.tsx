import { Container, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import React, { useMemo } from 'react'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import type { AssessmentsForm, SectionDetails } from '@assessments/interfaces/Assessments'
import currentImg from '@assessments/assets/Current.svg'
import compltedImg from '@assessments/assets/Completed.svg'
import pendingImg from '@assessments/assets/Pending.svg'
import css from './VerticalStages.module.scss'

interface VerticalStagesProps {
  currentSectionId?: string
  sections: Array<SectionDetails>
}

export default function VerticalStages(props: VerticalStagesProps): JSX.Element {
  const { currentSectionId, sections } = props
  const { getString } = useStrings()
  const { values } = useFormikContext<AssessmentsForm>()

  const completedSections: string[] = useMemo(() => {
    const completedSec: string[] = []
    sections.forEach((section: SectionDetails) => {
      const sectionValues = values.userResponse[section.id]
      if (!Object.values(sectionValues).some((response: string[]) => response.length === 0)) {
        completedSec.push(section.id)
      }
    })
    return completedSec
  }, [sections, values.userResponse])

  const sectionResult = useMemo(() => {
    let result: { [index: string]: number } = {}
    result = sections.reduce((acc: { [index: string]: number }, section: SectionDetails) => {
      const answered = Object.values(values.userResponse[section.id]).filter(
        (response: string[]) => response.length !== 0
      ).length
      return {
        ...acc,
        [section.id]: answered
      } as { [index: string]: number }
    }, {})
    return result
  }, [sections, values.userResponse])

  const dots = useMemo(() => {
    const sectionDots: JSX.Element[] = []
    sections.map((section: SectionDetails) => {
      let dotImage = pendingImg
      if (section.id === currentSectionId) {
        dotImage = currentImg
      }
      if (completedSections.includes(section.id)) {
        dotImage = compltedImg
      }
      sectionDots.push(<img key={`${section.id}_img`} src={dotImage} width="16" height="16" alt="" />)
      sectionDots.push(<div key={`${section.id}_line`} className={css.verticalLine}></div>)
    })
    sectionDots.length && sectionDots.length % 2 === 0 && sectionDots.pop()
    return sectionDots
  }, [completedSections, currentSectionId, sections])

  const names = useMemo(() => {
    const sectionNames: JSX.Element[] = []
    sections.map((section: SectionDetails) => {
      const isCompleted = completedSections.includes(section.id)
      const current = section.id === currentSectionId
      const textColor = isCompleted ? Color.GREY_0 : current ? Color.PRIMARY_5 : ''
      sectionNames.push(
        <Container margin={{ bottom: 'xlarge' }} key={section.id}>
          <Text color={textColor} font={{ weight: 'bold', size: 'normal' }}>
            {section.name}
          </Text>
          <Text color={isCompleted || current ? Color.GREY_0 : ''} font={{ size: 'xsmall' }}>
            {`${sectionResult[section.id]} / ${section.questionIds.length || 0} ${getString('assessments.answered')}`}
          </Text>
        </Container>
      )
    })
    return sectionNames
  }, [completedSections, currentSectionId, getString, sectionResult, sections])
  return (
    <>
      <Layout.Horizontal>
        <Layout.Vertical padding="xsmall" background={Color.BLACK} className={css.verticalLineLayout}>
          {dots}
        </Layout.Vertical>
        <Layout.Vertical padding={{ top: 'xsmall', left: 'medium' }}>{names}</Layout.Vertical>
      </Layout.Horizontal>
    </>
  )
}
