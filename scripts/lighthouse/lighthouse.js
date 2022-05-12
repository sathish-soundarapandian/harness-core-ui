/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const puppeteer = require('puppeteer')
const lighthouse = require('lighthouse')
const reportGenerator = require('lighthouse/lighthouse-core/report/report-generator')
const PRE_QA_URL = 'https://stress.harness.io/ng/'
const QA_URL = 'https://qa.harness.io/ng/'
const PROD_URL = 'https://app.harness.io/ng/'
const dbConnection = require('./connection')
const { DATA_POINTS, getFilterResults, percentageChangeInTwoParams } = require('./utils')
const pagesToBeTested = [
  { name: 'home', url: '/home/projects' },
  { name: 'getstarted', url: '/home/get-started' }
]
console.log('process.env.OVER_WRITE_BENCHMARK_RESULT', process.env.OVER_WRITE_BENCHMARK_RESULT)
const lighthouseRunTimes = 3
const acceptableChange = process.env.LIGHT_HOUSE_ACCEPTANCE_CHANGE
  ? parseInt(process.env.LIGHT_HOUSE_ACCEPTANCE_CHANGE)
  : 5
console.log('acceptableChange', acceptableChange)
const PORT = 8041
let url = PROD_URL
let passWord = ''
let emailId = 'ui_perf_test_prod@mailinator.com'
async function run() {
  // process.argv[2] could be QA / Pre-QA / Production
  const env = process.argv[2]
  if (env === 'QA') {
    url = QA_URL
    passWord = process.env.PASSWORD
  } else if (env === 'Pre-QA') {
    url = PRE_QA_URL
    emailId = 'perf_test_pre-qa@mailinator.com'
    passWord = process.env.PASSWORD
  } else {
    passWord = process.env.LIGHT_HOUSE_SECRET
  }
  if (!url) {
    throw 'Please provide URL as a first argument'
  }

  const createMap = passedUrl => {
    const scores = {
      [DATA_POINTS.PERFORMANCE]: 0,
      [DATA_POINTS.ACCESSIBILITY]: 0,
      [DATA_POINTS.BEST_PRACTICES]: 0,
      [DATA_POINTS.SEO]: 0,
      [DATA_POINTS.TIME_TO_INTERACTIVE]: 0,
      [DATA_POINTS.FIRST_CONTENTFUL_PAINT]: 0,
      [DATA_POINTS.FIRST_MEANINGFUL_PAINT]: 0
    }
    const map = new Map()
    pagesToBeTested.map(value => {
      map.set(value.name, { url: `${passedUrl}${value.url}`, ...scores })
    })

    return map
  }

  const getScores = resultSupplied => {
    let json = reportGenerator.generateReport(resultSupplied.lhr, 'json')
    json = JSON.parse(json)
    let scores = {
      [DATA_POINTS.PERFORMANCE]: 0,
      [DATA_POINTS.ACCESSIBILITY]: 0,
      [DATA_POINTS.BEST_PRACTICES]: 0,
      [DATA_POINTS.SEO]: 0,
      [DATA_POINTS.TIME_TO_INTERACTIVE]: 0,
      [DATA_POINTS.FIRST_CONTENTFUL_PAINT]: 0,
      [DATA_POINTS.FIRST_MEANINGFUL_PAINT]: 0
    }
    //score to be benchamarked against
    scores[DATA_POINTS.PERFORMANCE] = parseFloat(json.categories.performance.score) * 100
    scores[DATA_POINTS.ACCESSIBILITY] = parseFloat(json.categories.accessibility.score) * 100
    scores[DATA_POINTS.BEST_PRACTICES] = parseFloat(json['categories']['best-practices']['score']) * 100
    scores[DATA_POINTS.TIME_TO_INTERACTIVE] = json.audits.interactive.numericValue
    scores[DATA_POINTS.FIRST_MEANINGFUL_PAINT] = json.audits['first-meaningful-paint'].numericValue
    scores[DATA_POINTS.FIRST_CONTENTFUL_PAINT] = json.audits['first-contentful-paint'].numericValue
    ////   ******  */
    scores[DATA_POINTS.SEO] = parseFloat(json.categories.seo.score) * 100
    // new values

    scores[DATA_POINTS.TIME_TO_INTERACTIVE_SCORE] = json.audits.interactive.score
    scores[DATA_POINTS.FIRST_MEANINGFUL_PAINT_SCORE] = json.audits['first-meaningful-paint'].score
    scores[DATA_POINTS.FIRST_CONTENTFUL_PAINT_SCORE] = json.audits['first-contentful-paint'].score
    scores[DATA_POINTS.LARGEST_CONTENTFUL_PAINT] = json.audits['largest-contentful-paint'].numericValue
    scores[DATA_POINTS.LARGEST_CONTENTFUL_PAINT_SCORE] = json.audits['largest-contentful-paint'].score
    scores[DATA_POINTS.ESTIMATED_INPUT_LATENCY] = json.audits['estimated-input-latency'].numericValue
    scores[DATA_POINTS.ESTIMATED_INPUT_LATENCY_SCORE] = json.audits['estimated-input-latency'].score
    scores[DATA_POINTS.TOTAL_BLOCKING_TIME] = json.audits['total-blocking-time'].numericValue
    scores[DATA_POINTS.TOTAL_BLOCKING_TIME_SCORE] = json.audits['total-blocking-time'].score
    scores[DATA_POINTS.FIRST_CPU_IDLE] = json.audits['first-cpu-idle'].numericValue
    scores[DATA_POINTS.FIRST_CPU_IDLE_SCORE] = json.audits['first-cpu-idle'].score
    scores[DATA_POINTS.NETWORK_RTT] = json.audits['network-rtt'].numericValue
    scores[DATA_POINTS.NETWORK_RTT_SCORE] = json.audits['network-rtt'].score
    scores[DATA_POINTS.NETWORK_SERVER_LATENCY] = json.audits['network-server-latency'].numericValue
    scores[DATA_POINTS.NETWORK_SERVER_LATENCY_SCORE] = json.audits['network-server-latency'].score

    console.log(scores)
    return scores
  }

  const runLightHouseNtimes = async (n, passedUrl) => {
    let localResults = []
    for (let i = 0; i < n; i++) {
      console.log(`Running lighthouse on ${passedUrl} for the ${i + 1} time`)
      try {
        const result = await lighthouse(passedUrl, { port: PORT, disableStorageReset: true })
        localResults.push(getScores(result))
      } catch (e) {
        console.log(e)
        process.exit(1)
      }
    }
    return localResults
  }

  const runLightHouseOnPages = async (numberOfTimes, map) => {
    for (let key of map.keys()) {
      try {
        const result = await runLightHouseNtimes(numberOfTimes, map.get(key).url)
        map.set(key, { ...map.get(key), ...getFilterResults(result) })
      } catch (e) {
        console.log(e)
        process.exit(1)
      }
    }
    return map
  }

  const runLightHouseNtimesAndGetResults = async (numberOfTimes, passedUrl) => {
    // Comment executablePath while running in local
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/google-chrome',
      args: ['--no-sandbox', `--remote-debugging-port=${PORT}`]
    })
    let page = await browser.newPage()
    await page.setDefaultNavigationTimeout(300000) // 5 minutes timeout
    await page.goto(passedUrl)
    await page.waitForXPath("//div[contains(text(),'Sign in')]")
    const emailInput = await page.$('#email')
    await emailInput.type(emailId)
    const passwordInput = await page.$('#password')
    await passwordInput.type(passWord)
    await page.$eval('input[type="submit"]', form => form.click())
    await page.waitForNavigation()
    let baseUrl = ''
    if (page.url().includes('/ng/')) {
      await page.waitForXPath("//span[text()='Welcome']")
      baseUrl = page.url().split('/home')[0]
    } else {
      await page.waitForXPath("//span[text()='Main Dashboard']")
      baseUrl = url.concat(`#${page.url().split('#')[1].split('/dashboard')[0]}`)
    }
    const map = createMap(baseUrl)
    const results = await runLightHouseOnPages(numberOfTimes, map)
    await browser.close()
    return results
  }

  const compareWithBenchMarkResults = async (finalResultsInMap, envLocal) => {
    console.log(`Comparing benchmark results`, { finalResultsInMap })
    let hasError = false

    for (let [key, value] of finalResultsInMap) {
      let finalResults = value
      try {
        await dbConnection.createDatabaseAndTable()
        let benchMark = await dbConnection.getDataPastData(envLocal, key)
        console.log(`benchmark results for ${key}`, benchMark)

        let percentChange = percentageChangeInTwoParams(
          finalResults[DATA_POINTS.PERFORMANCE],
          benchMark[DATA_POINTS.PERFORMANCE],
          DATA_POINTS.PERFORMANCE
        )
        if (percentChange < -acceptableChange) {
          console.error(
            `${DATA_POINTS.PERFORMANCE} value of ${
              finalResults[DATA_POINTS.PERFORMANCE]
            } is  ${percentChange} %  less than expected ${benchMark[DATA_POINTS.PERFORMANCE]}`
          )
          hasError = true
        }
        percentChange = percentageChangeInTwoParams(
          finalResults[DATA_POINTS.ACCESSIBILITY],
          benchMark[DATA_POINTS.ACCESSIBILITY],
          DATA_POINTS.ACCESSIBILITY
        )
        if (percentChange < -acceptableChange) {
          console.error(
            `${DATA_POINTS.ACCESSIBILITY} value ${
              finalResults[DATA_POINTS.ACCESSIBILITY]
            } is  ${percentChange} %  less than expected ${benchMark[DATA_POINTS.ACCESSIBILITY]}`
          )
          hasError = true
        }
        percentChange = percentageChangeInTwoParams(
          finalResults[DATA_POINTS.BEST_PRACTICES],
          benchMark[DATA_POINTS.BEST_PRACTICES],
          DATA_POINTS.BEST_PRACTICES
        )
        if (percentChange < -acceptableChange) {
          console.error(
            `${DATA_POINTS.BEST_PRACTICES} value ${
              finalResults[DATA_POINTS.BEST_PRACTICES]
            } is  ${percentChange} %  less than expected ${benchMark[DATA_POINTS.BEST_PRACTICES]}`
          )
          hasError = true
        }
        percentChange = percentageChangeInTwoParams(
          finalResults[DATA_POINTS.FIRST_CONTENTFUL_PAINT],
          benchMark[DATA_POINTS.FIRST_CONTENTFUL_PAINT],
          DATA_POINTS.FIRST_CONTENTFUL_PAINT
        )
        if (percentChange > acceptableChange) {
          console.error(
            `${DATA_POINTS.FIRST_CONTENTFUL_PAINT} value ${
              finalResults[DATA_POINTS.FIRST_CONTENTFUL_PAINT]
            } is  ${percentChange} %  more than expected ${benchMark[DATA_POINTS.FIRST_CONTENTFUL_PAINT]}`
          )
          hasError = true
        }
        percentChange = percentageChangeInTwoParams(
          finalResults[DATA_POINTS.FIRST_MEANINGFUL_PAINT],
          benchMark[DATA_POINTS.FIRST_MEANINGFUL_PAINT],
          DATA_POINTS.FIRST_MEANINGFUL_PAINT
        )
        if (percentChange > acceptableChange) {
          console.error(
            `${DATA_POINTS.FIRST_CONTENTFUL_PAINT} value ${
              finalResults[DATA_POINTS.FIRST_MEANINGFUL_PAINT]
            } is ${percentChange} %  more than expected ${benchMark[DATA_POINTS.FIRST_MEANINGFUL_PAINT]}`
          )
          hasError = true
        }
        percentChange = percentageChangeInTwoParams(
          finalResults[DATA_POINTS.TIME_TO_INTERACTIVE],
          benchMark[DATA_POINTS.TIME_TO_INTERACTIVE],
          DATA_POINTS.TIME_TO_INTERACTIVE
        )
        if (percentChange > acceptableChange) {
          console.error(
            `${DATA_POINTS.TIME_TO_INTERACTIVE} value ${
              finalResults[DATA_POINTS.TIME_TO_INTERACTIVE]
            } is ${percentChange} %  more than expected ${benchMark[DATA_POINTS.TIME_TO_INTERACTIVE]}`
          )
          hasError = true
        }
      } catch (error) {
        console.error(error)
        console.log('failed in getting the benchmark data')
        process.exit(1)
      }
    }
    try {
      await dbConnection.insertDataintoDB(
        finalResultsInMap,
        env,
        process.env.OVER_WRITE_BENCHMARK_RESULT == 'true' || !hasError
      )
      console.log('database inserting done')
    } catch (error) {
      console.error(error)
      console.log('failed in inserting the data into database')
      process.exit(1)
    }
    if (hasError) {
      console.error('Failed in benchmark comparison')
      process.exit(1)
    } else {
      process.exit(0)
    }
  }

  let finalResults = await runLightHouseNtimesAndGetResults(lighthouseRunTimes, url)

  console.log(finalResults)
  compareWithBenchMarkResults(finalResults, env)
}
run()
