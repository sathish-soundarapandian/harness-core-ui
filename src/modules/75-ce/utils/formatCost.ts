/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

interface FormatCostOptions {
  currency?: string
  locale?: string
  style?: string
  decimalPoints?: number
  shortFormat?: boolean
}

type FormatCost = (value: number, options?: FormatCostOptions) => string

const defaultOptions = {
  style: 'currency',
  shortFormat: false,
  currency: 'USD',
  locale: 'en-us',
  decimalPoints: 2
}

const TOTAL_DIGITS_TO_SHOW = 3
const POWER_OF_TEN_IN_BILLION = 9
const POWER_OF_TEN_IN_MILLION = 6
const POWER_OF_TEN_IN_THOUSANDS = 3

type convertNumberToLocaleStringType = (
  value: number,
  locale: string,
  style: string,
  currency: string,
  maximumFractionDigits: number,
  minimumFractionDigits: number
) => string

const convertNumberToLocaleString: convertNumberToLocaleStringType = (
  value,
  locale,
  style,
  currency,
  maximumFractionDigits,
  minimumFractionDigits
) =>
  value.toLocaleString(locale, {
    style,
    currency,
    maximumFractionDigits,
    minimumFractionDigits
  })

const formatCost: FormatCost = (value: number, options?: FormatCostOptions) => {
  const costOptions = { ...defaultOptions, ...options }
  if (isNaN(value)) {
    return ''
  }

  const getCostInShortFormat = (power: number, cost: number, suffix: string, numberOfDigits: number) => {
    const decimalPlacesToHave = Math.max(power + TOTAL_DIGITS_TO_SHOW - numberOfDigits, 0)
    return (
      convertNumberToLocaleString(
        cost / Math.pow(10, power),
        costOptions.locale,
        costOptions.style,
        costOptions.currency,
        decimalPlacesToHave,
        decimalPlacesToHave
      ) + suffix
    )
  }

  /**
    Option shortFormat will convert the cost as mentioned below -
    2,345,456 as $2.34M
    12,345,456 as $12.3M
    123,456,789 as $123M
    and so on for thousands and billions
  */
  if (costOptions.shortFormat) {
    const numberOfDigits = value.toFixed(0).length
    if (numberOfDigits > POWER_OF_TEN_IN_BILLION) {
      return getCostInShortFormat(POWER_OF_TEN_IN_BILLION, value, 'B', numberOfDigits)
    }

    if (numberOfDigits > 6) {
      return getCostInShortFormat(POWER_OF_TEN_IN_MILLION, value, 'M', numberOfDigits)
    }

    if (numberOfDigits > 3) {
      return getCostInShortFormat(POWER_OF_TEN_IN_THOUSANDS, value, 'K', numberOfDigits)
    }
  }

  return convertNumberToLocaleString(
    value,
    costOptions.locale,
    costOptions.style,
    costOptions.currency,
    costOptions.decimalPoints,
    costOptions.decimalPoints
  )
}

export default formatCost
