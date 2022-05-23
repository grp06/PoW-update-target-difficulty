const client = require('./client');

client.request('queryBlockchain', [], function(err, response) {
  if(err) throw err;
  console.log(response.result); // success!
});
