# runlikenpm

`runlikenpm` spawns commands much like npm would, but without running npm.

Typical use under [`gulp`][gulp]:

    var gulp = require('gulp');
    var run = require('@garthk/runlikenpm');

    gulp.task('babel', run('babel -r -s inline src -d dist'));

`run` with a single argument returns a function that takes a callback;
`gulp.task` calls it. Boom.

## Usage

    run(command)            # returns function taking callback
    run(command)(callback)  # spawns and calls back
    run(command, callback)  # spawns and calls back

`run` will:

* Throw an assertion error if its arguments are unexpected types;
* Spawn the command under the guidance of the appropriate shell;
* Let its output hit your terminal on the fly without buffering until exit;
* Not modify your `process.env` or current working directory; and
* Call back only once.

## Why, oh why?

First, I assume we need [`gulp`][gulp], having pushed the use of
[npm as a build tool][Kirkel] as far as we could. Seriously, give it a shot.
There are limits, but they're further out than you expect.

Still here? Me, too. I wanted:

* To shell out to commands to keep my `gulpfile.js` small, vs
  [long pipeline boilerplate][boilerplate]; with
* Behaviour similar to [`npm run-script`][run-script]; especially
* The [path] adjusted so we can run scripts in `node_modules/.bin`; and
* Everything still working on Windows; but
* Without having to shell out *through* `npm` to get that.

TL;DR: I couldn't find anything that did both, either amongst:

* `gulp` plugins
* Packages that don't have `gulp` in their name

### Alternative gulp plugins

Yes, we should [use packages directly][guidelines] rather than writing yet
another gulp plugin destined for the [blacklist]. That said: sometimes the code
to do so gets [long enough][boilerplate] we're at risk of endless duplication of
bad code for which we can't ship bug-fixes.

Anyone else trying to solve the problem of writing clean looking gulpfiles
is probably going to ship it with `gulp` in the name, so that's how I searched.
Options I found before giving up due to exhaustion in the face of 1500 plugins:

* [`gulp-exec`](https://www.npmjs.com/package/gulp-exec/) (blessed over the
  others by the [blacklist])
* [`gulp-run`](https://www.npmjs.com/package/gulp-run`)
* [`gulp-shell`](https://github.com/sun-zheng-an/gulp-shell)
* [`gulp-spawn`](https://www.npmjs.com/package/gulp-spawn/)

They all wear the `gulp` prefix because they're designed to hook up standard
input and output to [`vinyl`](https://www.npmjs.com/package/vinyl) streams.
I don't need that. If you do, submit bug reports for their Windows handling and
use whomever gets it right first.

`gulp-exec` and `gulp-spawn` don't fix the path ([#19] and [#11] respectively).
`gulp-run` does, but not always on Windows because it [hard-codes the
environment variable name][L32] as `PATH`, when it might be `Path`. `gulp-shell`
[has the same problem][L28]. None of them set `windowsVerbatimArguments` so that
`PATHEXT` will work. I lost interest before checking to see whether any of them
take `comspec` into account.

### Alternative regular packages

Outside the `gulp` universe, I found:

* [`cross-spawn`](https://www.npmjs.com/package/cross-spawn): very popular,
  supports shebangs, escapes arguments, has good tests; but you'll need to break
  up the arguments yourself and deal with the `EventEmitter` API

* [`exec`](https://www.npmjs.com/package/exec): also popular, but no Windows
  support, calls back with strings for `stdout` and `stderr` instead of letting
  them write to the TTY

* Many others along the same lines

## Scope Restrictions

* **No streaming.** Use the alternatives above if you
  don't need Windows support.

* **No promises.** You can promisify it yourself using your favourite package.

* **No environment variables from your package configuration.** I think you're
  best off spawning `npm run` in this case. It'll be slower, but why take the
  risk on a third party re-implementation of that functionality?

## Dependencies

I'm taking a dependency on Tim Oxley's
[`npm-path`](https://www.npmjs.com/package/npm-path) to fix the path.

## Caveats

* I no longer have a Windows box handy on which to test.

* I'm worried the check for `process.env.comspec` is hard-coded for lower case.
  I'll leave it for now, as `npm` itself seems to share the limitation.

[#11]: https://github.com/hparra/gulp-spawn/issues/11
[#19]: https://github.com/robrich/gulp-exec/issues/19
[Kirkel]: http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/
[L28]: https://github.com/sun-zheng-an/gulp-shell/blob/master/index.js#L28
[L32]: https://github.com/cbarrick/gulp-run/blob/master/lib/command.js#L32
[boilerplate]: https://github.com/gulpjs/gulp/blob/master/docs/recipes/browserify-uglify-sourcemap.md
[blacklist]: https://github.com/gulpjs/plugins/blob/master/src/blackList.json
[guidelines]: https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md
[gulp]: http://gulpjs.com
[path]: https://docs.npmjs.com/misc/scripts#path
[run-script]: https://docs.npmjs.com/cli/run-script
