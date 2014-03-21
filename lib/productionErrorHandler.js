var log = require('./log');

/**
 * 生产环境下的错误处理
 * @param  {obj}   error error object
 * @param  {obj}   req   request
 * @param  {obj}   res   response
 * @param  {Function} next  next handler
 * @return {null}         null
 */
module.exports = function(error, req, res, next) {
    log.error(error);
    res.status(error.status || 500);
    // respond with html page
    if (req.accepts('html')) {
        res.render('error', {url: req.url});
        return;
    }
    // respond with json
    if (req.accepts('json')) {
        res.send({ error: 'Server encounted an error.' });
        return;
    }
    // default to plain-text. send()
    res.type('txt').send('Server encounted an error.');
};