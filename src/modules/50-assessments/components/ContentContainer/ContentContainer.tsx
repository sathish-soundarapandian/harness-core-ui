import React from 'react'
import { useParams } from 'react-router-dom'
import { Container, Layout } from '@harness/uicore'
import Header from './components/Header/Header'
import SideNav from './components/SideNav/SideNav'
import css from './ContentContainer.module.scss'

interface ContentContainerProps {
  assessmentId: string
  title: string
  children?: React.ReactNode
}

const ContentContainer = ({ assessmentId, title, children }: ContentContainerProps): JSX.Element => {
  const { resultsCode } = useParams<{ resultsCode: string }>()
  return (
    <Layout.Horizontal>
      <Container className={css.leftNavigation}>
        <SideNav resultCode={resultsCode} />
      </Container>
      <Layout.Vertical className={css.rightNavigation}>
        <Header title={title} assessmentId={assessmentId} />
        {children}
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

export default ContentContainer
