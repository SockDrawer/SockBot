## Functions
<dl>
<dt><a href="#readFile">readFile(path, callback)</a></dt>
<dd><p>Read and parse configuration File from disc</p>
</dd>
<dt><a href="#readComplete">readComplete([err], body)</a></dt>
<dd><p>Read File Callback</p>
</dd>
</dl>
<a name="readFile"></a>
## readFile(path, callback)
Read and parse configuration File from disc

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | File Path of file to read |
| callback | <code>[readComplete](#readComplete)</code> | Completion callback |

<a name="readComplete"></a>
## readComplete([err], body)
Read File Callback

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [err] | <code>Exception</code> | <code></code> | Error encountered processing request |
| body | <code>Object</code> |  | YAML parsed response body. If invalid YAML will be `undefined` |

