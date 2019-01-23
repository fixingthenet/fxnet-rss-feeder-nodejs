//http://millermedeiros.github.io/mdoc/examples/node_api/doc/repl.htm
//https://node.readthedocs.io/en/latest/api/readline/

import app from './app';

var ctx={models: app.models};
var _ = 'new';
var resolver = function(code) {
    // TODO: Log the answer in a database
    try {
        var result = eval(code)
        if (result && result.then) {
            //console.log("then detected");
            result.then(function(res) {
                //console.log("resolved",res)
                _ = res
            }).catch(function(error){
                //console.log("error:",error)
                _ = error
            })
        } else {
            //console.log("non then:", result)
            _ = result
        }
        console.log(_)
    } catch(e) {
        console.log(e)
    }
}

const repl = require('repl'),
      fs = require('fs'),
      pjson = require('../package.json')

app.start(false).then(() => {
    console.log("ctx.models is your friend")

    var readline = require('readline');

    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true
    });

    rl.setPrompt(`${pjson.name}> `);
    rl.prompt();

    rl.on('line', function(line) {
        switch(line.trim()) {
        case 'exit':
            rl.close()
            break;
        default:
            resolver(line)
            break;
        }
        rl.prompt();
    })
    rl.on('close', function() {
        console.log('Have a great day!');
        process.exit(0);
    });


})

// console.log(app)
// app.start(false).then(() => {
//  const replServer = repl.start({
//    prompt: `${pjson.name}> `
//  });

//  replServer.context.models = app.models;
//  //const servicesPath = './app/services/';
//  //fs.readdir(servicesPath, (err, files) => {
//  //   files.forEach(file => {
//  //  	replServer.context[`${file.split('.')[0]}Service`] = require(`${servicesPath}${file}`);
//  //  });
//  //});
// });
