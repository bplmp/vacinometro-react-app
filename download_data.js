const request = require("request");
const fs = require("fs");

const baseUrl = "https://vacinometro.s3.amazonaws.com/vacinometro/exports"
const files = [
  "projections.json",
  "latest.json",
  // "updated_at.json",
  // "milestones.json",
]


function getJsonAndSave(file) {
  request({
    url: `${baseUrl}/${file}`,
    json: true
  }, function(error, response, body) {
    // console.log(body)
    fs.writeFile(`src/components/data/${file}`, JSON.stringify(body), (err) => {
      if (err) {
        throw err
      }
      console.log(`${file} ✅ Downaloaded and saved! ${new Date()}`)
    })
  });
}

for (var file of files) {
  getJsonAndSave(file)
}
