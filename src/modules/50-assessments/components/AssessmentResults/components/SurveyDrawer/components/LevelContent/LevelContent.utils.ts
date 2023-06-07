import L1SideImage from '@assessments/assets/L1_Side.png'
import L2SideImage from '@assessments/assets/L2_Side.png'
import L3SideImage from '@assessments/assets/L3_Side.png'
import NASideImage from '@assessments/assets/NA_Side.png'
import LevelTrans12 from '@assessments/assets/LevelTrans12.svg'
import LevelTrans23 from '@assessments/assets/LevelTrans23.svg'
import LevelTransNA from '@assessments/assets/LevelTransNA.svg'

export const getLevelImage = (level: string): string => {
  switch (level) {
    case 'LEVEL_1':
      return L1SideImage
    case 'LEVEL_2':
      return L2SideImage
    case 'LEVEL_3':
      return L3SideImage
    default:
      return NASideImage
  }
}

export const getLevelTransImage = (level: string, maturityLevel: string): string | undefined => {
  const levelString =
    level !== 'LEVEL_1' && parseInt(level?.slice(-1)) <= parseInt(maturityLevel?.slice(-1)) ? 'NA' : level
  switch (levelString) {
    case 'LEVEL_3':
      return LevelTrans23
    case 'LEVEL_2':
      return LevelTrans12
    case 'NA':
      return LevelTransNA
    default:
      return undefined
  }
}
