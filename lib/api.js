// Generated by CoffeeScript 1.6.3
(function() {
  var async, child_process, command_queue, fs, stream_buffers, vboxmanage_path,
    __slice = [].slice;

  fs = require('fs');

  async = require('async');

  child_process = require('child_process');

  stream_buffers = require('stream-buffers');

  vboxmanage_path = (function() {
    switch (false) {
      case !process.platform.match(/^win/):
        return path.join(process.env.VBOX_INSTALL_PATH || '', 'VBoxManage.exe');
      case !process.platform.match(/^dar/):
        return '/Applications/VirtualBox.app/Contents/MacOS/VBoxManage';
      default:
        return 'VboxManage';
    }
  })();

  command_queue = async.queue(function(task, callback) {
    return task.run(callback);
  });

  /*
  	* @param {string} command
  	* @param {array} args
  	* @param {function} callback
  */


  exports.command = function() {
    var args, callback, command, task, _i;
    command = arguments[0], args = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), callback = arguments[_i++];
    task = {
      stream: new stream_buffers.WritableStreamBuffer,
      run: function(callback) {
        var child,
          _this = this;
        args = args.filter(function(arg) {
          return arg;
        });
        child = child_process.spawn(vboxmanage_path, [command].concat(args));
        child.stdout.pipe(this.stream);
        child.stderr.pipe(this.stream);
        child.on('error', function(error) {
          return callback(error);
        });
        return child.on('close', function(code) {
          return callback(null, code, _this.stream.getContentsAsString('utf8'));
        });
      }
    };
    return command_queue.push(task, function(err, code, output) {
      if (err) {
        return callback(err);
      }
      return callback(null, code, output);
    });
  };

  /*
  	* @param {string} src
  	* @param {string} dst
  	* @param {boolean} register
  */


  exports.clonevm = function(src, dst, register) {
    if (register == null) {
      register = true;
    }
    return exports.command('clonevm', src, '--name', dst, (register ? '--register' : ''), function(err, code, output) {
      if (err) {
        return callback(err);
      }
      if (code > 0) {
        return callback(new Error("cannot clone " + src + " into " + dst));
      }
      return callback();
    });
  };

  /*
  	* @param {string} path
  	* @param {string} name
  	* @param {function(?err)} callback
  */


  exports["import"] = function(path, name, callback) {
    return exports.command('import', path, '--vsys', '0', '--vmname', name, function(err, code, output) {
      if (err) {
        return callback(err);
      }
      if (code > 0) {
        return callback(new Error("cannot import " + location + " into " + name));
      }
      return callback();
    });
  };

}).call(this);