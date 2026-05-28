const fs = require('fs');
const JSON5 = require('json5');
const text = fs.readFileSync('test.json', 'utf-8');
try {
  let parsed = JSON.parse(text);
  console.log("JSON Success!");
} catch (e) {
  console.log("JSON Error:", e.message);
}
try {
  let parsed5 = JSON5.parse(text);
  console.log("JSON5 Success!");
} catch (e) {
  console.log("JSON5 Error:", e.message);
}
