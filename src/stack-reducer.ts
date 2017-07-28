import * as minimatch from 'minimatch'

export interface Action {
  type: any
}

export type State<T extends string> = {
  stateId: T
}

export type Stack<T extends State<K>, K extends string> = T[]

export const path = <T extends State<K>, K extends string>(stack: Stack<T, K>) => {
  return stack.map(s => s.stateId).join('/')
}

export const head = <T extends State<K>, K extends string>(stack: Stack<T, K>) => {
  return stack.length ? stack[stack.length - 1] : undefined
}

export const push = <T extends State<K>, K extends string>(stack: Stack<T, K>, ...state: T[]): Stack<T, K> => {
  return [...stack, ...state]
}

export const pop = <T extends State<K>, K extends string>(stack: Stack<T, K>): Stack<T, K> => {
  return stack.slice(0, stack.length - 1)
}

export const splitHead = <T extends State<K>, K extends string>(stack: Stack<T, K>): [Stack<T, K>, (State<K> | undefined)] => {
  if (stack.length > 0) {
    return [stack.slice(0, stack.length - 1), stack[stack.length - 1]]
  } else {
    return [[], undefined]
  }
}

export const splitLastTwo = <T extends State<K>, K extends string>(stack: Stack<T, K>): [Stack<T, K>, (State<K> | undefined), (State<K> | undefined)] => {
  if (stack.length >= 2) {
    return [stack.slice(0, stack.length - 2), stack[stack.length - 2], stack[stack.length - 1]]
  } else if (stack.length === 1) {
    return [[], undefined, stack[0]]
  } else {
    return [[], undefined, undefined]
  }
}

export const match = (path: string, query: string) => {
  return minimatch(path, query)
}

export type StackReducer<T extends State<K>, K extends string, A extends Action> = (state: Stack<T, K>, action: A) => Stack<T, K>

export type ReducersMap<T extends State<K>, K extends string, A extends Action> = {
  [key: string]: StackReducer<T, K, A>
}

export const createStackReducer = <T extends State<K>, K extends string, A extends Action>(reducersMap: ReducersMap<T, K, A>): StackReducer<T, K, A> => (state: Stack<T, K> = [], action: A): Stack<T, K> => {
  let prevState = undefined
  let iterations = 0
  while (true) {
    if (prevState === state) return state
    ++iterations
    prevState = state
    state = Object.keys(reducersMap).reduce((acc, query) => match(path(state), query) ? reducersMap[query](acc, action) : acc, state)
  }
}
