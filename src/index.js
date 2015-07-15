'use strict';

let spawn = require('child_process').spawn,
  Promise = Promise || require('q').Promise;

let args = require('./args');

function iptabler(options) {
  let iptable = {

    _args: [],

    _cmd: 'iptables',

    sudo() {
      iptable._args.unshift(iptable._cmd);
      iptable._cmd = 'sudo';
      return iptable;
    },

    exec(callback) {
      return Promise((resolve, reject) => {
        let cmd = spawn(iptable._cmd, iptable._args),
          stderr = '',
          stdout = '';

        cmd.stdout.on('data', (data) => {
          stdout += data;
        });

        cmd.stderr.on('data', (data) => {
          stderr += data;
        });

        cmd.on('close', (code) => {
          if (code !== 0) {
            reject(new Error(stderr));
            if (callback)
              return callback(new Error(stderr));
          }
          resolve(stdout);
          if (callback)
            return callback(null, stdout);
        });
      });
    }
  };

  args.forEach((arg) => {
    arg.names.forEach((name) => {
      iptable[name] = (val) => {
        iptable._args.push(arg.arg, val);
        return iptable;
      };
    });
  });

  for (var o in options) {
    iptable[o](options[o]);
  }

  return iptable;
}

module.exports = iptabler;
