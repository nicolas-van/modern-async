# Changelog

## 1.0.2

* Altered UMD deployment to only support browsers that support async/await language feature. The reason is that
  bundling both regenerator-runtime and all the necessary shims is too complex. For older browsers it is easier to
  just process the lib with Babel then add regenerator-runtime and core-js.

## 1.0.1

* Fixed map, filter and forEach behavior in case of exception. Pending tasks were not cancelled in case of exception and the
  behavior in that case was not documented as opposed to other functions.

## 1.0.1

First version.
