import SessionToken from 'framework/utils/SessionToken'
import { PortalClient } from '../../../generated/portal/PortalClient'

export const portalClient = new PortalClient({
  TOKEN: SessionToken.getToken(),
  WITH_CREDENTIALS: true,
  BASE: process.env.BASE_URL
})
