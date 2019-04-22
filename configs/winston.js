const winston = require("winston");

function format(options) {

    var date = new Date();
    data = date.toDateString() + " " + date.toLocaleTimeString("pt-BR");

    if (options.message) {
      return (
        "[" +
        options.level.toUpperCase() +
        "   " +
        data +
        "] - " +
        options.message
      );
    } else {
      return options.message;
    }
}

module.exports = new winston.Logger({
  transports: [
    new winston.transports.File({
      name: "info-file",
      filename: "logs/" + new Date().toDateString() + " scraper-info.log",
      level: "info",
      maxsize: 100000,
      json: false,
      formatter: (options) => format(options)
    }),

    new winston.transports.File({
      name: "error-file",
      filename: "logs/" + new Date().toDateString() + " scraper-error.log",
      level: "error",
      maxsize: 100000,
      json: false,
      formatter: (options) => format(options)
    })
  ]
});
