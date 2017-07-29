# stack-fsm-reducer
This is simple implementation of stack based finite state machine.

#Instalation
using npm:
```
npm i stack-fsm-reducer --save
```
or using yarn:
```
yarn add stack-fsm-reducer
```
#Motivation

Classic FSM allows you only to transition between states without keeping track of previous states.
This reducer can be used to implement the wizard dialog. Let say you have to fill out some data on each stage, and you are not allowed to go to the next 
form until you finish filling out all fields on current form. Such mechanism can be perfectly described using Stack FSM.

#Example

Let say we are trying to do a RPG game and we need player to define a race of his character and class, not all races can be mages so we need to be sure that we are not presenting to the user wrong options.

```javascript
const state = { 
  raceId: undefined,
  classId: undefined  
}
```

Now we want to: 

1. Enter ``Setup`` state
2. Ask user to fill in ``raceId``, stay in this state until he finishes the job
4. Pass the raceId to the next state
3. Ask user to select ``classId``, stay in this state until he finishes selection.
4. Pass both ``raceId`` and ``classId`` to the next state


Because each state must know to which state transition next it might be difficult to write reusable composable code.

We can do better. Imagine that we could somehow remember from which state we are coming and return to that state with the data retrieved from the user.
This can be achieved using Stack FSM, a natural evolution of FSM.

Instead of just switching to a new state we will push the state to a stack. 

So we will do:

1. Push ``Setup`` state to stack which will contain our properties to fill out.
2. If ``raceId`` is undefined, push ``QueryInput`` state to stack initialized with some query data.
3. Stay in ``QueryInput`` until user sends ``onResponse`` action with selected data.
4. If user sends valid ``onResponse`` action pop current state from stack going back to ``Setup`` state filling out ``raceId`` in that state
5. If ``raceId`` is **not** undefined and ``classId`` is undefined, push once again ``QueryInput`` to the stack filling out the state with the query data
6. Stay in ``QueryInput`` until user sends ``onResponse`` action with selected data.
7. If user sends valid ``onResponse`` action pop current state from stack going back to ``Setup`` state filling out ``classId`` in that state
8. Finally if both ``raceId`` and ``classId`` is **not** undefined in we can replace current state with ``Game`` state, filling that state with ``raceId`` and ``classId``

Notice how ``QueryInput`` can be reused in this example.


Create stack FSM reducer:

```javascript
import {createStackReducer, head, push, pop, splitLastTwo} from 'stack-fsm-reducer'

const stackFSMReducer = createStackReducer(mapOfStates)
```

Define map of states to reducers. Notice:

1. Initial state is just empty string
2. Each state must have stateId property
3. If you want to match exactly stack with 2 states you need to separate state ids with /

```javascript
const mapOfStates = {
  '':(state)=>push(state, {stateId: 'setup', raceId:undefined, classId:undefined}),
  'setup':setupReducer,
  'setup/queryInput':queryInputReducer, 
  'game':gameReducer
}
```
Define state reducers:

```javascript
const setupReducer = (state, action) => {
  const setupState = head(state)
  if(setupState.raceId === undefined){
    return push(state, {stateId: 'queryInput', query: 'Please enter raceId', options:['human', 'dwarf', 'orc'], writeResponseTo: 'raceId'})
  } else if(setupState.classId === undefined){
    let classOptions
    if(setupState.raceId === 'orc'){
      classOptions = ['warrior', 'warlock']
    } else if(setupState.raceId === 'human'){
      classOptions = ['warrior', 'paladin' ,'mage']
    } else {
      classOptions = ['warrior', 'paladin']
    }
    return push(state, {stateId: 'queryInput', query: 'Please enter classId', options:classOptions, writeResponseTo: 'classId'})
  } else if(setupState.raceId  && setupState.classId) {
    return push(pop(state), {stateId:'game', raceId: setupState.raceId, classId:setupState.classId })
  }
}

const queryInputReducer = (state, action) => {
  switch(action.type){
    case 'onResponse': {
      const [tail, prevState, queryInputState] = splitLastTwo(stack)
      const newPrevState = {
        ...prevState, 
        [queryInputState.writeResponseTo]: queryInputState.options[action.optionId]
      }
      return [...tail, newPrevState]
    }
    default: return state;
  }
}

const gameReducer = (state, action) => {
  //implementation of the game
}
```

Notice couple of things, stackFSMReducer expects state to be JavaScript array, This library comes with selection of useful functions to manipulate the stack, but since stack is just an array you can use VanillaJS to work with it.
You can create infinite loop, be careful with the definition of state transitions.

Inside map of states you can use ``minimatch`` like for example:

```javascript
const mapOfStates = {
  '**/setup':setupReducer,
  '**/queryInput':queryInputReducer,
  '**/game':gameReducer
}
```

This way you can reuse your reducers no matter the state of the stack.

#License

MIT