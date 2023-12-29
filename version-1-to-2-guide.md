
# Migration guide to upgrade from version 1 to version 2

## Explanation

In version 2.X, modern-async had a major re-design of the API. This re-design occured with the following goals:

* Avoiding function naming conflict with popular libraries (notably lodash)
* Simplifying the API by removing duplicate functions
* Proposing safer default parameters regarding concurrency handling

It can be noted that version 1.X will still be supported for a reasonable amount of time regarding bug fixes.

## How to migrate ?

In order to migrate from version 1.X to version 2.X you should check the following points:

* Most functions were renamed to add an `async` prefix. Example: `map` => `asyncMap`.
* All functions that had three variants ("normal", `Limit` and `Series`) were simplified to have only 1 function. That function takes a `queueOrConcurrency` argument like the old `Limit` variant, except that argument now has a default value of `1`. Here is how to change these function calls:
    * If you used the `Limit` variant, just rename it to the new name. The arguments will remain compatible. Example: `mapLimit(a, b, concurreny)` => `asyncMap(a, b, concurreny)`.
    * If you used the `Series` variant, also rename it to the new name. The arguments will also remain compatible. Example: `mapSeries(a, b)` => `asyncMap(a, b)`.
    * If you used the "normal" variant (with unlimited concurrency), you must pass `Numbers.POSITIVE_INFINITY` as the `queueOrConcurrency` argument. Example: `map(a, b)` => `asyncMap(a, b, Number.POSITIVE_INFINITY)`. (You should also consider not using infinite concurrency anymore as it tends to be a bad idea in most real-life applications.)
