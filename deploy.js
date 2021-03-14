const ghpages = require("gh-pages")

const DIST_FOLDER = "build"

console.log(`---> deploying from folder: ${DIST_FOLDER}`)

ghpages.publish(DIST_FOLDER, function(err) {
  if (err) {
    console.log(`---> error: ${err}`)
  } else {
    console.log("---> all done.")
  }
})
