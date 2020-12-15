/* eslint-disable */

new Promise((resolve) => {
  $(resolve)
}).then(() => {
  'use strict'

  // style

  const style = `
.version-selector {
  position: absolute;
  top: 110px;
  text-align: center;
  padding: 0 10px 20px;
  width: 100%;
}

.version-selector > span {
  font-size: 10px;
  color: white;
}

.version-selector select {
  border: 0;
  border-radius: 5px;
  font-family: 'body';
  font-size: 8px;
  padding: 3px 10px;
  width: 80px;
}
  `

  function getCurrentVersion() {
    const path = window.location.pathname;
    return path.match(/\d\.\d\.\d(?:[^\/]*)/)[0]
  }

  // components

  const App = {
    template: `
<div class="version-selector">
  <span>Version:</span>
  <select v-model="selected" @change="onChange">
    <option v-for="version in libversions">
      {{ version }}
    </option>
  </select>
</div>
    `,
    data: () => ({
      selected: getCurrentVersion(),
      libversions: []
    }),
    async mounted () {
      const res = await axios.get('../../versions.json')
      const versionsDesc = res.data
      this.libversions = versionsDesc.versions
    },
    methods: {
      onChange () {
        const newUrl = window.location.href.replace(/\d\.\d\.\d(?:[^\/]*).*$/, this.selected)
        window.location = newUrl
      }
    }
  }

  const sb = document.querySelector(".search-box")

  console.log(sb)

  const rootDiv = document.createElement('div')
  sb.parentElement.insertBefore(rootDiv, sb)

  // style
  const styleElem = document.createElement('style')
  styleElem.innerHTML = style
  document.querySelector('head').appendChild(styleElem)

  new Vue({
    el: rootDiv,
    template: '<App/>',
    components: { App }
  })

})
