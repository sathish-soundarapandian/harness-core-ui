import React from 'react'
import type { Asset } from 'contentful'
import { Layout, Text } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import type { ModuleName } from 'framework/types/ModuleName'
import css from './CarousellmageAndDescription.module.scss'

interface CarouselImageAndDescriptionProps {
  activeModule: ModuleName
  image: Asset
  primaryText: string
  secondaryText: string
}

const CarouselImageAndDescription: React.FC<CarouselImageAndDescriptionProps> = ({
  image,
  primaryText,
  secondaryText
}) => {
  return (
    <Layout.Vertical flex={{ justifyContent: 'center' }} height="100%">
      <img src={`https:${image.fields.file.url}`} />
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

      {/* {icon && (
        <Icon
          name={icon}
          style={{ position: 'absolute', right: '-120px', bottom: '-120px', opacity: 0.14 }}
          size={540}
        />
      )} */}
    </Layout.Vertical>
  )
}

export default CarouselImageAndDescription
