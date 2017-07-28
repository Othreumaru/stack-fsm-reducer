import { expect } from 'chai'
import {
  createStackReducer,
  path,
  head,
  push,
  pop,
  match,
  splitHead,
  splitLastTwo, StackReducer, State, Action
} from './stack-reducer'

describe('stack-reducer', () => {

  describe('head', () => {
    it('should return last state', () => {
      const headResult = head([{stateId: 'one'}, {stateId: 'two'}])
      expect(headResult).to.deep.equal({stateId: 'two'})
    })

    it('should return handle empty array', () => {
      const headResult = head([])
      expect(headResult).to.equal(undefined)
    })
  })

  describe('splitHead', () => {
    it('should split array into body and head', () => {
      const [tail, head] = splitHead([{stateId: 'one'}, {stateId: 'two'}, {stateId: 'three'}, {stateId: 'four'}, {stateId: 'five'}])
      expect(tail).to.deep.equal([{stateId: 'one'}, {stateId: 'two'}, {stateId: 'three'}, {stateId: 'four'}])
      expect(head).to.deep.equal({stateId: 'five'})
    })

    it('should split single element array', () => {
      const [tail, head] = splitHead([{stateId: 'one'}])
      expect(tail).to.deep.equal([])
      expect(head).to.deep.equal({stateId: 'one'})
    })

    it('should split empty array', () => {
      const [tail, head] = splitHead([])
      expect(tail).to.deep.equal([])
      expect(head).to.deep.equal(undefined)
    })
  })

  describe('splitLastTwo', () => {
    it('should split last two elements', () => {
      const [tail, neck, head] = splitLastTwo([{stateId: 'one'}, {stateId: 'two'}, {stateId: 'three'}, {stateId: 'four'}, {stateId: 'five'}])
      expect(tail).to.deep.equal([{stateId: 'one'}, {stateId: 'two'}, {stateId: 'three'}])
      expect(neck).to.deep.equal({stateId: 'four'})
      expect(head).to.deep.equal({stateId: 'five'})
    })

    it('should split two element array', () => {
      const [tail, neck, head] = splitLastTwo([{stateId: 'one'}, {stateId: 'two'}])
      expect(tail).to.deep.equal([])
      expect(neck).to.deep.equal({stateId: 'one'})
      expect(head).to.deep.equal({stateId: 'two'})
    })

    it('should split single element array', () => {
      const [tail, neck, head] = splitLastTwo([{stateId: 'one'}])
      expect(tail).to.deep.equal([])
      expect(neck).to.deep.equal(undefined)
      expect(head).to.deep.equal({stateId: 'one'})
    })

    it('should split empty array', () => {
      const [tail, neck, head] = splitLastTwo([])
      expect(tail).to.deep.equal([])
      expect(neck).to.equal(undefined)
      expect(head).to.equal(undefined)
    })
  })

  describe('getStackPath', () => {
    it('should return path of joined stateId separated by /', () => {
      const pathResult = path([{stateId: 'state1'}, {stateId: 'state2'}, {stateId: 'state3'}])
      expect(pathResult).to.equal('state1/state2/state3')
    })

    it('should return empty string on empty array', () => {
      const pathResult = path([])
      expect(pathResult).to.equal('')
    })
  })

  describe('push', () => {
    it('should push element to the stack', () => {
      type states = 'state1' | 'state2' | 'state3'
      const stack = push<any, states>([{stateId: 'state1'}], {stateId: 'state2'}, {stateId: 'state3'})
      expect(path(stack)).to.equal('state1/state2/state3')
    })
  })

  describe('pop', () => {
    it('should pop element from the stack', () => {
      const stack = pop([{stateId: 'state1'}, {stateId: 'state2'}, {stateId: 'state3'}])
      expect(path(stack)).to.equal('state1/state2')
    })
  })

  describe('match', () => {
    it('should match simple path', () => {
      const result = match('stateId1/stateId2', 'stateId1/stateId2')
      expect(result).to.equal(true)
    })

    it('should match glob path', () => {
      const result = match('stateId1/stateId2', '**/stateId2')
      expect(result).to.equal(true)
    })
  })

  describe('createStackReducer', () => {
    it('should run trough map of reducers', () => {

      type INIT_STATE_ID = ''
      type SETUP_STATE_ID = 'setup'
      type QUERY_STATE_ID = 'query' | '**/query'
      type QUERY_OPTION_STATE_ID = 'queryOption' | '**/queryOption'

      type AllStateId = INIT_STATE_ID | SETUP_STATE_ID | QUERY_STATE_ID | QUERY_OPTION_STATE_ID

      interface SetupState<K extends string> extends State<K> {
        playerName?: string
        classId?: string
      }

      interface QueryState<K extends string> extends State<K> {
        query: string
        writeTo: string
      }

      interface QueryOptionState<K extends string> extends State<K> {
        query: string
        options: string[]
        writeTo: string
      }

      interface QueryResponseAction extends Action {
        response: string
      }

      interface QueryOptionResponseAction extends Action {
        optionId: number
      }

      type AllStates<K extends string> = (SetupState<K> | QueryState<K> | QueryOptionState<K>)
      type AllActions = QueryResponseAction | QueryOptionResponseAction | Action

      const initReducer: StackReducer<AllStates<AllStateId>, AllStateId, AllActions> = (stack) => push(stack, {stateId: 'setup'})

      const setupReducer: StackReducer<AllStates<AllStateId>, AllStateId, AllActions> = (stack) => {
        const setupState = head(stack) as (SetupState<SETUP_STATE_ID> | undefined)
        if (setupState && setupState.playerName === undefined) {
          const queryState: QueryState<QUERY_STATE_ID> = {
            stateId: 'query',
            query: 'Please enter your name',
            writeTo: 'playerName'
          }

          return push(stack, queryState)
        } else if (setupState && setupState.classId === undefined) {
          const queryOptionState: QueryOptionState<QUERY_OPTION_STATE_ID> = {
            stateId: 'queryOption',
            query: 'Please select your class',
            options: ['mage', 'druid'],
            writeTo: 'classId'
          }
          return push(stack, queryOptionState)
        } else {
          return stack
        }
      }

      const queryReducer: StackReducer<AllStates<AllStateId>, AllStateId, AllActions> = (stack, action) => {
        const {type, response} = action as QueryResponseAction
        if (type === 'QUERY_RESPONSE') {
          const [tail, neck, head] = splitLastTwo(stack)
          const queryState = head as QueryState<QUERY_OPTION_STATE_ID>
          const prevState = {...(neck as any), [queryState.writeTo]: response}
          return [...tail, prevState]
        }
        return stack
      }

      const queryOptionReducer: StackReducer<AllStates<AllStateId>, AllStateId, AllActions> = (stack, action) => {
        const {type, optionId} = action as QueryOptionResponseAction
        if (type === 'QUERY_OPTION_RESPONSE') {
          const [tail, neck, head] = splitLastTwo(stack)
          const queryOptionState = head as QueryOptionState<QUERY_OPTION_STATE_ID>
          const prevState = {...(neck as any), [queryOptionState.writeTo]: queryOptionState.options[optionId]}
          return [...tail, prevState]
        }
        return stack
      }

      const stackReducer = createStackReducer({
        '': initReducer,
        'setup': setupReducer,
        '**/query': queryReducer,
        '**/queryOption': queryOptionReducer
      })

      const NON_EXISTING_ACTION = {type: 'NOT_EXISTING_ACTION'}
      const QUERY_RESPONSE = {type: 'QUERY_RESPONSE', response: 'John Smith'}
      const QUERY_OPTION_RESPONSE = {type: 'QUERY_OPTION_RESPONSE', optionId: 1}

      let state = stackReducer([], NON_EXISTING_ACTION)

      expect(path(state)).to.equal('setup/query')
      expect((head(state) as QueryState<QUERY_STATE_ID>).query).to.equal('Please enter your name')
      expect((head(state) as QueryState<QUERY_STATE_ID>).writeTo).to.equal('playerName')

      state = stackReducer(state, NON_EXISTING_ACTION)

      expect(path(state)).to.equal('setup/query')
      expect((head(state) as QueryState<QUERY_STATE_ID>).query).to.equal('Please enter your name')
      expect((head(state) as QueryState<QUERY_STATE_ID>).writeTo).to.equal('playerName')

      state = stackReducer(state, QUERY_RESPONSE)

      expect(path(state)).to.equal('setup/queryOption')
      expect((head(state) as QueryOptionState<QUERY_STATE_ID>).query).to.equal('Please select your class')
      expect((head(state) as QueryOptionState<QUERY_STATE_ID>).options).to.deep.equal(['mage', 'druid'])
      expect((head(state) as QueryOptionState<QUERY_STATE_ID>).writeTo).to.equal('classId')

      state = stackReducer(state, QUERY_OPTION_RESPONSE)

      expect(path(state)).to.equal('setup')
      expect((head(state) as SetupState<SETUP_STATE_ID>).playerName).to.equal('John Smith')
      expect((head(state) as SetupState<SETUP_STATE_ID>).classId).to.equal('druid')

      state = stackReducer(state, NON_EXISTING_ACTION)

      expect(path(state)).to.equal('setup')
      expect((head(state) as SetupState<SETUP_STATE_ID>).playerName).to.equal('John Smith')
      expect((head(state) as SetupState<SETUP_STATE_ID>).classId).to.equal('druid')
    })
  })

})
