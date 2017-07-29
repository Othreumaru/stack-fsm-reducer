"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const stack_reducer_1 = require("./stack-reducer");
describe('stack-reducer', () => {
    describe('head', () => {
        it('should return last state', () => {
            const headResult = stack_reducer_1.head([{ stateId: 'one' }, { stateId: 'two' }]);
            chai_1.expect(headResult).to.deep.equal({ stateId: 'two' });
        });
        it('should return handle empty array', () => {
            const headResult = stack_reducer_1.head([]);
            chai_1.expect(headResult).to.equal(undefined);
        });
    });
    describe('splitHead', () => {
        it('should split array into body and head', () => {
            const [tail, head] = stack_reducer_1.splitHead([{ stateId: 'one' }, { stateId: 'two' }, { stateId: 'three' }, { stateId: 'four' }, { stateId: 'five' }]);
            chai_1.expect(tail).to.deep.equal([{ stateId: 'one' }, { stateId: 'two' }, { stateId: 'three' }, { stateId: 'four' }]);
            chai_1.expect(head).to.deep.equal({ stateId: 'five' });
        });
        it('should split single element array', () => {
            const [tail, head] = stack_reducer_1.splitHead([{ stateId: 'one' }]);
            chai_1.expect(tail).to.deep.equal([]);
            chai_1.expect(head).to.deep.equal({ stateId: 'one' });
        });
        it('should split empty array', () => {
            const [tail, head] = stack_reducer_1.splitHead([]);
            chai_1.expect(tail).to.deep.equal([]);
            chai_1.expect(head).to.deep.equal(undefined);
        });
    });
    describe('splitLastTwo', () => {
        it('should split last two elements', () => {
            const [tail, neck, head] = stack_reducer_1.splitLastTwo([{ stateId: 'one' }, { stateId: 'two' }, { stateId: 'three' }, { stateId: 'four' }, { stateId: 'five' }]);
            chai_1.expect(tail).to.deep.equal([{ stateId: 'one' }, { stateId: 'two' }, { stateId: 'three' }]);
            chai_1.expect(neck).to.deep.equal({ stateId: 'four' });
            chai_1.expect(head).to.deep.equal({ stateId: 'five' });
        });
        it('should split two element array', () => {
            const [tail, neck, head] = stack_reducer_1.splitLastTwo([{ stateId: 'one' }, { stateId: 'two' }]);
            chai_1.expect(tail).to.deep.equal([]);
            chai_1.expect(neck).to.deep.equal({ stateId: 'one' });
            chai_1.expect(head).to.deep.equal({ stateId: 'two' });
        });
        it('should split single element array', () => {
            const [tail, neck, head] = stack_reducer_1.splitLastTwo([{ stateId: 'one' }]);
            chai_1.expect(tail).to.deep.equal([]);
            chai_1.expect(neck).to.deep.equal(undefined);
            chai_1.expect(head).to.deep.equal({ stateId: 'one' });
        });
        it('should split empty array', () => {
            const [tail, neck, head] = stack_reducer_1.splitLastTwo([]);
            chai_1.expect(tail).to.deep.equal([]);
            chai_1.expect(neck).to.equal(undefined);
            chai_1.expect(head).to.equal(undefined);
        });
    });
    describe('getStackPath', () => {
        it('should return path of joined stateId separated by /', () => {
            const pathResult = stack_reducer_1.path([{ stateId: 'state1' }, { stateId: 'state2' }, { stateId: 'state3' }]);
            chai_1.expect(pathResult).to.equal('state1/state2/state3');
        });
        it('should return empty string on empty array', () => {
            const pathResult = stack_reducer_1.path([]);
            chai_1.expect(pathResult).to.equal('');
        });
    });
    describe('push', () => {
        it('should push element to the stack', () => {
            const stack = stack_reducer_1.push([{ stateId: 'state1' }], { stateId: 'state2' }, { stateId: 'state3' });
            chai_1.expect(stack_reducer_1.path(stack)).to.equal('state1/state2/state3');
        });
    });
    describe('pop', () => {
        it('should pop element from the stack', () => {
            const stack = stack_reducer_1.pop([{ stateId: 'state1' }, { stateId: 'state2' }, { stateId: 'state3' }]);
            chai_1.expect(stack_reducer_1.path(stack)).to.equal('state1/state2');
        });
    });
    describe('match', () => {
        it('should match simple path', () => {
            const result = stack_reducer_1.match('stateId1/stateId2', 'stateId1/stateId2');
            chai_1.expect(result).to.equal(true);
        });
        it('should match glob path', () => {
            const result = stack_reducer_1.match('stateId1/stateId2', '**/stateId2');
            chai_1.expect(result).to.equal(true);
        });
    });
    describe('createStackReducer', () => {
        it('should run trough map of reducers', () => {
            const initReducer = (stack) => stack_reducer_1.push(stack, { stateId: 'setup' });
            const setupReducer = (stack) => {
                const setupState = stack_reducer_1.head(stack);
                if (setupState && setupState.playerName === undefined) {
                    const queryState = {
                        stateId: 'query',
                        query: 'Please enter your name',
                        writeTo: 'playerName'
                    };
                    return stack_reducer_1.push(stack, queryState);
                }
                else if (setupState && setupState.classId === undefined) {
                    const queryOptionState = {
                        stateId: 'queryOption',
                        query: 'Please select your class',
                        options: ['mage', 'druid'],
                        writeTo: 'classId'
                    };
                    return stack_reducer_1.push(stack, queryOptionState);
                }
                else {
                    return stack;
                }
            };
            const queryReducer = (stack, action) => {
                const { type, response } = action;
                if (type === 'QUERY_RESPONSE') {
                    const [tail, neck, head] = stack_reducer_1.splitLastTwo(stack);
                    const queryState = head;
                    const prevState = Object.assign({}, neck, { [queryState.writeTo]: response });
                    return [...tail, prevState];
                }
                return stack;
            };
            const queryOptionReducer = (stack, action) => {
                const { type, optionId } = action;
                if (type === 'QUERY_OPTION_RESPONSE') {
                    const [tail, neck, head] = stack_reducer_1.splitLastTwo(stack);
                    const queryOptionState = head;
                    const prevState = Object.assign({}, neck, { [queryOptionState.writeTo]: queryOptionState.options[optionId] });
                    return [...tail, prevState];
                }
                return stack;
            };
            const stackReducer = stack_reducer_1.createStackReducer({
                '': initReducer,
                'setup': setupReducer,
                '**/query': queryReducer,
                '**/queryOption': queryOptionReducer
            });
            const NON_EXISTING_ACTION = { type: 'NOT_EXISTING_ACTION' };
            const QUERY_RESPONSE = { type: 'QUERY_RESPONSE', response: 'John Smith' };
            const QUERY_OPTION_RESPONSE = { type: 'QUERY_OPTION_RESPONSE', optionId: 1 };
            let state = stackReducer([], NON_EXISTING_ACTION);
            chai_1.expect(stack_reducer_1.path(state)).to.equal('setup/query');
            chai_1.expect(stack_reducer_1.head(state).query).to.equal('Please enter your name');
            chai_1.expect(stack_reducer_1.head(state).writeTo).to.equal('playerName');
            state = stackReducer(state, NON_EXISTING_ACTION);
            chai_1.expect(stack_reducer_1.path(state)).to.equal('setup/query');
            chai_1.expect(stack_reducer_1.head(state).query).to.equal('Please enter your name');
            chai_1.expect(stack_reducer_1.head(state).writeTo).to.equal('playerName');
            state = stackReducer(state, QUERY_RESPONSE);
            chai_1.expect(stack_reducer_1.path(state)).to.equal('setup/queryOption');
            chai_1.expect(stack_reducer_1.head(state).query).to.equal('Please select your class');
            chai_1.expect(stack_reducer_1.head(state).options).to.deep.equal(['mage', 'druid']);
            chai_1.expect(stack_reducer_1.head(state).writeTo).to.equal('classId');
            state = stackReducer(state, QUERY_OPTION_RESPONSE);
            chai_1.expect(stack_reducer_1.path(state)).to.equal('setup');
            chai_1.expect(stack_reducer_1.head(state).playerName).to.equal('John Smith');
            chai_1.expect(stack_reducer_1.head(state).classId).to.equal('druid');
            state = stackReducer(state, NON_EXISTING_ACTION);
            chai_1.expect(stack_reducer_1.path(state)).to.equal('setup');
            chai_1.expect(stack_reducer_1.head(state).playerName).to.equal('John Smith');
            chai_1.expect(stack_reducer_1.head(state).classId).to.equal('druid');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhY2stcmVkdWNlci5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3N0YWNrLXJlZHVjZXIuc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUE2QjtBQUM3QixtREFTd0I7QUFFeEIsUUFBUSxDQUFDLGVBQWUsRUFBRTtJQUV4QixRQUFRLENBQUMsTUFBTSxFQUFFO1FBQ2YsRUFBRSxDQUFDLDBCQUEwQixFQUFFO1lBQzdCLE1BQU0sVUFBVSxHQUFHLG9CQUFJLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUE7WUFDN0QsYUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUMsT0FBTyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUE7UUFDcEQsQ0FBQyxDQUFDLENBQUE7UUFFRixFQUFFLENBQUMsa0NBQWtDLEVBQUU7WUFDckMsTUFBTSxVQUFVLEdBQUcsb0JBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUMzQixhQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUN4QyxDQUFDLENBQUMsQ0FBQTtJQUNKLENBQUMsQ0FBQyxDQUFBO0lBRUYsUUFBUSxDQUFDLFdBQVcsRUFBRTtRQUNwQixFQUFFLENBQUMsdUNBQXVDLEVBQUU7WUFDMUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyx5QkFBUyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBQyxPQUFPLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBQyxPQUFPLEVBQUUsT0FBTyxFQUFDLEVBQUUsRUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFDLENBQUMs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