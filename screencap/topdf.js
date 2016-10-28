var page = require('webpage').create();
page.viewportSize = { width: 1600, height: 1200 }

page.open('http://projects:8080/home/alec/Projects/Brookings/congressional-district-poverty/index.html', function() {
  page.render('init.pdf');


});

page.onConsoleMessage = function(msg, lineNum, sourceId) {
  page.render('./captures/'+msg+'.pdf');
};



