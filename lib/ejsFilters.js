var moment = require('moment');

module.exports = function(ejs) {

    ejs.filters.dateFormat = function(date, format) {
        return moment(date).format(format);
    };
};