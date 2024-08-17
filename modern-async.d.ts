declare module "asyncIterableWrap" {
    export default asyncIterableWrap;
    function asyncIterableWrap<V>(iterable: Iterable<Promise<V> | V> | AsyncIterable<V>): AsyncIterable<V>;
}
declare module "asyncWrap" {
    export default asyncWrap;
    function asyncWrap(fct: Function): Function;
}
declare module "asyncRoot" {
    export default asyncRoot;
    function asyncRoot(fct: () => Promise<void> | void, errorHandler?: (reason: any) => void): Promise<void>;
}
declare module "CancelledError" {
    export default CancelledError;
    class CancelledError extends Error {
        constructor(message: string);
    }
}
declare module "Deferred" {
    export default Deferred;
    class Deferred<T> {
        get promise(): Promise<T>;
        get resolve(): (v: T) => void;
        get reject(): (v: any) => void;
    }
}
declare module "asyncDelayCancellable" {
    export default asyncDelayCancellable;
    function asyncDelayCancellable(): [Promise<void>, () => boolean];
}
declare module "asyncDelay" {
    export default asyncDelay;
    function asyncDelay(): Promise<void>;
}
declare module "Delayer" {
    export default Delayer;
    class Delayer {
        constructor(triggerTime: number);
        set triggerTime(arg: number);
        get triggerTime(): number;
        reset(): void;
        checkDelay(): Promise<boolean>;
    }
}
declare module "queueMicrotask" {
    export default queueMicrotask;
    function queueMicrotask(fct: () => void): void;
}
declare module "Queue" {
    export default Queue;
    class Queue {
        constructor(concurrency: number);
        get concurrency(): number;
        get running(): number;
        get pending(): number;
        exec<M>(fct: () => Promise<M> | M, priority?: number): Promise<M>;
        execCancellable<M>(fct: () => Promise<M> | M, priority?: number): [Promise<M>, () => boolean];
        cancelAllPending(): number;
    }
}
declare module "asyncEvery" {
    export default asyncEvery;
    function asyncEvery<V>(iterable: Iterable<Promise<V> | V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<Promise<V> | V> | AsyncIterable<V>) => Promise<boolean> | boolean, queueOrConcurrency?: Queue | number): Promise<boolean>;
    import Queue from "Queue";
}
declare module "asyncIterableToArray" {
    export default asyncIterableToArray;
    function asyncIterableToArray<V>(iterable: Iterable<Promise<V> | V> | AsyncIterable<V>): Promise<V[]>;
}
declare module "asyncGeneratorMap" {
    export default asyncGeneratorMap;
    function asyncGeneratorMap<V, M>(iterable: Iterable<Promise<V> | V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<Promise<V> | V> | AsyncIterable<V>) => Promise<M> | M, queueOrConcurrency?: Queue | number, ordered?: boolean): AsyncIterable<M>;
    import Queue from "Queue";
}
declare module "asyncGeneratorFilter" {
    export default asyncGeneratorFilter;
    function asyncGeneratorFilter<V>(iterable: Iterable<Promise<V> | V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<Promise<V> | V> | AsyncIterable<V>) => Promise<boolean> | boolean, queueOrConcurrency?: Queue | number, ordered?: boolean): AsyncIterable<V>;
    import Queue from "Queue";
}
declare module "asyncFilter" {
    export default asyncFilter;
    function asyncFilter<V>(iterable: Iterable<Promise<V> | V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<Promise<V> | V> | AsyncIterable<V>) => Promise<boolean> | boolean, queueOrConcurrency?: Queue | number): Promise<V[]>;
    import Queue from "Queue";
}
declare module "asyncFind" {
    export default asyncFind;
    function asyncFind<V>(iterable: Iterable<Promise<V> | V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<Promise<V> | V> | AsyncIterable<V>) => Promise<boolean> | boolean, queueOrConcurrency?: Queue | number, ordered?: boolean): Promise<V>;
    import Queue from "Queue";
}
declare module "asyncFindIndex" {
    export default asyncFindIndex;
    function asyncFindIndex<V>(iterable: Iterable<Promise<V> | V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<Promise<V> | V> | AsyncIterable<V>) => Promise<boolean> | boolean, queueOrConcurrency?: Queue | number, ordered?: boolean): Promise<number>;
    import Queue from "Queue";
}
declare module "asyncForEach" {
    export default asyncForEach;
    function asyncForEach<V>(iterable: Iterable<Promise<V> | V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<Promise<V> | V> | AsyncIterable<V>) => Promise<void> | void, queueOrConcurrency?: Queue | number): Promise<void>;
    import Queue from "Queue";
}
declare module "asyncMap" {
    export default asyncMap;
    function asyncMap<V, M>(iterable: Iterable<Promise<V> | V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<Promise<V> | V> | AsyncIterable<V>) => Promise<M> | M, queueOrConcurrency?: Queue | number): Promise<M[]>;
    import Queue from "Queue";
}
declare module "asyncReduce" {
    export default asyncReduce;
    function asyncReduce<V, A>(iterable: Iterable<Promise<V> | V> | AsyncIterable<V>, reducer: (accumulator: A, value: V, index: number, iterable: Iterable<Promise<V> | V> | AsyncIterable<V>) => Promise<A> | A, initial: A): Promise<A>;
    function asyncReduce<V>(iterable: Iterable<Promise<V> | V> | AsyncIterable<V>, reducer: (accumulator: V, value: V, index: number, iterable: Iterable<Promise<V> | V> | AsyncIterable<V>) => Promise<V> | V): Promise<V>;
}
declare module "asyncReduceRight" {
    export default asyncReduceRight;
    function asyncReduceRight<V, A>(iterable: Iterable<Promise<V> | V> | AsyncIterable<V>,reducer: (accumulator: A, value: V, index: number, iterable: Iterable<Promise<V> | V> | AsyncIterable<V>) => Promise<A> | A, initial: A): Promise<A>;
    function asyncReduceRight<V>(iterable: Iterable<Promise<V> | V> | AsyncIterable<V>, reducer: (accumulator: V, value: V, index: number, iterable: Iterable<Promise<V> | V> | AsyncIterable<V>) => Promise<V> | V): Promise<V>;
}
declare module "asyncSleepCancellable" {
    export default asyncSleepCancellable;
    function asyncSleepCancellable(amount: number): [Promise<void>, () => boolean];
}
declare module "Scheduler" {
    export default Scheduler;
    class Scheduler {
        constructor(fct: () => Promise<void> | void, delay: number, options?: {
            startImmediate?: boolean;
            concurrency?: number;
            maxPending?: number;
        });
        get delay(): number;
        get startImmediate(): boolean;
        get concurrency(): number;
        get maxPending(): number;
        get started(): boolean;
        start(): void;
        stop(): void;
    }
}
declare module "asyncSleep" {
    export default asyncSleep;
    function asyncSleep(amount: number): Promise<void>;
}
declare module "asyncSleepPreciseCancellable" {
    export default asyncSleepPreciseCancellable;
    function asyncSleepPreciseCancellable(amount: number): [Promise<void>, () => boolean];
}
declare module "asyncSleepPrecise" {
    export default asyncSleepPrecise;
    function asyncSleepPrecise(amount: number): Promise<void>;
}
declare module "asyncSome" {
    export default asyncSome;
    function asyncSome<V>(iterable: Iterable<Promise<V> | V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<Promise<V> | V> | AsyncIterable<V>) => Promise<boolean> | boolean, queueOrConcurrency?: Queue | number): Promise<boolean>;
    import Queue from "Queue";
}
declare module "TimeoutError" {
    export default TimeoutError;
    class TimeoutError extends Error {
        constructor(message: string);
    }
}
declare module "asyncTimeout" {
    export default asyncTimeout;
    function asyncTimeout<T>(fct: () => Promise<T> | T, amount: number): Promise<T>;
}
declare module "asyncTimeoutPrecise" {
    export default asyncTimeoutPrecise;
    function asyncTimeoutPrecise<T>(fct: () => Promise<T> | T, amount: number): Promise<T>;
}
declare module "reflectAsyncStatus" {
    export default reflectAsyncStatus;
    function reflectAsyncStatus<T>(fct: () => Promise<T> | T): Promise<PromiseSettledResult<T>>;
}
declare module "modern-async" {
    export { default as asyncIterableWrap } from "asyncIterableWrap";
    export { default as asyncRoot } from "asyncRoot";
    export { default as asyncWrap } from "asyncWrap";
    export { default as CancelledError } from "CancelledError";
    export { default as Deferred } from "Deferred";
    export { default as asyncDelay } from "asyncDelay";
    export { default as asyncDelayCancellable } from "asyncDelayCancellable";
    export { default as Delayer } from "Delayer";
    export { default as asyncEvery } from "asyncEvery";
    export { default as asyncFilter } from "asyncFilter";
    export { default as asyncGeneratorFilter } from "asyncGeneratorFilter";
    export { default as asyncFind } from "asyncFind";
    export { default as asyncFindIndex } from "asyncFindIndex";
    export { default as asyncForEach } from "asyncForEach";
    export { default as asyncMap } from "asyncMap";
    export { default as asyncGeneratorMap } from "asyncGeneratorMap";
    export { default as Queue } from "Queue";
    export { default as queueMicrotask } from "queueMicrotask";
    export { default as asyncReduce } from "asyncReduce";
    export { default as asyncReduceRight } from "asyncReduceRight";
    export { default as Scheduler } from "Scheduler";
    export { default as asyncSleep } from "asyncSleep";
    export { default as asyncSleepCancellable } from "asyncSleepCancellable";
    export { default as asyncSleepPrecise } from "asyncSleepPrecise";
    export { default as asyncSleepPreciseCancellable } from "asyncSleepPreciseCancellable";
    export { default as asyncSome } from "asyncSome";
    export { default as asyncTimeout } from "asyncTimeout";
    export { default as TimeoutError } from "TimeoutError";
    export { default as asyncTimeoutPrecise } from "asyncTimeoutPrecise";
    export { default as asyncIterableToArray } from "asyncIterableToArray";
    export { default as reflectAsyncStatus } from "reflectAsyncStatus";
}
