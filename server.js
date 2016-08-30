var connect = require('connect'),
    serveStatic = require('serve-static');

var app = connect();

app.use(serveStatic('docs'));
app.listen(5555);
