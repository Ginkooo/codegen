

interface Object
{
  generateCode(self : CodeGenerator);
}


class CodeGenerator
{
    ast;
	astStr : string;
    indent = 0;
    putSemicolon : boolean = true;

    self : CodeGenerator;

    constructor(ast : string)
    {
        this.ast = this.json_str_to_obj(ast);
        this.self = this;
		this.astStr = ast;
    }
	public getAstStr()
	{
		return this.astStr;
	}

    private semicolon()
    {
      return (this.putSemicolon ? ";\n" : "\n");
    }
	
	private getIncludes()
	{
		return "#include <stdio.h>\n#include <stdlib.h>\n#include <math.h>\n\n";
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
      var then : string = node.then.generateCode();
	  var _else : string = "\n" + node.else.generateCode();
	  this.putSemicolon = false;
	  return statement + then + _else;
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
		this.putSemicolon = false;
      return "Cannot resolve node " + node.node;
    }
	
	private handleWhile(node)
	{
		var statement : string = "while(" + node.cond.generateCode(this) + ")\n";
		var body : string = node.body.generateCode(this);
		this.putSemicolon = false;
		return statement + body;	
	}
	
	private handleFor(node)
	{
		var statement : string = "for(" + node.init.generateCode(this) + "; " + node.cond.generateCode(this) + "; " + node.after.generateCode(this) + ")\n";
		var body : string = node.body.generateCode(this);
		this.putSemicolon = false;
		return statement + body;
	}
	
	private handleDoWhile(node)
	{
		var beginning : string = "do\n"
		var body : string = node.body.generateCode(this);
		var ending : string = "while(" + node.cond.generateCode(this) + ")";
		return beginning + body + ending;
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
      ret += node.type + " " + node.name + "(" + this.listArgs(node.args) + ")\n";
      ret += node.body.generateCode(this);
	  this.putSemicolon = false;
      return ret;
    }
	
	private handleStruct(node)
	{
		var beginning : string = "struct " + node.name;
		var body = node.body.generateCode();
		return beginning + body;
	}

    private handleProg(node)
    {
      var code : string = "";
      code += this.handleIndent() + "{\n";
	  this.indent++;
	  this.putSemicolon = true;
      for (var i = 0; i < node.prog.length; i++)
      {

        code += this.handleIndent() + node.prog[i].generateCode(this) + this.semicolon();
      }
	  this.indent--;
      code += this.handleIndent() + "}";
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
		  case: "struct" : ret = self.handleStruct(this); break;
		  case "while" : ret = self.handleWhile(this); break;
		  case "for" : ret = self.handleFor(this); break;
		  case "dowhile" : ret = self.handleDoWhile(this); break;
		  case "if" : ret = self.handleIf(this); break;
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
	  
	  var code = this.getIncludes();
      code += this.ast.generateCode(this);
      return code;
    }
}

function main()
{
    var code_gen = new CodeGenerator('{\
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
  {"node" : "while", "cond" : {"node" : "var", "value" : "a"}, "body" : {\
  "node" : "prog",\
  "prog" : [\
  {"node" : "var", "value" : "a"}\
\
  ]}}\
    ]}}\
  ]\
  }\
	}');

var code = code_gen.generate();
console.log(code);

}


main();
