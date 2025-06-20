@preprocessor typescript

MAIN -> FUNC:* {% id %}
FUNC -> "一、" (PARAMS "を以" {% id %}):? IDENT "之儀" _ STATEMENTS _ IDENT "之儀仍如件" _ {% (d,l,r) => {
	if(d[2] != d[7]) return r;
	return {type: "func", params: d[1] ?? [], name: d[2], body: d[5]}
} %}

PARAMS -> (TYPE IDENT "、" {% d => d %}):* TYPE IDENT {% d => [...d[0], d.slice(1)].map(x => ({dtype: x[0], name: x[1]})) %}

TYPE -> "数" {% id %} | "文句" {% id %} | "陰陽" {% id %}

STATEMENTS -> (STATEMENT_WITH_TE {% id %} | STATEMENT_WITH_KOTO {% id %}):* STATEMENT {% d => [...d[0], d[1]] %}
STATEMENT_WITH_TE -> STATEMENT "て" _ {% d => d[0] %}


STATEMENT ->
  "如斯御座候" {% d => ({type: "none"}) %}
| VALUE "を差戻し候" {% d => ({type: "return", value: d[0]}) %}
| FUNC_CALL_ITASHI "候" {% id %}
| (VALUE "と云" {% id %} | "或" {% d => null %}) TYPE "をして" IDENT "と致し候" {% d => ({type: "declare", dtype: d[1], name: d[3], value: d[0]}) %}
| (VALUE "をして" {% id %} | FUNC_CALL_SITE {% id %}) IDENT "と致し候" {% d => ({type: "assign", name: d[1], value: d[0]}) %}

STATEMENT_WITH_KOTO ->
  IF_STATEMENT {% id %}
| FOR_STATEMENT {% id %}
| WHILE_STATEMENT {% id %}


IF_STATEMENT -> "若" CONDITION_EXPRESSION "候ハヽ" _ STATEMENTS ("て" _ "不然若" _ CONDITION_EXPRESSION "候ハヽ" _ STATEMENTS {% d => ({cond: d[4], body: d[7]}) %}):* ("て" _ "不然" _ STATEMENTS {% d => d[4] %}):? "事" _ {% d => {
  const conds = [{cond: d[1], body: d[4]}];
  if(d[5]) conds.push(...d[5]);
  return {type: "if", conds, else: d[6]};
} %}

FOR_STATEMENT -> "毎々" TYPE IDENT "を" VALUE "ゟ" VALUE "迄" FUNC_CALL_ITASHI "候乍" _ STATEMENTS "事" _ {% d => ({type: "for", dtype: d[1], name: d[2], init: d[4], end: d[6], call: d[8], body: d[11]}) %}

WHILE_STATEMENT -> CONDITION_EXPRESSION "候限" _ STATEMENTS "事" _ {% d => ({type: "while", cond: d[0], body: d[3]}) %}

FUNC_CALL_SITE -> (ARGS "を以"):? ("足し" | "引き" | "掛け" | "割り" | IDENT "之儀をして") {% d => ({type: "call", args: d[0] ? d[0][0] : [], funcname: d[1][0]}) %}
FUNC_CALL_ITASHI -> (ARGS "を以"):? ("足し" | "引き" | "掛け" | "割り" | IDENT "之儀を致し") {% d => ({type: "call", args: d[0] ? d[0][0] : [], funcname: d[1][0]}) %}

ARGS -> (VALUE "、" {% id %}):* VALUE {% d => [...d[0], d[1]] %}

VALUE ->
  BOOL_LITERAL {% id %}
| STRING_LITERAL {% id %}
| IDENT {% d => ({type: "ident", value: d[0]}) %}
| CONDITION_EXPRESSION "候や否や" {% id %}
| FUNC_CALL_ITASHI "候段" {% id %}

CONDITION_EXPRESSION ->
  COMPARISON_EXPRESSION "候且" COMPARISON_EXPRESSION   {% d => ({type: "and", left: d[0], right: d[2]}) %}
| COMPARISON_EXPRESSION "候又ハ" COMPARISON_EXPRESSION {% d => ({type: "or", left: d[0], right: d[2]}) %}
| COMPARISON_EXPRESSION "候ニ非"                       {% d => ({type: "not", value: d[0]}) %}
| COMPARISON_EXPRESSION {% id %}

COMPARISON_EXPRESSION ->
  VALUE "、" VALUE "に御座"     {% d => ({type: "eq", left: d[0], right: d[2]}) %}
| VALUE "、" VALUE "に無御座"   {% d => ({type: "ne", left: d[0], right: d[2]}) %}
| VALUE "、" VALUE "ゟ大に御座" {% d => ({type: "gt", left: d[0], right: d[2]}) %}
| VALUE "、" VALUE "ゟ小に御座" {% d => ({type: "lt", left: d[0], right: d[2]}) %}
| VALUE "、" VALUE "以上に御座" {% d => ({type: "ge", left: d[0], right: d[2]}) %}
| VALUE "、" VALUE "以下に御座" {% d => ({type: "le", left: d[0], right: d[2]}) %}
| VALUE "に御座"   {% id %}

BOOL_LITERAL ->
  "陰" {% d => ({type: "bool", value: false}) %}
| "陽" {% d => ({type: "bool", value: true}) %}

STRING_LITERAL -> "〽" .:* {% d => ({type: "string", value: d[1].join("")}) %}

IDENT -> [^\s〽、陰陽儀或]:+ {% d => d[0].join("") %}

_ -> [\s]:*     {% d => null %}
