

interface Object
{
  generateCode(self : CodeGenerator);
}


class CodeGenerator
{
    ast;
    indent = 0;
    putSemicolon : boolean = true;

    self : CodeGenerator;

    constructor(ast : string)
    {
        this.ast = this.json_str_to_obj(ast);
        this.self = this;
    }

    private semicolon()
    {
      return (this.putSemicolon ? ";\n" : "");
    }

    private handleAssign(node)
    {
      return node.left.generateCode(this) + " " + node.operator + " " + node.right.generateCode(this);
    }

    private handleBinary(node)
    {
      return node.left.generateCode(this) + " " + node.operator + " " + node.right.generateCode(this);

    }

    private handleVariableOrNumOrBool(node)
    {
      if (node.type != null)
      {
        return node.type + " " + node.value;
      }
      else
      {
        return node.value;
      }
    }

    private handleIndent()
    {
      var indent = '';
      for (let i = 0; i < this.indent; i++)
      {
        indent += "  ";
      }

      return indent;
    }

    private handleIf(node)
    {
      var statement : string = "if (" + node.cond.generateCode(this) + ")\n";
      var then : string = this.han
    }

    private handleCall(node)
    {
      return node.func.generateCode(this) + "(" + this.listArgs(node.args) + ")";
    }

    private listArgs(args)
    {
      if (args.length == 0)
      {
        return "";
      }
      var ret : string = "";
      for (let i = 0; i < args.length - 1; i++)
      {
        ret += args[i].generateCode(this) + ", "
      }
      ret += args[args.length - 1].generateCode(this);

      return ret;
    }

    private handleError(node)
    {
      return "Cannot resolve node " + node.node;
    }

    private handleChr(node)
    {
      var ret : string = "";

      function whichQuotes()
      {
        if (node.value.length > 1)
          return '"';
        else
          return "'";
      }

      if (node.type != null)
      {
        ret += node.type + " ";
      }
      else
      {
        ret += whichQuotes() + node.value + whichQuotes();
      }

      return ret;
    }

    private handleFunc(node)
    {
      var ret : string = "";
      ret += node.name.type + " " + node.name.value + "(" + this.listArgs(node.args) + ")\n";
      ret += node.body.generateCode(this);
      return ret;
    }

    private handleProg(node)
    {
      var code : string = "";
      this.indent++;
      code += this.handleIndent() + "{\n";
      for (var i = 0; i < node.prog.length; i++)
      {

        code += this.handleIndent() + node.prog[i].generateCode(this) + this.semicolon();
      }
      code += this.handleIndent() + "\n}";
      this.indent = 0;
      return code;
    }


    private json_str_to_obj(ast : string)
    {
        let astObj = JSON.parse(ast);
        return astObj;
    }

    public get_ast()
    {
        return this.ast;
    }

    public generate()
    {
      Object.prototype.generateCode = function(self : CodeGenerator)
      {
        var ret : string

        switch(this.node)
        {
          case "func" : ret = self.handleFunc(this); break;
          case "chr" : ret = self.handleChr(this); break;
          case "assign": ret = self.handleAssign(this); break;
          case "binary": ret = self.handleBinary(this); break;
          case "var":
          case "num":
          case "bool": ret = self.handleVariableOrNumOrBool(this); break;
          case "prog": ret = self.handleProg(this); break;
          case "call": ret = self.handleCall(this); break;
          default: self.handleError(this);
        }        
        return ret;
      }

      var code = this.ast.generateCode(this);
      return code;
    }
}

function main()
{
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
      { "node": "binary",\
  "operator": "+",\
  "left": { "node": "var", "value": "x" },\
  "right": {\
    "node": "binary",\
    "operator": "*",\
    "left": { "node": "var", "value": "y" },\
    "right": { "node": "var", "value": "z" } } },\
      { "node": "num", "value": 1 },\
      {\
  "node": "assign",\
  "operator": "=",\
  "left": { "node": "var", "value": "a", "type" : "bool" },\
  "right": { "node": "chr", "value": "sdf" }\
}\
    ]\
  }\
  ]\
}');

var code = code_gen.generate();
console.log(code);

}


main();