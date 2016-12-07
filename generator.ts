//This interface is giving possibility to add a generateCode method to Object class
interface Object
{
  generateCode(self : CodeGenerator);
}

//There is all code generating logic in this class
class CodeGenerator
{
    ast;
	astStr : string;
    indent = 0;
    putSemicolon : boolean = true;
    putNewLine : boolean = true;
    isStructBodyDisplayed : boolean = false;

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

    private newLine()
    {
      return (this.putNewLine ? "\n" : "");
    }

    private semicolon()
    {
      return (this.putSemicolon ? ";\n" : "");
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

    private handleVarOrNumOrBool(node)
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
      var then : string = this.handleBody(node.then);
      if (node.otherwise != null)
        var _else : string = this.handleIndent() + "else\n" + this.handleBody(node.otherwise);
      else
        var _else = "";
      this.putSemicolon = false;
      return statement + then + _else;
    }

    private handleCall(node)
    {
      return node.name.generateCode(this) + "(" + this.listArgs(node.args) + ")";
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
    var body : string = this.handleBody(node.body);
		this.putSemicolon = false;
		return statement + body;
	}
	
	private handleDoWhile(node)
	{
		var beginning : string = "do\n"
		var body : string = this.handleBody(node.body);
		var ending : string = this.handleIndent() + "while(" + node.cond.generateCode(this) + ")";
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
      return ret + "\n\n";
    }

    private handleReturn(node)
    {
      if (node.value != null)
        return "return " + node.value.generateCode(this);
      else
        return "return";
    }
	
	private handleBody(node)
	{
		if (node.prog == null)
		{
			this.indent++;
			var ret : string = this.handleIndent() + node.generateCode(this) + this.semicolon();
			this.indent--;
			return ret;
		}
		else
		{
			return node.generateCode(this);
		}
	}
	
	private handleStruct(node)
	{
		var beginning : string = "struct " + node.name + "\n";
    this.putSemicolon = false;
    this.isStructBodyDisplayed = true;
		var body = node.body.generateCode(this);
    this.isStructBodyDisplayed = false;
		return beginning + body + "\n\n";
	}

    private handleProg(node)
    {
      var code : string = "";
      code += this.handleIndent() + "{\n";
      this.indent++;
      for (var i = 0; i < node.prog.length; i++)
      {    
        this.putSemicolon = true;
        this.putNewLine = true;
        code += this.handleIndent() + node.prog[i].generateCode(this);
        code += this.semicolon();
      }
	    this.indent--;
      code +=this.handleIndent() + "}" + this.putSemicolonAfterStruct() + this.newLine();
      return code;
    }

    private putSemicolonAfterStruct()
    {
      return this.isStructBodyDisplayed ? ";" : "";
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

	/*
	*Available nodes:
	*func:
	*	name : string
	*	type : type
	*	body : prog
	*struct:
	*	name : string
	*	body : prog
	*while:
	*	body : prog
	*	cond : any
	*for:
	*	init : any
	*	cond : any
	*	after : any
	*	body : prog
	*dowhile:
	*	body : prog
	*	cond : any
	*if:
	*	cond : any
	*	then : any
	*	otherwise : any
	*chr:
	*	type : char or char[]
	*	value : one or more character
	*assign:
	*	operator : =
	*	left : any
	*	right : any
	*binary:
	*	operator : + - * / % < > << >> && etc.
	*	left : any
	*	right : any
	*var:
	*	name : string
	*	type : type
	*	value : any
	*num:
	*	value : number
	*bool:
	*	name : string
	*	value : boolean
	*prog:
	*	prog : any[]
	*call:
	*	name : string
	*	args : any[]
	*return
	* value : any or none, if void function
  *
	* type - int, int[], char, char[] etc.
	*/
	
    public generate()
    {
      Object.prototype.generateCode = function(self : CodeGenerator)
      {
        var ret : string

        if (this.node == null)
          return "test";

        switch(this.node)
        {
          case "func" : ret = self.handleFunc(this); break;
		      case "struct" : ret = self.handleStruct(this); break;
		      case "while" : ret = self.handleWhile(this); break;
		      case "for" : ret = self.handleFor(this); break;
		      case "dowhile" : ret = self.handleDoWhile(this); break;
		      case "if" : ret = self.handleIf(this); break;
          case "chr" : ret = self.handleChr(this); break;
          case "assign": ret = self.handleAssign(this); break;
          case "binary": ret = self.handleBinary(this); break;
          case "var":
          case "num":
          case "bool": ret = self.handleVarOrNumOrBool(this); break;
          case "prog": ret = self.handleProg(this); break;
          case "call": ret = self.handleCall(this); break;
          case "return": ret = self.handleReturn(this); break;
          default: self.handleError(this);
        }        
        return ret;
      }
	  
	    var code = this.getIncludes();
      this.ast.forEach(ast => {
        code += ast.generateCode(this)
      });

      return code;
    }
}

function main()
{
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
