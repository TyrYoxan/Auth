//exemple response: { succes: true; status: 200; desc: "c'est un exemple"; body: [..]; }
export { success, error }

/** Retourne une reponse correct
 *
 * @param res
 * @param {number}status
 * @param {Object}data
 * @param {string}description
 * @returns {{success: boolean, status: *, desc: *, body: string}}
 */
function success(res, status, data, description){
    return res.status(status).json( {
        success: true,
        status: status || 200,
        desc: description || "",
        body: data || null,
        errors: null
    });
}

/** Retourne une reponse error
 *
 * @param res
 * @param {number}status
 * @param {string}description
 * @param {Object}erreur
 * @returns {{success: boolean, status, desc, body: null, errors: *}}
 */
function error(res, status, description, erreur){
    return res.status(status).json( {
        success: false,
        status: status || 404,
        desc: description || "",
        body: null,
        errors: erreur || null,
    });
}