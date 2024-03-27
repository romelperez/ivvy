import type { IvvyWritable } from '../types.js'

const createWritable = <Data>(initial: Data): IvvyWritable<Data> => {
  const subscribers = new Set<(data: Data) => void>()

  let state = initial

  const get = (): Data => state

  const set = (data: Data): void => {
    if (data !== state) {
      state = data
      subscribers.forEach((subscriber) => {
        subscriber(state)
      })
    }
  }

  const subscribe = (subscriber: (data: Data) => void): (() => void) => {
    subscribers.add(subscriber)
    subscriber(state)

    return () => {
      subscribers.delete(subscriber)
    }
  }

  return Object.freeze({ get, set, subscribe })
}

export { createWritable }
