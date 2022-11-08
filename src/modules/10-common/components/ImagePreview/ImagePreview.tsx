/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, ImgHTMLAttributes, useEffect, useState } from 'react'
import classNames from 'classnames'
import { Icon, IconName } from '@harness/icons'
import css from './ImagePreview.module.scss'

export interface ImagePreviewProps extends ImgHTMLAttributes<HTMLOrSVGImageElement> {
  src: string
  size: number
  /** used for rendering a fallback icon if an error occurs while loading or rendering the image using src  */
  fallbackIcon?: IconName
  className?: string
}

export const ImagePreview: FC<ImagePreviewProps> = ({ size, className, alt, fallbackIcon, ...rest }) => {
  const [error, setError] = useState(false)

  // to reset error when src changes
  useEffect(() => {
    setError(false)
  }, [rest.src])

  const onError = (): void => {
    setError(true)
  }

  if (error && fallbackIcon) {
    return <Icon data-testid={`fallback-icon-${fallbackIcon}`} name={fallbackIcon} size={size} />
  }

  return (
    <img
      height={size}
      width={size}
      alt={alt ?? ''}
      className={classNames(css.image, className)}
      onError={onError}
      {...rest}
    />
  )
}
