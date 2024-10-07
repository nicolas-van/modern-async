# modern-async [![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=Meet%20this%20awesome%20library&url=https://github.com/nicolas-van/modern-async&via=nicolasvanhoren&hashtags=javascript,asyncawait,async,libraries,programming)

![logo](https://github.com/nicolas-van/modern-async/raw/master/img/facebook_cover_photo_2_680.png)

[![Github-sponsors](https://img.shields.io/badge/sponsor-30363D?logo=GitHub-Sponsors&logoColor=#EA4AAA)](https://github.com/sponsors/nicolas-van)
[![GitHub Repo stars](https://img.shields.io/github/stars/nicolas-van/modern-async?style=social)](https://github.com/nicolas-van/modern-async/stargazers)
[![Website](https://img.shields.io/website.svg?url=http%3A%2F%2Fnicolas-van.github.io%2Fmodern-async)](https://nicolas-van.github.io/modern-async)
[![Node.js CI](https://github.com/nicolas-van/modern-async/workflows/Node.js%20CI/badge.svg)](https://github.com/nicolas-van/modern-async/actions)
[![npm](https://img.shields.io/npm/v/modern-async)](https://www.npmjs.com/package/modern-async)
[![Coverage Status](https://coveralls.io/repos/github/nicolas-van/modern-async/badge.svg?branch=master)](https://coveralls.io/github/nicolas-van/modern-async?branch=master)
[![JsDelivr](https://data.jsdelivr.com/v1/package/npm/modern-async/badge)](https://www.jsdelivr.com/package/npm/modern-async)

A modern JavaScript tooling library for asynchronous operations using async/await, promises and async generators.

This library is a modernized alternative to a lot of libraries like [Async.js](https://caolan.github.io/async/v3/) that were created using the legacy callback style to handle asynchronous operations. Its goal is to be as complete as any of those libraries while being built from the very beginning with async/await and promises in mind.

[See the documentation](https://nicolas-van.github.io/modern-async).

* Exclusively uses async/await, promises and async generators in its code, tests and documentation.
* Has low bundle size.
* Has 100% code coverage.
* Bundled for ESM modules, CommonJS and UMD.
* Works in node >= 8 and in the vast majority of browsers (very old browser compatibility can be achieved using Babel and shims).
* Has Typescript support.

[![Stargazers repo roster for @nicolas-van/modern-async](https://reporoster.com/stars/nicolas-van/modern-async)](https://github.com/nicolas-van/modern-async/stargazers)

## This project accepts feature requests !

The goal of modern-async is to be as complete as possible. I coded everything I missed in the past while developing, yet it's difficult to know what other people would really need. So if you would like some more feature [the issue tracker is available](https://github.com/nicolas-van/modern-async/issues/new/choose). (Read also [the contribution guide](https://github.com/nicolas-van/modern-async/blob/master/CONTRIBUTING.md)).

## Installation

```bash
npm install --save modern-async
```

Or use [jsDelivr](https://www.jsdelivr.com/package/npm/modern-async) to get the UMD version. The content of the library will be available under the `modernAsync` global variable.

## Usage

```javascript
import { map, sleep } from 'modern-async'

const array = [1, 2, 3]
const result = await map(array, async (v) => {
  await sleep(10)
  return v * 2
})
console.log(result)
```

[See the documentation for the rest](https://nicolas-van.github.io/modern-async).

## Changelog

[The changelog](https://github.com/nicolas-van/modern-async/blob/master/CHANGELOG.md).

## Contribution Guide

[The contribution guide](https://github.com/nicolas-van/modern-async/blob/master/CONTRIBUTING.md)

## License

[The license](https://github.com/nicolas-van/modern-async/blob/master/LICENSE.md).
