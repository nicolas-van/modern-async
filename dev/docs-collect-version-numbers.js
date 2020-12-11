
const path = require('path')
const semverSort = require('semver-sort')
const fs = require('fs')

const mfolder = path.join(__dirname, '../docs/modern-async')

const versions = fs.readdirSync(mfolder)

const sorted = semverSort.desc(versions)

console.log('Detected versions', sorted)

const toStore = {
  versions: sorted
}

fs.writeFileSync(path.join(__dirname, '../docs/versions.json'), JSON.stringify(toStore), {
  encoding: 'utf8'
})
