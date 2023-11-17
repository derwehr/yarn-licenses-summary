const core = require('@actions/core')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const licenses = JSON.parse(core.getInput('licenses', { required: true }))

    const tableData = [
      [
        { data: 'License', header: true },
        { data: 'Packages', header: true }
      ]
    ]

    licenses.map((license, index) => {
      const packages = Object.keys(license.children).map((key, keyIndex) => {
        const packageName = key.startsWith('@')
          ? `@${key.split('@')[1]}`
          : key.split('@')[0]
        let url = license.children[key].children.vendorUrl

        if (!url) {
          if (license.children[key].children.url) {
            url = license.children[key].children.url
              .split('git+')[1]
              .split('.git')[0]
          } else {
            url = ''
          }
        }

        const packageLink = `<a href="${url}">${packageName}</a>`

        return packageLink
      })

      tableData.push([{ data: license.value }, { data: packages.join(', ') }])
    })

    await core.summary.addHeading('Licenses').addTable(tableData).write()
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
