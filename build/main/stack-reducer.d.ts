export interface Action {
    type: any;
}
export declare type State<T extends string> = {
    stateId: T;
};
export declare type Stack<T extends State<K>, K extends string> = T[];
export declare const path: <T extends State<K>, K extends string>(stack: T[]) => string;
export declare const head: <T extends State<K>, K extends string>(stack: T[]) => T | undefined;
export declare const push: <T extends State<K>, K extends string>(stack: T[], ...state: T[]) => T[];
export declare const pop: <T extends State<K>, K extends string>(stack: T[]) => T[];
export declare const splitHead: <T extends State<K>, K extends string>(stack: T[]) => [T[], State<K> | undefined];
export declare const splitLastTwo: <T extends State<K>, K extends string>(stack: T[]) => [T[], State<K> | undefined, State<K> | undefined];
export declare const match: (path: string, query: string) => boolean;
export declare type StackReducer<T extends State<K>, K extends string, A extends Action> = (state: Stack<T, K>, action: A) => Stack<T, K>;
export declare type ReducersMap<T extends State<K>, K extends string, A extends Action> = {
    [key: string]: StackReducer<T, K, A>;
};
export declare const createStackReducer: <T extends State<K>, K extends string, A extends Action>(reducersMap: ReducersMap<T, K, A>) => StackReducer<T, K, A>;
