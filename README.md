# modern-async

[![Node.js CI](https://github.com/nicolas-van/modern-async/workflows/Node.js%20CI/badge.svg)](https://github.com/nicolas-van/modern-async/actions) [![npm](https://img.shields.io/npm/v/modern-async)](https://www.npmjs.com/package/modern-async) [![](https://data.jsdelivr.com/v1/package/npm/modern-async/badge)](https://www.jsdelivr.com/package/npm/modern-async)

A modern JavaScript tooling library for asynchronous operations using async/await and promises.

This library is a modernized alternative to a lot of libraries like [Async.js](https://caolan.github.io/async/v3/) that were created using the legacy callback style to handle asynchronous operations. Its goal is to be as complete as any of those libraries while being built from the very beginning with async/await and promises in mind.

[See the documentation](https://nicolas-van.github.io/modern-async).

* Exclusively uses async/await and promises in its code, tests and documentation.
* Has almost no dependencies.
* Has 100% code coverage.
* Bundled for ESM modules, CommonJS and UMD.
* Works in node >= 10.0 and in the vast majority of browsers (if using Babel or the UMD version).

## This project accepts feature requests !

The goal of modern-async is to be as complete as possible. I coded everything I missed in the past while developing, yet it's difficult to know what other people would really need. So if you would like some more feature start by [reading the contribution guide](https://github.com/nicolas-van/modern-async/blob/master/CONTRIBUTING.md).

## Installation

```bash
npm install --save modern-async
```

Or use [jsDelivr](https://www.jsdelivr.com/package/npm/modern-async).

## Usage

```javascript
import { map, asyncRoot, sleep } from 'modern-async'

// or

const { map, asyncRoot, sleep } = require('modern-async')

asyncRoot(async () => {
  const array = [1, 2, 3]
  const result = await map(array, async (v) => {
    await sleep(10)
    return v * 2
  })
  console.log(result)
})
```

[See the documentation for the rest](https://nicolas-van.github.io/modern-async).

## License

[See the license here](https://github.com/nicolas-van/modern-async/blob/master/LICENSE.md)
