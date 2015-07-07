<a name="eliza.module_ElizaData"></a>
## ElizaData
Based on Norbert Landsteiner's ElizaBot (http://www.masswerk.at/elizabot/)
ported to node.js by tar 2015.

// data for elizabot.js
// entries prestructured as layed out in Weizenbaum's description 
// [cf: Communications of the ACM, Vol. 9, #1 (January 1966): p 36-45.]

**Author:** tar  

* [ElizaData](#eliza.module_ElizaData)
  * [.Initials](#eliza.module_ElizaData.Initials) : <code>Array</code>
  * [.Finals](#eliza.module_ElizaData.Finals) : <code>Array</code>
  * [.Quits](#eliza.module_ElizaData.Quits) : <code>Array</code>
  * [.Pres](#eliza.module_ElizaData.Pres) : <code>Array</code>
  * [.Posts](#eliza.module_ElizaData.Posts) : <code>Array</code>
  * [.Synons](#eliza.module_ElizaData.Synons) : <code>Object</code>
  * [.PostTransforms](#eliza.module_ElizaData.PostTransforms) : <code>Array</code>

<a name="eliza.module_ElizaData.Initials"></a>
### ElizaData.Initials : <code>Array</code>
Initial sentences used when starting a conversation

**Kind**: static property of <code>[ElizaData](#eliza.module_ElizaData)</code>  
<a name="eliza.module_ElizaData.Finals"></a>
### ElizaData.Finals : <code>Array</code>
Final sentences used when ending a conversation

**Kind**: static property of <code>[ElizaData](#eliza.module_ElizaData)</code>  
<a name="eliza.module_ElizaData.Quits"></a>
### ElizaData.Quits : <code>Array</code>
Things to say when exiting.

**Kind**: static property of <code>[ElizaData](#eliza.module_ElizaData)</code>  
<a name="eliza.module_ElizaData.Pres"></a>
### ElizaData.Pres : <code>Array</code>
Prefixes?

**Kind**: static property of <code>[ElizaData](#eliza.module_ElizaData)</code>  
<a name="eliza.module_ElizaData.Posts"></a>
### ElizaData.Posts : <code>Array</code>
Post-fixes?

**Kind**: static property of <code>[ElizaData](#eliza.module_ElizaData)</code>  
<a name="eliza.module_ElizaData.Synons"></a>
### ElizaData.Synons : <code>Object</code>
Synonyms to add variance to the sentences to make them less canned.

**Kind**: static property of <code>[ElizaData](#eliza.module_ElizaData)</code>  
<a name="eliza.module_ElizaData.PostTransforms"></a>
### ElizaData.PostTransforms : <code>Array</code>
regexp/replacement pairs to be performed as final cleanings
here: cleanings for multiple bots talking to each other

**Kind**: static property of <code>[ElizaData](#eliza.module_ElizaData)</code>  
