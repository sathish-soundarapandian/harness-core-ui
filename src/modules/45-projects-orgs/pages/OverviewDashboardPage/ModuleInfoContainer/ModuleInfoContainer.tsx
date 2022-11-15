import { Container, Layout } from '@harness/uicore'
import React from 'react'
import ModuleTile from '../ModuleTile/ModuleTile'
import css from './ModuleInfoContainer.module.scss'

const ModuleInfo = () => {
  return <div>Module Info</div>
}

const ModuleInfoContainer = () => {
  return (
    <Container className={css.container}>
      <ModuleTile>Deploy</ModuleTile>
      <ModuleTile>Build</ModuleTile>
      <ModuleTile>Manage Feature Flags</ModuleTile>
      <ModuleTile>Manage Security Tests</ModuleTile>
    </Container>
  )
}

export default ModuleInfoContainer
