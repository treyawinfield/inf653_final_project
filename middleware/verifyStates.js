const stateJSONData = require('../model/states.json');

const verifyStates = (req, res, next) => {
    // Ensure parameters are received in uppercase form 
    const stateAbbrev = req.params.state.toUpperCase();

    // Array that only contains the 50 state abbreviation codes
    const stateCodes = stateJSONData.map(st => st.code);
    
    // Compare stateAbbrev parameter to statesCodes array to see if 
    // the state abbreviation exists there
    const isState = stateCodes.find(code => code === stateAbbrev);

    // If isState does not exist, send proper response
    if (!isState) {
        return res.status(400).json({ "message": "Invalid state abbreviation parameter"});
    }
    // If isState exists, attach to req and call next()
    req.params.state = stateAbbrev;
    next();
}

module.exports = verifyStates;
