// import React from 'react'
// import { Container, Text, Layout } from '@wings-software/uicore'
// import { Color } from '@harness/design-system'
// import { useStrings } from 'framework/strings'
// import { EVENT_TYPE } from '@cv/components/ExecutionVerification/components/LogAnalysisContainer/LogAnalysis.utils'
// import { getEventTypeColor, getEventTypeLightColor } from '@cv/utils/CommonUtils'
// import css from '../LogAnalysisRiskAndJiraModal.module.scss'
// import logRowStyle from '../../../LogAnalysisRow.module.scss'

// export function UpdatedEventPreference(): JSX.Element {
//   const { getString } = useStrings()

//   return (
//     <Container border className={css.activityContainer} padding="large" background={Color.GREY_100}>
//       <Layout.Horizontal className={css.firstRow}>
//         <Container>
//           <Text>{getString('cv.logs.eventPriorityUpdate')}</Text>
//           <Text
//             className={logRowStyle.eventTypeTag}
//             font="normal"
//             style={{
//               color: getEventTypeColor(EVENT_TYPE.KNOWN),
//               background: getEventTypeLightColor(EVENT_TYPE.KNOWN)
//             }}
//           >
//             {getString('cv.logs.notARisk')}
//           </Text>
//         </Container>
//         <Container>
//           <Text>{getString('reason')}</Text>
//           <Container className={css.reasonTextContainer}>
//             <Text className={css.reasonText} lineClamp={1} color={Color.BLACK}>
//               some biiiiiiiiiig reason some biiiiiiiiiig reason some biiiiiiiiiig reasonsome biiiiiiiiiig reason
//             </Text>
//           </Container>
//         </Container>
//         <Container>
//           <Text>{getString('cv.logs.reportedBy')}</Text>
//           <Text color={Color.BLACK}>Harmen Porter on 09/01/2022 08:57:45 PM</Text>
//         </Container>
//         {/* <Container>
//           <Text>{getString('pipeline.verification.logs.lastKnownOccurence')}</Text>
//           <Text color={Color.BLACK}>09/01/2022 04:57:23 PM</Text>
//         </Container> */}
//       </Layout.Horizontal>
//     </Container>
//   )
// }
