//There is all code generating logic in this class
var CodeGenerator = (function () {
    function CodeGenerator(ast) {
        this.indent = 0;
        this.putSemicolon = true;
        this.putNewLine = true;
        this.isStructBodyDisplayed = false;
        this.ast = this.json_str_to_obj(ast);
        this.self = this;
        this.astStr = ast;
    }
    CodeGenerator.prototype.getAstStr = function () {
        return this.astStr;
    };
    CodeGenerator.prototype.newLine = function () {
        return (this.putNewLine ? "\n" : "");
    };
    CodeGenerator.prototype.semicolon = function () {
        return (this.putSemicolon ? ";\n" : "");
    };
    CodeGenerator.prototype.getIncludes = function () {
        return "#include <stdio.h>\n#include <stdlib.h>\n#include <math.h>\n\n";
    };
    CodeGenerator.prototype.handleAssign = function (node) {
        return node.left.generateCode(this) + " " + node.operator + " " + node.right.generateCode(this);
    };
    CodeGenerator.prototype.handleBinary = function (node) {
        return node.left.generateCode(this) + " " + node.operator + " " + node.right.generateCode(this);
    };
    CodeGenerator.prototype.handleVarOrNumOrBool = function (node) {
        if (node.type != null) {
            return node.type + " " + node.value;
        }
        else {
            return node.value;
        }
    };
    CodeGenerator.prototype.handleIndent = function () {
        var indent = '';
        for (var i = 0; i < this.indent; i++) {
            indent += "  ";
        }
        return indent;
    };
    CodeGenerator.prototype.handleIf = function (node) {
        var statement = "if (" + node.cond.generateCode(this) + ")\n";
        var then = this.handleBody(node.then);
        if (node.otherwise != null)
            var _else = this.handleIndent() + "else\n" + this.handleBody(node.otherwise);
        else
            var _else = "";
        this.putSemicolon = false;
        return statement + then + _else;
    };
    CodeGenerator.prototype.handleCall = function (node) {
        return node.name.generateCode(this) + "(" + this.listArgs(node.args) + ")";
    };
    CodeGenerator.prototype.listArgs = function (args) {
        if (args.length == 0) {
            return "";
        }
        var ret = "";
        for (var i = 0; i < args.length - 1; i++) {
            ret += args[i].generateCode(this) + ", ";
        }
        ret += args[args.length - 1].generateCode(this);
        return ret;
    };
    CodeGenerator.prototype.handleError = function (node) {
        this.putSemicolon = false;
        return "Cannot resolve node " + node.node;
    };
    CodeGenerator.prototype.handleWhile = function (node) {
        var statement = "while(" + node.cond.generateCode(this) + ")\n";
        var body = node.body.generateCode(this);
        this.putSemicolon = false;
        return statement + body;
    };
    CodeGenerator.prototype.handleFor = function (node) {
        var statement = "for(" + node.init.generateCode(this) + "; " + node.cond.generateCode(this) + "; " + node.after.generateCode(this) + ")\n";
        var body = this.handleBody(node.body);
        this.putSemicolon = false;
        return statement + body;
    };
    CodeGenerator.prototype.handleDoWhile = function (node) {
        var beginning = "do\n";
        var body = this.handleBody(node.body);
        var ending = this.handleIndent() + "while(" + node.cond.generateCode(this) + ")";
        return beginning + body + ending;
    };
    CodeGenerator.prototype.handleStr = function (node) {
        return '"' + node.value + '"';
    };
    CodeGenerator.prototype.handleChr = function (node) {
        return "'" + node.value + "'";
    };
    CodeGenerator.prototype.handleFunc = function (node) {
        var ret = "";
        ret += node.type + " " + node.name + "(" + this.listArgs(node.args) + ")\n";
        ret += node.body.generateCode(this);
        this.putSemicolon = false;
        return ret + "\n\n";
    };
    CodeGenerator.prototype.handleReturn = function (node) {
        if (node.value != null)
            return "return " + node.value.generateCode(this);
        else
            return "return";
    };
    CodeGenerator.prototype.handleBody = function (node) {
        if (node.prog == null) {
            this.indent++;
            var ret = this.handleIndent() + node.generateCode(this) + this.semicolon();
            this.indent--;
            return ret;
        }
        else {
            return node.generateCode(this);
        }
    };
    CodeGenerator.prototype.handleStruct = function (node) {
        var beginning = "struct " + node.name + "\n";
        this.putSemicolon = false;
        this.isStructBodyDisplayed = true;
        var body = node.body.generateCode(this);
        this.isStructBodyDisplayed = false;
        return beginning + body + "\n\n";
    };
    CodeGenerator.prototype.handleProg = function (node) {
        var code = "";
        code += this.handleIndent() + "{\n";
        this.indent++;
        for (var i = 0; i < node.prog.length; i++) {
            this.putSemicolon = true;
            this.putNewLine = true;
            code += this.handleIndent() + node.prog[i].generateCode(this);
            code += this.semicolon();
        }
        this.indent--;
        code += this.handleIndent() + "}" + this.putSemicolonAfterStruct() + this.newLine();
        return code;
    };
    CodeGenerator.prototype.putSemicolonAfterStruct = function () {
        return this.isStructBodyDisplayed ? ";" : "";
    };
    CodeGenerator.prototype.json_str_to_obj = function (ast) {
        var astObj = JSON.parse(ast);
        return astObj;
    };
    CodeGenerator.prototype.get_ast = function () {
        return JSON.stringify(this.ast, null, 2);
    };
    CodeGenerator.prototype.generate = function () {
        var _this = this;
        Object.prototype.generateCode = function (self) {
            var ret;
            if (this.node == null)
                return "test";
            switch (this.node) {
                case "func":
                    ret = self.handleFunc(this);
                    break;
                case "struct":
                    ret = self.handleStruct(this);
                    break;
                case "while":
                    ret = self.handleWhile(this);
                    break;
                case "for":
                    ret = self.handleFor(this);
                    break;
                case "dowhile":
                    ret = self.handleDoWhile(this);
                    break;
                case "if":
                    ret = self.handleIf(this);
                    break;
                case "chr":
                    ret = self.handleChr(this);
                    break;
                case "str":
                    ret = self.handleStr(this);
                    break;
                case "assign":
                    ret = self.handleAssign(this);
                    break;
                case "binary":
                    ret = self.handleBinary(this);
                    break;
                case "var":
                case "num":
                case "bool":
                    ret = self.handleVarOrNumOrBool(this);
                    break;
                case "prog":
                    ret = self.handleProg(this);
                    break;
                case "call":
                    ret = self.handleCall(this);
                    break;
                case "return":
                    ret = self.handleReturn(this);
                    break;
                default: self.handleError(this);
            }
            return ret;
        };
        var code = this.getIncludes();
        this.ast.forEach(function (ast) {
            code += ast.generateCode(_this);
        });
        return code;
    };
    return CodeGenerator;
}());
function main() {
    var code_gen = new CodeGenerator('[{"node":"struct","name":"myStruct","body":{"node":"prog","prog" : {}}},{\
	"node" : "func",\
	"name" : "main",\
	"type" : "int",\
	"args" : [{"node": "var", "value" : "a", "type" : "int"}],\
	"body" : {\
  "node": "prog",\
  "prog": [\
  {"node" : "while", "cond" : {"node" : "var", "value" : "a"}, "body" : {\
  "node" : "prog",\
  "prog" : [\
  {"node" : "for", "init" : {}, "cond" : {}, "after" : {}, "body" : {"node" : "var", "value": "x"}},\
  {"node" : "dowhile", "cond" : {}, "body" : {"node" : "var", "value": "x"}},\
  {"node" : "for", "init" : {}, "cond" : {}, "after" : {}, "body" : {"node" : "var", "value": "x"}},\
  {"node" : "for", "init" : {}, "cond" : {}, "after" : {}, "body" : {"node" : "for", "init" : {}, "cond" : {}, "after" : {}, "body" : {"node" : "var", "value": "x"}}},\
  {"node" : "while", "cond" : {"node" : "var", "value" : "a"}, "body" : {\
  "node" : "prog",\
  "prog" : [\
  {"node" : "var", "value" : "a"},\
	  {"node" : "if", "cond" : {"node" : "bool", "value" : "true"}, "then" : {"node" : "var", "value" : "a"}, "otherwise" : {"node" : "prog", "prog" : [\
		  {"node" : "var", "value" : "ssd"}\
	  ]}\
	  }\
\
  ]}}\
    ]}},{"node":"return", "value" : {}}\
  ]\
  }\
	},{\
	"node" : "func",\
	"name" : "main",\
	"type" : "int",\
	"args" : [{"node": "var", "value" : "a", "type" : "int"}],\
	"body" : {\
  "node": "prog",\
  "prog": [\
  {"node" : "while", "cond" : {"node" : "var", "value" : "a"}, "body" : {\
  "node" : "prog",\
  "prog" : [\
  {"node" : "for", "init" : {}, "cond" : {}, "after" : {}, "body" : {"node" : "var", "value": "x"}},\
  {"node" : "dowhile", "cond" : {}, "body" : {"node" : "var", "value": "x"}},\
  {"node" : "for", "init" : {}, "cond" : {}, "after" : {}, "body" : {"node" : "var", "value": "x"}},\
  {"node" : "for", "init" : {}, "cond" : {}, "after" : {}, "body" : {"node" : "for", "init" : {}, "cond" : {}, "after" : {}, "body" : {"node" : "var", "value": "x"}}},\
  {"node" : "while", "cond" : {"node" : "var", "value" : "a"}, "body" : {\
  "node" : "prog",\
  "prog" : [\
  {"node" : "var", "value" : "a"},\
	  {"node" : "if", "cond" : {"node" : "bool", "value" : "true"}, "then" : {"node" : "var", "value" : "a"}, "otherwise" : {"node" : "prog", "prog" : [\
		  {"node" : "var", "value" : "ssd"}\
	  ]}\
	  }\
\
  ]}}\
    ]}}\
  ]\
  }\
	}]');
    var code = code_gen.generate();
    console.log(code);
}
main();
