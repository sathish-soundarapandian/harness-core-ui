import React from 'react'
import { Route, Router, Switch, useHistory } from 'react-router-dom'
import NotFoundPage from '@common/pages/404/NotFoundPage'
import AssessmentOverview from './components/AssessmentOverview/AssessmentOverview'
import AssessmentSurvey from './components/AssessmentResults/AssessmentResults'
import Assessments from './components/Assessments/Assessments'
import ImproveMaturity from './components/ImproveMaturity/ImproveMaturity'

export default function AssessmentsHome(): JSX.Element {
  const history = useHistory()
  return (
    <Router history={history}>
      <div>
        <Switch>
          <Route exact path="/assessment/:inviteCode">
            <Assessments />
          </Route>
          <Route exact path="/assessment/home/:resultsCode">
            <AssessmentOverview />
          </Route>
          <Route exact path="/assessment/results/:resultsCode">
            <AssessmentSurvey />
          </Route>
          <Route exact path="/assessment/improve-maturity/:resultsCode">
            <ImproveMaturity />
          </Route>
          <Route path="*">
            <NotFoundPage />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}
