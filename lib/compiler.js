var vm = require('vm');
var SourceMapFile = require('enb-source-map/lib/file');

function Compiler(runtime) {
  this.runtime = runtime;
}

exports.Compiler = Compiler;

Compiler.prototype.generate = function generate(code, options) {
  if (!options) options = {};
  if (!options.to) options.to = process.cwd();

  // It is fine to compile without templates at first
  if (!code)
    code = '';

  // Yeah, let people pass functions to us!
  if (typeof code === 'function')
    code = code.toString().replace(/^function\s*\(\)\s*{|}$/g, '');

  var exportName = options.exportName || 'BEMHTML';
  var engine = options.engine || 'BEMHTML';

  var locals = this.runtime.prototype.locals;

  var file = new SourceMapFile(options.to, { sourceMap: options.sourceMap });

  file
    .writeLine('/// -------------------------------------')
    .writeLine('/// --------- BEM-XJST Runtime Start ----')
    .writeLine('/// -------------------------------------')
    .writeLine('var ' + exportName + ' = function(module, exports) {')
    .writeContent(this.runtime.source).write(';')
    .writeLine('  return module.exports ||')
    .writeLine('      exports.' + exportName + ';')
    .writeLine('}({}, {});')
    .writeLine('/// -------------------------------------')
    .writeLine('/// --------- BEM-XJST Runtime End ------')
    .writeLine('/// -------------------------------------')
    .writeLine('')
    .writeLine('var api = new ' + engine + '(' + JSON.stringify(options) + ');')
    .writeLine('/// -------------------------------------')
    .writeLine('/// ------ BEM-XJST User-code Start -----')
    .writeLine('/// -------------------------------------')
    .writeLine('api.compile(function(' + locals.join(', ') + ') {')
    .writeFileContent(options.from, code).write(';')
    .writeLine('});')
    .writeLine('api.exportApply(exports);')
    .writeLine('/// -------------------------------------')
    .writeLine('/// ------ BEM-XJST User-code End -------')
    .writeLine('/// -------------------------------------');

  return options.sourcemap && options.sourcemap.include === false ?
    {
      content: file.getContent(),
      sourcemap: file.getSourceMap()
    } :
    file.render();
};

Compiler.prototype.compile = function compile(code, options) {
  if (!options) options = {};

  var out = this.generate(code, options);
  out = '(function(exports, console) {' + out + '})';
  var exports = {};

  var fn = options.context === 'this' ?
    vm.runInThisContext(out) :
    vm.runInNewContext(out);

  fn(exports, console);

  return exports;
};
