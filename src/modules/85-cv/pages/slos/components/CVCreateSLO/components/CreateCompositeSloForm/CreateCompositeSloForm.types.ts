import type { SLOForm } from '../../CVCreateSLO.types'

export interface CreateCompositeSloFormInterface {
  loading: boolean
  error: any
  retryOnError: () => void
  handleRedirect: () => void
  runValidationOnMount?: boolean
}

export enum CreateCompositeSLOSteps {
  Define_SLO_Identification = 'Define_SLO_Identification',
  Set_SLO_Time_Window = 'Set_SLO_Time_Window',
  SLO_TARGET_BUDGET_POLICY = 'SLO_TARGET_BUDGET_POLICY',
  Add_SLOs = 'Add_SLOs',
  Set_SLO_Target = 'Set_SLO_Target',
  Error_Budget_Policy = 'Error_Budget_Policy'
}

export interface CompositeSLOFormInterface extends SLOForm {
  sloList?: any[]
}
