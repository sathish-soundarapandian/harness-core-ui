import React from 'react'
import type { Asset } from 'contentful'
import { Layout, Text } from '@harness/uicore'
import { Icon } from '@harness/icons'
import { FontVariation, Color } from '@harness/design-system'
import useNavModuleInfo, { NavModuleName } from '@common/hooks/useNavModuleInfo'
import css from './CarousellmageAndDescription.module.scss'

interface CarouselImageAndDescriptionProps {
  activeModule: NavModuleName
  image: Asset
  primaryText: string
  secondaryText: string
}

const CarouselImageAndDescription: React.FC<CarouselImageAndDescriptionProps> = ({
  image,
  primaryText,
  secondaryText,
  activeModule
}) => {
  const { icon } = useNavModuleInfo([activeModule])[0]

  return (
    <Layout.Vertical flex={{ justifyContent: 'center' }} height="100%">
      <img className={css.image} src={`https:${image.fields.file.url}`} />
      {primaryText && (
        <Text
          className={css.primaryText}
          color={Color.PRIMARY_5}
          font={{ variation: FontVariation.H1_SEMI }}
          padding={{ top: 'xlarge', bottom: 'small' }}
        >
          {primaryText}
        </Text>
      )}
      {secondaryText && (
        <Text color={Color.WHITE} font={{ variation: FontVariation.BODY1 }}>
          {secondaryText}
        </Text>
      )}

      {icon && <Icon name={icon} size={540} className={css.backgroundModuleImage} />}
    </Layout.Vertical>
  )
}

export default CarouselImageAndDescription
