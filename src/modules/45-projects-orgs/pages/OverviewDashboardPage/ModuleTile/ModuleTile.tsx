import React from 'react'
import { Container, Icon } from '@harness/uicore'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import type { NavModuleName } from '@common/hooks/useNavModuleInfo'
import css from './ModuleTile.module.scss'

interface ModuleTileProps {
  module?: NavModuleName
  type?: 'small' | 'medium'
  className?: string
  loading?: boolean
}

const getHeightAndWidth = (type: ModuleTileProps['type']) => {
  switch (type) {
    case 'small':
      return { height: 110, width: 110 }
    case 'medium':
    default:
      return { height: 148, width: 186 }
  }
}

const ModuleTile: React.FC<ModuleTileProps> = props => {
  const { type, className, loading } = props

  const { height, width } = getHeightAndWidth(type)

  return (
    <Container
      background="white"
      flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
      style={{ height, width }}
      className={cx(css.container, className)}
    >
      {loading ? <Icon name="spinner" size={24} color={Color.PRIMARY_7} className={css.loader} /> : props.children}
    </Container>
  )
}

export default ModuleTile
