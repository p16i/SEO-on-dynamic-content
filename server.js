var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    spawn = require('child_process').spawn,
    port = (process.argv[2] || 8888),
    prerender = process.argv[3] || true;

var mimeTypes = {
    "htm": "text/html",
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "gif": "image/gif",
    "js": "text/javascript",
    "css": "text/css"};

var virtualDirectories = {
    //"images": "../images/"
  };

http.createServer(function(request, response) {

  var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), uri)
    , root = uri.split("/")[1]
    , virtualDirectory;

  virtualDirectory = virtualDirectories[root];
  if(virtualDirectory){
    uri = uri.slice(root.length + 1, uri.length);
    filename = path.join(virtualDirectory ,uri);
  }

  path.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      console.error('404: ' + filename);
      return;
    }

    if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        console.error('500: ' + filename);
        return;
      }

      var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
      response.writeHead(200, {"Content-Type": mimeType});

      if(prerender && mimeType === mimeTypes.html){
          phantom = spawn('phantomjs', ['render.js', filename]);

          phantom.stdout.on('data', function (data) {
              response.write(data, "utf8");
              response.end();
              console.log('200: ' + filename + ' as ' + mimeType);
          });
          phantom.stderr.on('data', function (data) {
              console.log('stderr: ' + data);
          });

          phantom.on('exit', function (code) {
              console.log('child process exited with code ' + code);
          });
      }else{
          response.write(file, "binary");
          response.end();
          console.log('200: ' + filename + ' as ' + mimeType);
      }
    });
  });
}).listen(parseInt(port, 10));


console.log("Running on http://localhost:" + port + " with pre-render " + (prerender ? 'enabled' : 'disabled') + " \nCTRL + C to shutdown");
