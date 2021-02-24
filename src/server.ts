import http from "http";

const PORT = process.env.PORT || 8080;

http
  .createServer((_req, res) => {
    res.write("Hello World!");
    res.end();
  })
  .listen(PORT);
