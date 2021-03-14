const ghpages = require("gh-pages")

const DIST_FOLDER = "build"
const repo_url = process.env.REPO_URL

console.log(`---> deploying from folder: ${DIST_FOLDER}`)

ghpages.publish(DIST_FOLDER, {branch: "gh-pages", repo: repo_url}, function(err) {
  if (err) {
    console.log(`---> error: ${err}`)
  } else {
    console.log("---> all done.")
  }
})
