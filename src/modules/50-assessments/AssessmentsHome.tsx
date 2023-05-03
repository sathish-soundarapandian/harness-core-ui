import React from 'react'
import { Route, Router, Switch, useHistory } from 'react-router-dom'
import NotFoundPage from '@common/pages/404/NotFoundPage'
import AssessmentResults from './components/AssessmentResults/AssessmentResults'
import AssessmentSurvey from './components/AssessmentSurvey/AssessmentSurvey'
import Assessments from './components/Assessments/Assessments'

export default function AssessmentsHome(): JSX.Element {
  const history = useHistory()
  return (
    <Router history={history}>
      <div>
        <Switch>
          <Route exact path="/assessment/:inviteCode">
            <Assessments />
          </Route>
          <Route exact path="/assessment/results/:resultsCode">
            <AssessmentResults />
          </Route>
          <Route exact path="/assessment/survey/:resultsCode">
            <AssessmentSurvey />
          </Route>
          <Route path="*">
            <NotFoundPage />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}
