import ChaosImage from '@assessments/assets/Chaos.svg'
import CCMImage from '@assessments/assets/CCM.svg'
import CIImage from '@assessments/assets/CI.svg'
import CDImage from '@assessments/assets/CD.svg'
import FFImage from '@assessments/assets/FF.svg'
import SRMImage from '@assessments/assets/SRM.svg'
import CETImage from '@assessments/assets/CET.svg'
import STOImage from '@assessments/assets/STO.svg'
import css from './HarnessRecommendation.module.scss'

export const getRecommendationImage = (harnessModule: string): string => {
  switch (harnessModule) {
    case 'chaos':
      return ChaosImage
    case 'ccm':
    case 'idp':
      return CCMImage
    case 'ci':
      return CIImage
    case 'cd':
    case 'sei':
      return CDImage
    case 'ff':
    case 'cf':
      return FFImage
    case 'sto':
      return STOImage
    case 'srm':
      return SRMImage
    case 'cet':
    case 'sscm':
    case 'ssca':
      return CETImage
    default:
      return CIImage
  }
}

export const ComponentSyle: Record<string, string> = {
  chaos: css.chaos,
  ccm: css.ccm,
  idp: css.idp,
  ci: css.ci,
  cd: css.cd,
  sei: css.sei,
  ff: css.ff,
  cf: css.cf,
  sto: css.sto,
  srm: css.srm,
  cet: css.cet,
  sscm: css.sscm,
  ssca: css.ssca
}
