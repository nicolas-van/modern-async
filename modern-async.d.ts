declare module "asyncIterableWrap" {
    export default asyncIterableWrap;
    function asyncIterableWrap<T>(iterable: Iterable<T> | AsyncIterable<T>): AsyncIterable<T>;
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
declare module "delayCancellable" {
    export default delayCancellable;
    function delayCancellable(): [Promise<void>, () => boolean];
}
declare module "delay" {
    export default delay;
    function delay(): Promise<void>;
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
declare module "findIndexLimit" {
    export default findIndexLimit;
    function findIndexLimit<V>(iterable: Iterable<V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<V> | AsyncIterable<V>) => Promise<boolean> | boolean, queueOrConcurrency: Queue | number, ordered?: boolean): Promise<number>;
    import Queue from "Queue";
}
declare module "everyLimit" {
    export default everyLimit;
    function everyLimit<V>(iterable: Iterable<V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<V> | AsyncIterable<V>) => Promise<boolean> | boolean, queueOrConcurrency: Queue | number): Promise<boolean>;
    import Queue from "Queue";
}
declare module "every" {
    export default every;
    function every<V>(iterable: Iterable<V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<V> | AsyncIterable<V>) => Promise<boolean> | boolean): Promise<boolean>;
}
declare module "everySeries" {
    export default everySeries;
    function everySeries<V>(iterable: Iterable<V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<V> | AsyncIterable<V>) => Promise<boolean> | boolean): Promise<boolean>;
}
declare module "toArray" {
    export default toArray;
    function toArray<V>(iterable: Iterable<V> | AsyncIterable<V>): Promise<V[]>;
}
declare module "mapGenerator" {
    export default mapGenerator;
    function mapGenerator<V, M>(iterable: Iterable<V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<V> | AsyncIterable<V>) => Promise<M> | M, queueOrConcurrency?: Queue | number, ordered?: boolean): AsyncIterable<M>;
    import Queue from "Queue";
}
declare module "filterGenerator" {
    export default filterGenerator;
    function filterGenerator<V>(iterable: Iterable<V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<V> | AsyncIterable<V>) => Promise<boolean> | boolean, queueOrConcurrency?: Queue | number, ordered?: boolean): AsyncIterable<V>;
    import Queue from "Queue";
}
declare module "filterLimit" {
    export default filterLimit;
    function filterLimit<V>(iterable: Iterable<V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<V> | AsyncIterable<V>) => Promise<boolean> | boolean, queueOrConcurrency: Queue | number): Promise<V[]>;
    import Queue from "Queue";
}
declare module "filter" {
    export default filter;
    function filter<V>(iterable: Iterable<V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<V> | AsyncIterable<V>) => Promise<boolean> | boolean): Promise<V[]>;
}
declare module "filterSeries" {
    export default filterSeries;
    function filterSeries<V>(iterable: Iterable<V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<V> | AsyncIterable<V>) => Promise<boolean> | boolean): Promise<V[]>;
}
declare module "findLimit" {
    export default findLimit;
    function findLimit<V>(iterable: Iterable<V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<V> | AsyncIterable<V>) => Promise<boolean> | boolean, queueOrConcurrency: Queue | number, ordered?: boolean): Promise<V>;
    import Queue from "Queue";
}
declare module "find" {
    export default find;
    function find<V>(iterable: Iterable<V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<V> | AsyncIterable<V>) => Promise<boolean> | boolean, ordered?: boolean): Promise<V>;
}
declare module "findIndex" {
    export default findIndex;
    function findIndex<V>(iterable: Iterable<V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<V> | AsyncIterable<V>) => Promise<boolean> | boolean, ordered?: boolean): Promise<number>;
}
declare module "findIndexSeries" {
    export default findIndexSeries;
    function findIndexSeries<V>(iterable: Iterable<V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<V> | AsyncIterable<V>) => Promise<boolean> | boolean): Promise<number>;
}
declare module "findSeries" {
    export default findSeries;
    function findSeries<V>(iterable: Iterable<V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<V> | AsyncIterable<V>) => Promise<boolean> | boolean): Promise<V>;
}
declare module "forEachLimit" {
    export default forEachLimit;
    function forEachLimit<V>(iterable: Iterable<V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<V> | AsyncIterable<V>) => Promise<void> | void, queueOrConcurrency: Queue | number): Promise<void>;
    import Queue from "Queue";
}
declare module "forEach" {
    export default forEach;
    function forEach<V>(iterable: Iterable<V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<V> | AsyncIterable<V>) => Promise<void> | void): Promise<void>;
}
declare module "forEachSeries" {
    export default forEachSeries;
    function forEachSeries<V>(iterable: Iterable<V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<V> | AsyncIterable<V>) => Promise<void> | void): Promise<void>;
}
declare module "mapLimit" {
    export default mapLimit;
    function mapLimit<V, M>(iterable: Iterable<V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<V> | AsyncIterable<V>) => Promise<M> | M, queueOrConcurrency: Queue | number): Promise<M[]>;
    import Queue from "Queue";
}
declare module "map" {
    export default map;
    function map<V, M>(iterable: Iterable<V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<V> | AsyncIterable<V>) => Promise<M> | M): Promise<M[]>;
}
declare module "mapSeries" {
    export default mapSeries;
    function mapSeries<V, M>(iterable: Iterable<V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<V> | AsyncIterable<V>) => Promise<M> | M): Promise<M[]>;
}
declare module "reduce" {
    export default reduce;
    function reduce<V, A>(iterable: Iterable<V> | AsyncIterable<V>,reducer: (accumulator: A, value: V, index: number, iterable: Iterable<V> | AsyncIterable<V>) => Promise<A> | A, initial: A): Promise<A>;
    function reduce<V>(iterable: Iterable<V> | AsyncIterable<V>, reducer: (accumulator: V, value: V, index: number, iterable: Iterable<V> | AsyncIterable<V>) => Promise<V> | V): Promise<V>;
}
declare module "reduceRight" {
    export default reduceRight;
    function reduceRight<V, A>(iterable: Iterable<V> | AsyncIterable<V>,reducer: (accumulator: A, value: V, index: number, iterable: Iterable<V> | AsyncIterable<V>) => Promise<A> | A, initial: A): Promise<A>;
    function reduceRight<V>(iterable: Iterable<V> | AsyncIterable<V>, reducer: (accumulator: V, value: V, index: number, iterable: Iterable<V> | AsyncIterable<V>) => Promise<V> | V): Promise<V>;
}
declare module "sleepCancellable" {
    export default sleepCancellable;
    function sleepCancellable(amount: number): [Promise<void>, () => boolean];
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
declare module "sleep" {
    export default sleep;
    function sleep(amount: number): Promise<void>;
}
declare module "sleepPreciseCancellable" {
    export default sleepPreciseCancellable;
    function sleepPreciseCancellable(amount: number): [Promise<void>, () => boolean];
}
declare module "sleepPrecise" {
    export default sleepPrecise;
    function sleepPrecise(amount: number): Promise<void>;
}
declare module "someLimit" {
    export default someLimit;
    function someLimit<V>(iterable: Iterable<V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<V> | AsyncIterable<V>) => Promise<boolean> | boolean, queueOrConcurrency: Queue | number): Promise<boolean>;
    import Queue from "Queue";
}
declare module "some" {
    export default some;
    function some<V>(iterable: Iterable<V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<V> | AsyncIterable<V>) => Promise<boolean> | boolean): Promise<boolean>;
}
declare module "someSeries" {
    export default someSeries;
    function someSeries<V>(iterable: Iterable<V> | AsyncIterable<V>, iteratee: (value: V, index: number, iterable: Iterable<V> | AsyncIterable<V>) => Promise<boolean> | boolean): Promise<boolean>;
}
declare module "TimeoutError" {
    export default TimeoutError;
    class TimeoutError extends Error {
        constructor(message: string);
    }
}
declare module "timeout" {
    export default timeout;
    function timeout<T>(fct: () => Promise<T> | T, amount: number): Promise<T>;
}
declare module "timeoutPrecise" {
    export default timeoutPrecise;
    function timeoutPrecise<T>(fct: () => Promise<T> | T, amount: number): Promise<T>;
}
declare module "modern-async" {
    export { default as asyncIterableWrap } from "asyncIterableWrap";
    export { default as asyncRoot } from "asyncRoot";
    export { default as asyncWrap } from "asyncWrap";
    export { default as CancelledError } from "CancelledError";
    export { default as Deferred } from "Deferred";
    export { default as delay } from "delay";
    export { default as delayCancellable } from "delayCancellable";
    export { default as Delayer } from "Delayer";
    export { default as every } from "every";
    export { default as everyLimit } from "everyLimit";
    export { default as everySeries } from "everySeries";
    export { default as filter } from "filter";
    export { default as filterGenerator } from "filterGenerator";
    export { default as filterLimit } from "filterLimit";
    export { default as filterSeries } from "filterSeries";
    export { default as find } from "find";
    export { default as findIndex } from "findIndex";
    export { default as findIndexLimit } from "findIndexLimit";
    export { default as findIndexSeries } from "findIndexSeries";
    export { default as findLimit } from "findLimit";
    export { default as findSeries } from "findSeries";
    export { default as forEach } from "forEach";
    export { default as forEachLimit } from "forEachLimit";
    export { default as forEachSeries } from "forEachSeries";
    export { default as map } from "map";
    export { default as mapGenerator } from "mapGenerator";
    export { default as mapLimit } from "mapLimit";
    export { default as mapSeries } from "mapSeries";
    export { default as Queue } from "Queue";
    export { default as queueMicrotask } from "queueMicrotask";
    export { default as reduce } from "reduce";
    export { default as reduceRight } from "reduceRight";
    export { default as Scheduler } from "Scheduler";
    export { default as sleep } from "sleep";
    export { default as sleepCancellable } from "sleepCancellable";
    export { default as sleepPrecise } from "sleepPrecise";
    export { default as sleepPreciseCancellable } from "sleepPreciseCancellable";
    export { default as some } from "some";
    export { default as someLimit } from "someLimit";
    export { default as someSeries } from "someSeries";
    export { default as timeout } from "timeout";
    export { default as TimeoutError } from "TimeoutError";
    export { default as timeoutPrecise } from "timeoutPrecise";
    export { default as toArray } from "toArray";
}
