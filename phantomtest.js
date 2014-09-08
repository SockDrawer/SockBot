console.log('Loading a web page');
var page = require('webpage').create();
var url = 'http://what.thedailywtf.com/';
page.open(url, function (status) {
  //Page is loaded!
  console.log(status);
  phantom.exit();
});