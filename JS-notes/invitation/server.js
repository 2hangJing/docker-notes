const express = require("express");
const server  = require("express")();
const cors    = require("cors");

server.use(cors({ origin : "*" }));

server.use('/invitation',express.static("./web"));

server.listen(130,"0.0.0.0",()=>{ console.log("http port：130") });