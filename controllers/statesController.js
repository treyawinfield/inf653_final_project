// Import data
const State = require('../model/State');
const statesJSONData = require('../model/states.json');

const getAllStates = async (req, res) => {
    // Query parameter 
    const { contig } = req.query;

    // Holds results of query 
    let statesList = statesJSONData;

    // Return noncontiguous states
    if (contig === 'false') {
        statesList = statesJSONData.filter(st => st.code === 'AK' || st.code === 'HI');
        console.log(statesList.length);
        return res.json(statesList);
    }
    // Return contiguous states
    if (contig === 'true') {
        statesList = statesJSONData.filter(st => st.admission_number < 49);
        console.log(statesList.length);
        return res.json(statesList);
    }
    
    // Get all the state data documents from MongoDB
    const mongoStates = await State.find();

    // Loop through statesList array
    statesList.forEach(state => {
        // 1) Attempt to find the state from MongoDB states results
        const stateExists = mongoStates.find(st => st.stateCode === state.code);
     
        // 2) If the state is in the results, attach 'funfact' property to the state object
        if(stateExists) {
            // Attach the funfacts with dot notation
            state.funfact = [...stateExists.funfact];
        }
    })
    res.json(statesList);
}

const getState = async (req, res) => {    
    // URL parameter sent in GET request
    const stateReq = req.params.state;

    // Find the requested state data in the statesJSONData
    const stateRes = statesJSONData.find(state => state.code === stateReq);

    // Get all the state data documents from MongoDB 
    const mongoStates = await State.find();
    
    // Determine whether state exists in MongoDB collection
    const stateExists = mongoStates.find(st => st.stateCode === stateRes.code);
    
    // Attach the funfacts from MongoDB if they exist
    if(stateExists) {
        stateRes.funfact = [...stateExists.funfact]; 
    }
    res.json(stateRes);
}

const getStateCapital = (req, res) => {
    // Get the URL parameter
    const stateParam = req.params.state;

    // Find the specified state from the states.json data
    const stateExists = statesJSONData.find(state => state.code === stateParam);
    
    // Get the state name and capital
    const stateName = stateExists.state;
    const capitalName = stateExists.capital_city;

    // Create a response with the state name and capital
    res.json({ stateName, capitalName });
}

const getStateNickname = (req, res) => {
    // Get the URL parameter
    const stateParam = req.params.state;

    // Find the specified state from the states.json data
    const stateExists = statesJSONData.find(state => state.code === stateParam);
    
    // Get the state name and capital
    const stateName = stateExists.state;
    const nickname = stateExists.nickname;

    // Create a response with the state name and capital
    res.json({ stateName, nickname });
}

const getStatePopulation = (req, res) => {
    // Get the URL parameter
    const stateParam = req.params.state;

    // Find the specified state from the states.json data
    const stateExists = statesJSONData.find(state => state.code === stateParam);
    
    // Get the state name and capital
    const stateName = stateExists.state;
    const population = stateExists.population;

    // Create a response with the state name and capital
    res.json({ stateName, population });
}

const getStateAdmission = (req, res) => {
    // Get the URL parameter
    const stateParam = req.params.state;

    // Find the specified state from the states.json data
    const stateExists = statesJSONData.find(state => state.code === stateParam);
    
    // Get the state name and capital
    const stateName = stateExists.state;
    const admissionDate = stateExists.admission_date;

    // Create a response with the state name and capital
    res.json({ stateName, admissionDate });
}

module.exports = {
    getAllStates, 
    getState, 
    getStateCapital,
    getStateNickname, 
    getStatePopulation,
    getStateAdmission
}