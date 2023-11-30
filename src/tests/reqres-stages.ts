import { SharedArray } from 'k6/data'
import { vu } from 'k6/execution'
import { Options } from 'k6/options'
import { deleteUser, getUser, updateUser } from '../apis/reqres'
import { users } from '../data/users'
import { logger } from '../utils/logger'
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js'

const data = new SharedArray('users', function () {
  return users
})

export const options: Options = {
  stages: [
    // Ramp up to 12 users over 30 seconds
    { duration: '1m', target: 12 },
    // Maintain steady state of 12 users over the next two minutes
    { duration: '2m', target: 12 },
    // Ramp down to 0 users over the next 30 seconds
    { duration: '30s', target: 0 }
  ]
}

export default function test() {
  // Get a random user from data that isn't currently being tested
  const user = data[vu.idInTest - 1]

  logger.info(`Running iteration ${vu.iterationInInstance} for user id ${user.id} with name ${user.first_name} ${user.last_name}`)

  getUser(user)
  updateUser(user)
  deleteUser(user.id)
}
export function handleSummary(data) {
  console.log(`Metrics for error codes: ${JSON.stringify(data.metrics['error codes'].values)}`)
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    './summary.json': JSON.stringify(data)
  }
}
