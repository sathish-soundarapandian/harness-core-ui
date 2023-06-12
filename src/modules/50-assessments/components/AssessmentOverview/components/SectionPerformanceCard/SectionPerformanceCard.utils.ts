import L1StretchImage from '@assessments/assets/L1Stretch.svg'
import L2StretchImage from '@assessments/assets/L2Stretch.svg'
import L3StretchImage from '@assessments/assets/L3Stretch.svg'

export const getLevelImage = (level?: string): string => {
  switch (level) {
    case 'LEVEL_3':
      return L3StretchImage
    case 'LEVEL_2':
      return L2StretchImage
    case 'LEVEL_1':
      return L1StretchImage
    default:
      return L3StretchImage
  }
}
