const https = require("https");
const fs = require("fs");

let calls = new Array(20).fill("");

calls.forEach((item, index, array) => {
  array[index] = new Promise((resolve, reject) => {
    https.get(`https://www.rijksmuseum.nl/api/nl/collection?key=___YOUR_KEY___&format=json&ps=100&p=${index + 1}&imgonly=true`, (res) => {
      if (res.statusCode !== 200) {
        if (res.statusCode === 500) {
          // hm. some objects cannot be retireved ?!
          resolve(null);
        } else {
          reject(res.statusCode);
        }
      } else {

        let output = '';

        res.on('data', (d) => {
          output += d;
        });

        res.on('end', (d) => {
          const ids = [];
          JSON.parse(output).artObjects.forEach((object) => {
            ids.push(object.objectNumber);
          });

          resolve(ids);
        });
      }

    }).on('error', (e) => {
      reject(e);
    });
  });
});

Promise.all(calls).then((results) => {

  let timeout = 0;
  const objectCalls = [];
  results.forEach((result) => {
    result.forEach((id, index) => {
      objectCalls.push(new Promise((resolve, reject) => {
        setTimeout(() => {
          console.log(id);
          https.get(`https://www.rijksmuseum.nl/api/nl/collection/${id}?key=___YOUR_KEY___&format=json`, (res) => {
            if (res.statusCode !== 200) {
              if (res.statusCode === 500) {
                // hm. some objects cannot be retireved ?!
                resolve(null);
              } else {
                reject(res.statusCode);
              }
            } else {

              let output = '';

              res.on('data', (d) => {
                output += d;
              });

              res.on('end', (d) => {
                resolve(JSON.parse(output).artObject);
              });
            }

          }).on('error', (e) => {
            reject(e);
          });
        }, timeout);
      }));
      timeout += 200;
    });
  });

  return Promise.all(objectCalls);
}).then((results) => {

  fs.writeFileSync("./temp/items.json", JSON.stringify(results), "utf8");

}).catch((err) => {
  throw err;
});