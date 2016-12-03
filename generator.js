var CodeGenerator = (function () {
    function CodeGenerator(ast) {
        this.indent = 0;
        this.putSemicolon = true;
        this.ast = this.json_str_to_obj(ast);
        this.self = this;
    }
    CodeGenerator.prototype.semicolon = function () {
        return (this.putSemicolon ? ";\n" : "");
    };
    CodeGenerator.prototype.handleAssign = function (node) {
        return node.left.generateCode(this) + " " + node.operator + " " + node.right.generateCode(this);
    };
    CodeGenerator.prototype.handleBinary = function (node) {
        return node.left.generateCode(this) + " " + node.operator + " " + node.right.generateCode(this);
    };
    CodeGenerator.prototype.handleVariableOrNumOrBool = function (node) {
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
    };
    CodeGenerator.prototype.handleCall = function (node) {
        return node.func.generateCode(this) + "(" + this.listArgs(node.args) + ")";
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
        return "Cannot resolve node " + node.node;
    };
    CodeGenerator.prototype.handleChr = function (node) {
        var ret = "";
        function whichQuotes() {
            if (node.value.length > 1)
                return '"';
            else
                return "'";
        }
        if (node.type != null) {
            ret += node.type + " ";
        }
        else {
            ret += whichQuotes() + node.value + whichQuotes();
        }
        return ret;
    };
    CodeGenerator.prototype.handleProg = function (node) {
        var code = '#include <iostream>\n#include <math.h>\n\nusing namespace std;\n\n';
        code += "int main(int argc, char[] argv)\n";
        code += "{\n";
        this.indent++;
        for (var i = 0; i < node.prog.length; i++) {
            code += this.handleIndent() + node.prog[i].generateCode(this) + this.semicolon();
        }
        this.indent = 0;
        code += "\n}";
        return code;
    };
    CodeGenerator.prototype.json_str_to_obj = function (ast) {
        var astObj = JSON.parse(ast);
        return astObj;
    };
    CodeGenerator.prototype.get_ast = function () {
        return this.ast;
    };
    CodeGenerator.prototype.generate = function () {
        Object.prototype.generateCode = function (self) {
            var ret;
            switch (this.node) {
                case "chr":
                    ret = self.handleChr(this);
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
                    ret = self.handleVariableOrNumOrBool(this);
                    break;
                case "prog":
                    ret = self.handleProg(this);
                    break;
                case "call":
                    ret = self.handleCall(this);
                    break;
                default: self.handleError(this);
            }
            return ret;
        };
        var code = this.ast.generateCode(this);
        return code;
    };
    return CodeGenerator;
}());
function main() {
    var code_gen = new CodeGenerator('{\
  "node": "prog",\
  "prog": [\
    {\
      "node": "assign",\
      "operator": "=",\
      "left": { "node": "var", "value": "a" },\
      "right": { "node": "num", "value": 5 }\
    },\
    {\
      "node": "assign",\
      "operator": "=",\
      "left": { "node": "var", "value": "b" },\
      "right": {\
        "node": "binary",\
        "operator": "*",\
        "left": { "node": "var", "value": "a" },\
        "right": { "node": "num", "value": 2 }\
      }\
    },\
    {\
      "node": "binary",\
      "operator": "+",\
      "left": { "node": "var", "value": "a" },\
      "right": { "node": "var", "value": "b" }\
    },\
  {\
    "node": "call",\
    "func": { "node": "var", "value": "foo" },\
    "args": [\
      { "node": "var", "value": "a" },\
      { "node": "num", "value": 1 }\
    ]\
  }\
  ]\
}');
    var code = code_gen.generate();
    console.log(code);
}
main();
