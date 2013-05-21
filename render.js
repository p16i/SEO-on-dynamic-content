var system = require('system'),
    fs = require('fs'),
    page = new WebPage(),
    url = system.args[1],
    result;


page.open(url, function (status) {

    if (status !== 'success') {
      console.log('FAILED to load the url');
      phantom.exit();
    } else {

        result = page.evaluate(function(){
            var html, doc;

            html = document.querySelector('html');

            return html.outerHTML;
        });

        console.log(result);

    }
    phantom.exit();
});
